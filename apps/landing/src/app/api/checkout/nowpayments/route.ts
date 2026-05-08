import { NextResponse } from "next/server";

// [NOWPAYMENTS_INTEGRATION] /app/api/checkout/nowpayments/route.ts
// Creates a hosted invoice on https://api.nowpayments.io/v1/invoice and
// returns { invoice_url } for client-side redirect.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CheckoutBody = {
  plan?: string;
  pay_currency?: string;
};

const PLAN_PRICES_USD: Record<string, number> = {
  free: 0,
  "self-serve": 29,
  team: 99,
  concierge: 1200,
};

const PLAN_LABELS: Record<string, string> = {
  free: "Pagewright — Free trial",
  "self-serve": "Pagewright — Self-serve plan",
  team: "Pagewright — Team plan",
  concierge: "Pagewright — Concierge setup",
};

function appUrlFromRequest(request: Request) {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`.replace(/\/$/, "");
}

export async function POST(request: Request) {
  let body: CheckoutBody = {};
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    body = {};
  }

  const plan = (body.plan ?? "self-serve").toLowerCase();
  const amount = PLAN_PRICES_USD[plan];
  if (typeof amount !== "number") {
    console.warn(
      `[NOWPAYMENTS_INTEGRATION] unknown plan='${plan}', returning 400`,
    );
    return NextResponse.json(
      { error: `unknown plan: ${plan}` },
      { status: 400 },
    );
  }

  if (amount <= 0) {
    console.warn(
      `[NOWPAYMENTS_INTEGRATION] plan='${plan}' is free, redirecting to brief form`,
    );
    return NextResponse.json(
      { invoice_url: `${appUrlFromRequest(request)}/#send`, plan, amount },
      { status: 200 },
    );
  }

  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  if (!apiKey) {
    console.warn(
      "[NOWPAYMENTS_INTEGRATION] NOWPAYMENTS_API_KEY missing in env; cannot create invoice",
    );
    return NextResponse.json(
      {
        error: "missing_env",
        message:
          "NOWPAYMENTS_API_KEY is not configured on the server. Add it to /opt/prin7r-deploys/landing-pages-on-demand/.env and restart the container.",
      },
      { status: 503 },
    );
  }

  const baseUrl = appUrlFromRequest(request);
  const orderId = `pagewright-${plan}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const payload = {
    price_amount: amount,
    price_currency: "usd",
    pay_currency: body.pay_currency ?? "usdttrc20",
    ipn_callback_url: `${baseUrl}/api/webhooks/nowpayments`,
    order_id: orderId,
    order_description: PLAN_LABELS[plan] ?? `Pagewright — ${plan}`,
    success_url: `${baseUrl}/?order=${orderId}&status=success`,
    cancel_url: `${baseUrl}/?order=${orderId}&status=cancelled`,
    is_fixed_rate: false,
    is_fee_paid_by_user: false,
  };

  console.log(
    `[NOWPAYMENTS_INTEGRATION] creating invoice plan='${plan}' amount=$${amount} order='${orderId}'`,
  );

  let response: Response;
  try {
    response = await fetch("https://api.nowpayments.io/v1/invoice", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error(
      `[NOWPAYMENTS_INTEGRATION] network error talking to NOWPayments: ${(err as Error).message}`,
    );
    return NextResponse.json(
      { error: "upstream_unreachable", message: (err as Error).message },
      { status: 502 },
    );
  }

  const text = await response.text();
  let data: Record<string, unknown> = {};
  try {
    data = JSON.parse(text) as Record<string, unknown>;
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    console.error(
      `[NOWPAYMENTS_INTEGRATION] HTTP ${response.status} from NOWPayments: ${text.slice(0, 500)}`,
    );
    return NextResponse.json(
      {
        error: "upstream_error",
        status: response.status,
        upstream: data,
      },
      { status: 502 },
    );
  }

  const invoiceUrl =
    typeof data.invoice_url === "string" ? (data.invoice_url as string) : "";
  const invoiceId =
    typeof data.id === "string" || typeof data.id === "number"
      ? String(data.id)
      : "";

  if (!invoiceUrl) {
    console.error(
      `[NOWPAYMENTS_INTEGRATION] NOWPayments returned no invoice_url; payload=${text.slice(0, 500)}`,
    );
    return NextResponse.json(
      { error: "no_invoice_url", upstream: data },
      { status: 502 },
    );
  }

  console.log(
    `[NOWPAYMENTS_INTEGRATION] invoice created id='${invoiceId}' url='${invoiceUrl}'`,
  );

  return NextResponse.json({
    invoice_url: invoiceUrl,
    invoice_id: invoiceId,
    order_id: orderId,
    plan,
    amount,
    currency: "usd",
  });
}
