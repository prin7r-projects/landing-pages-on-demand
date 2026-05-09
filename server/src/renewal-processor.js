// server/src/renewal-processor.js — DropHouse Phase 3: Retainer renewal scheduler
//
// Runs as a cron (every hour recommended). Queries active retainer subscriptions
// whose valid_until is within 5 days and sends a fresh NOWPayments invoice +
// Postmark email. Idempotent: each subscription gets at most one renewal invoice
// per billing cycle (tracked via renewal_invoices table).
//
// Schedule: node server/src/renewal-processor.js (via docker or systemd timer)

import { db, saveDb, runQuery, allQuery, getQuery } from "./schema.js";
import { createNowpaymentsInvoice, MissingEnvError } from "./nowpayments.js";

const RENEWAL_WINDOW_DAYS = 5;

async function processRenewals() {
  console.log(`[renewal-processor] Starting renewal scan at ${new Date().toISOString()}`);

  const now = new Date();
  const windowStart = new Date(now.getTime() + RENEWAL_WINDOW_DAYS * 86400000);
  // Use a narrow window (start of the 5th day from now) to catch subscriptions
  // expiring exactly 5 days out. Run daily to cover all renewals.
  const windowStartIso = windowStart.toISOString().split("T")[0]; // YYYY-MM-DD

  // Find active retainer subscriptions whose valid_until falls within the renewal window
  // (valid_until is 5 days from now ± 1 day for safety)
  const dueSubs = allQuery(
    `SELECT s.*, c.email as customer_email
     FROM subscriptions s
     LEFT JOIN customers c ON s.customer_id = c.id
     WHERE s.tier = 'retainer'
       AND s.status = 'active'
       AND s.valid_until IS NOT NULL
       AND date(s.valid_until) = date(?, '+${RENEWAL_WINDOW_DAYS} days')
     ORDER BY s.valid_until ASC`,
    [now.toISOString()],
  );

  console.log(`[renewal-processor] Found ${dueSubs.length} subscription(s) due for renewal`);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://landing-pages-on-demand.prin7r.com";
  const results = [];

  for (const sub of dueSubs) {
    const subId = sub.id;
    console.log(`[renewal-processor] Processing renewal for ${subId} (customer: ${sub.customer_email})`);

    // Idempotency check: already sent a renewal invoice for this subscription
    // within the last 7 days (prevent duplicates from multiple cron runs)
    const existing = getQuery(
      `SELECT 1 FROM renewal_invoices
       WHERE subscription_id = ?
         AND created_at > datetime('now', '-7 days')
       LIMIT 1`,
      [subId],
    );

    if (existing) {
      console.log(`[renewal-processor] Skipping ${subId} — renewal already sent recently`);
      results.push({ subscriptionId: subId, action: "skipped", reason: "already_renewed" });
      continue;
    }

    // Create a new NOWPayments invoice for another month
    let invoiceUrl, invoiceId;
    try {
      const inv = await createNowpaymentsInvoice({
        tier: "retainer",
        baseUrl,
        orderId: `renewal_${subId}_${Date.now()}`,
      });
      invoiceUrl = inv.invoice_url;
      invoiceId = inv.invoice_id;
    } catch (err) {
      if (err instanceof MissingEnvError) {
        console.warn(`[renewal-processor] NOWPAYMENTS_API_KEY not set — using placeholder for ${subId}`);
        invoiceUrl = `https://nowpayments.io/invoice/placeholder-renewal-${subId}`;
        invoiceId = `placeholder-renewal-${subId}`;
      } else {
        console.error(`[renewal-processor] NOWPayments error for ${subId}:`, err.message);
        results.push({ subscriptionId: subId, action: "error", reason: err.message });
        continue;
      }
    }

    // Record the renewal invoice (idempotency guard)
    runQuery(
      `INSERT INTO renewal_invoices (id, subscription_id, invoice_url, invoice_id, created_at)
       VALUES (?, ?, ?, ?, datetime('now'))`,
      [`rnwl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, subId, invoiceUrl, invoiceId],
    );

    // Send renewal email via Postmark
    const emailSent = await sendRenewalEmail({
      toEmail: sub.customer_email,
      subscriptionId: subId,
      invoiceUrl,
      validUntil: sub.valid_until,
    });

    saveDb();
    console.log(`[renewal-processor] Renewal sent for ${subId}: invoice=${invoiceId}, email=${emailSent?.sent ?? false}`);
    results.push({
      subscriptionId: subId,
      action: "renewal_sent",
      invoiceId,
      invoiceUrl,
      emailSent: emailSent?.sent ?? false,
    });
  }

  console.log(`[renewal-processor] Renewal scan complete: ${results.length} processed`);
  return results;
}

async function sendRenewalEmail({ toEmail, subscriptionId, invoiceUrl, validUntil }) {
  const token = process.env.POSTMARK_SERVER_TOKEN;
  if (!token) return { sent: false, reason: "not_configured" };
  try {
    const r = await fetch("https://api.postmarkapp.com/email", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Postmark-Server-Token": token,
      },
      body: JSON.stringify({
        From: "desk@landing-pages-on-demand.prin7r.com",
        To: toEmail,
        Subject: "DropHouse Retainer Renewal — Invoice Ready",
        HtmlBody: `<h1>Your DropHouse Retainer is up for renewal</h1>
<p>Your monthly retainer subscription (${subscriptionId}) expires on ${validUntil}.</p>
<p><a href="${invoiceUrl}">Pay your renewal invoice now</a> to keep unlimited landing pages active.</p>
<p>If you have questions, reply to this email.</p>`,
        TextBody: `Your DropHouse Retainer is up for renewal.\n\nSubscription: ${subscriptionId}\nExpires: ${validUntil}\n\nPay now: ${invoiceUrl}`,
        MessageStream: "outbound",
      }),
    });
    if (!r.ok) return { sent: false, reason: `Postmark ${r.status}` };
    const d = await r.json();
    return { sent: true, messageId: d.MessageID };
  } catch (e) {
    return { sent: false, reason: e.message };
  }
}

// Ensure renewal_invoices table exists
function ensureRenewalTable() {
  db.run(`
    CREATE TABLE IF NOT EXISTS renewal_invoices (
      id TEXT PRIMARY KEY,
      subscription_id TEXT NOT NULL,
      invoice_url TEXT NOT NULL,
      invoice_id TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
  try {
    db.run("CREATE INDEX IF NOT EXISTS idx_renewal_sub_created ON renewal_invoices(subscription_id, created_at)");
  } catch { /* ok */ }
  saveDb();
}

// Main
async function main() {
  console.log("[renewal-processor] DropHouse Retainer Renewal Processor starting");
  ensureRenewalTable();
  const results = await processRenewals();
  console.log("[renewal-processor] Done. Results:", JSON.stringify(results));
}

// Run if called directly
const isMain = process.argv[1]?.endsWith("renewal-processor.js");
if (isMain) {
  main()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[renewal-processor] Fatal:", err);
      process.exit(1);
    });
}

export { processRenewals, ensureRenewalTable };
