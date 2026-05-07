import { NextResponse } from "next/server";
import crypto from "node:crypto";

// [NOWPAYMENTS_WEBHOOK] /app/api/webhooks/nowpayments/route.ts
// Verifies NOWPayments IPN signature using HMAC-SHA512 over the
// alphabetically-sorted JSON body, signed with NOWPAYMENTS_IPN_SECRET.
//
// Reference: https://documenter.getpostman.com/view/7907941/S1a32n38
// Header: x-nowpayments-sig
// Algorithm: HMAC-SHA512 of JSON.stringify(sortObject(payload)) with the IPN secret.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sortObject(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortObject);
  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortObject((value as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }
  return value;
}

function timingSafeEqualHex(left: string, right: string) {
  const a = left.trim().toLowerCase();
  const b = right.trim().toLowerCase();
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
  } catch {
    return false;
  }
}

function verifySignature(
  payload: unknown,
  signature: string | null,
  secret: string,
) {
  if (!signature) return false;
  const sorted = JSON.stringify(sortObject(payload));
  const expected = crypto
    .createHmac("sha512", secret.trim())
    .update(sorted)
    .digest("hex");
  return timingSafeEqualHex(expected, signature);
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  let payload: Record<string, unknown> = {};
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    console.warn("[NOWPAYMENTS_WEBHOOK] non-JSON body received");
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const secret = process.env.NOWPAYMENTS_IPN_SECRET;
  if (!secret) {
    console.warn(
      "[NOWPAYMENTS_WEBHOOK] NOWPAYMENTS_IPN_SECRET not set; rejecting webhook",
    );
    return NextResponse.json(
      { ok: false, error: "ipn_secret_missing" },
      { status: 503 },
    );
  }

  const signature = request.headers.get("x-nowpayments-sig");
  const verified = verifySignature(payload, signature, secret);

  const status =
    typeof payload.payment_status === "string"
      ? (payload.payment_status as string)
      : "";
  const orderId =
    typeof payload.order_id === "string"
      ? (payload.order_id as string)
      : typeof payload.payment_id === "string"
        ? (payload.payment_id as string)
        : "unknown";

  if (!verified) {
    console.warn(
      `[NOWPAYMENTS_WEBHOOK] signature mismatch for order='${orderId}' status='${status}'`,
    );
    return NextResponse.json({ ok: false, error: "bad_signature" }, { status: 401 });
  }

  console.log(
    `[NOWPAYMENTS_WEBHOOK] verified IPN order='${orderId}' status='${status}'`,
  );

  // TODO(wave-3): persist order state, fulfil entitlement, send receipt email.
  // For Wave 2 we acknowledge the webhook so NOWPayments stops retrying.

  return NextResponse.json({
    ok: true,
    order_id: orderId,
    status,
  });
}
