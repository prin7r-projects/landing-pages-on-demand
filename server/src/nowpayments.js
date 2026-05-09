// server/src/nowpayments.js — NOWPayments checkout + IPN helpers (Phase 3)
import crypto from "node:crypto";

export function nowpaymentsApiBase() {
  const sandbox = (process.env.NOWPAYMENTS_SANDBOX ?? "false").toLowerCase() === "true";
  return sandbox ? "https://api-sandbox.nowpayments.io" : "https://api.nowpayments.io";
}

export async function createNowpaymentsInvoice({ tier, baseUrl, orderId }) {
  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  if (!apiKey) throw new MissingEnvError("NOWPAYMENTS_API_KEY");

  const config = {
    single: { price: 99, label: "DropHouse Single — one landing page" },
    retainer: { price: 499, label: "DropHouse Retainer — unlimited landing pages (monthly)" },
  };
  const cfg = config[tier];
  if (!cfg) throw new Error(`Unknown tier: ${tier}`);

  const apiBase = nowpaymentsApiBase();
  const response = await fetch(`${apiBase}/v1/invoice`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": apiKey },
    body: JSON.stringify({
      price_amount: cfg.price,
      price_currency: "usd",
      order_id: orderId,
      order_description: cfg.label,
      ipn_callback_url: `${baseUrl}/api/webhooks/nowpayments`,
      success_url: `${baseUrl}/?order=${orderId}&status=paid`,
      cancel_url: `${baseUrl}/?order=${orderId}&status=cancelled`,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`NOWPayments invoice creation failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  return { invoice_url: data.invoice_url, invoice_id: data.invoice_id ?? data.id };
}

export function verifyNowpaymentsIpn(payload, signature, secret) {
  if (!signature || !secret) return false;
  const sorted = JSON.stringify(sortObject(payload));
  const expected = crypto.createHmac("sha512", secret.trim()).update(sorted).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

function sortObject(value) {
  if (Array.isArray(value)) return value.map(sortObject);
  if (value && typeof value === "object") {
    return Object.keys(value).sort().reduce((result, key) => {
      result[key] = sortObject(value[key]);
      return result;
    }, {});
  }
  return value;
}

export class MissingEnvError extends Error {
  constructor(envName) {
    super(`Missing environment variable: ${envName}`);
    this.envName = envName;
  }
}
