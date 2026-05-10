// server/src/index.js — DropHouse Phase 3: Payments + Notion + first paying customer
import { Hono } from "hono";
import { cors } from "hono/cors";
import { db, saveDb, runQuery, allQuery, getQuery } from "./schema.js";
import { z } from "zod";
import crypto from "node:crypto";
import {
  createNowpaymentsInvoice,
  verifyNowpaymentsIpn,
  MissingEnvError,
} from "./nowpayments.js";

const app = new Hono();

// CORS — allow same-origin and configured frontends
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

// =============================================================================
// Prompt injection detection (Phase 4)
// =============================================================================

const INJECTION_PATTERNS = [
  /^\s*(?:SYSTEM|System|system)\s*:/m,
  /\b(?:ignore|forget|disregard)\s+(?:all\s+)?(?:previous|prior|earlier|above)\s+(?:instructions?|directives?|commands?)\b/i,
  /\byou\s+are\s+now\b/i,
  /\bDAN\s*:/i,
  /\bjailbreak\b/i,
  /\bpretend\s+(?:you\s+are|to\s+be)\b/i,
  /^(?:Assistant|Human|User)\s*:/im,
  /\boverride\s+(?:system|safety|instructions?)\b/i,
  /\bnew\s+instructions?\s*:/i,
  /\bact\s+as\s+(?:if\s+)?(?:you\s+are|a)\b/i,
  /\byour\s+(?:true|real|actual)\s+(?:purpose|goal|objective)\s+is\b/i,
];

function checkForInjection(text) {
  if (typeof text !== "string" || !text) return null;
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      return { pattern: pattern.source };
    }
  }
  // Check for excessive repetition (prompt flooding)
  const words = text.toLowerCase().split(/\s+/);
  const wordCounts = {};
  for (const w of words) {
    if (w.length > 3) {
      wordCounts[w] = (wordCounts[w] || 0) + 1;
      if (wordCounts[w] > 30) return { pattern: "excessive_repetition", word: w };
    }
  }
  return null;
}

function validateBriefNoInjection(validated) {
  const textFields = ["businessName", "audience", "valueProp", "primaryCta", "tone", "paletteHint"];
  for (const field of textFields) {
    const value = validated[field];
    if (value) {
      const result = checkForInjection(value);
      if (result) {
        return { field, ...result };
      }
    }
  }
  // Also check brandAssets if it's a string
  if (typeof validated.brandAssets === "string") {
    const result = checkForInjection(validated.brandAssets);
    if (result) return { field: "brandAssets", ...result };
  }
  return null;
}

// =============================================================================
// Validation schemas
// =============================================================================

const briefSchema = z.object({
  businessName: z.string().min(1),
  email: z.string().email(),
  audience: z.string().min(1),
  valueProp: z.string().min(1),
  primaryCta: z.string().min(1),
  tone: z.string().min(1),
  paletteHint: z.string().optional(),
  customDomain: z.string().min(1),
  brandId: z.string().optional(),
  brandAssets: z.any().optional(),
});

const reviseSchema = z.object({
  patches: z.object({
    copy: z.any().optional(),
    brand: z.any().optional(),
    press: z.any().optional(),
  }),
});

const checkoutSchema = z.object({
  tier: z.enum(["single", "retainer"]),
  email: z.string().email().optional(),
  referralCode: z.string().optional(),
});

const adminSubscriptionSchema = z.object({
  customerEmail: z.string().email(),
  tier: z.enum(["single", "retainer"]),
  referralCode: z.string().optional(),
});

// =============================================================================
// Helpers
// =============================================================================

/** Admin auth — constant-time Bearer token comparison */
function adminAuth(c) {
  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey) {
    return c.json({ error: { code: "not_configured", message: "ADMIN_API_KEY not set" } }, 503);
  }
  const authHeader = c.req.header("Authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (token.length !== adminKey.length) {
    return c.json({ error: { code: "unauthorized" } }, 401);
  }
  let mismatch = 0;
  for (let i = 0; i < token.length; i++) {
    mismatch |= token.charCodeAt(i) ^ adminKey.charCodeAt(i);
  }
  if (mismatch !== 0) {
    return c.json({ error: { code: "unauthorized" } }, 401);
  }
  return null;
}

function idemHash(email, tier) {
  return crypto
    .createHash("sha256")
    .update(`${email}|${tier}|${Math.floor(Date.now() / 3600000)}`)
    .digest("hex");
}

function briefIdemHash(brief) {
  return crypto
    .createHash("sha256")
    .update(`${brief.email}|${brief.businessName}|${brief.customDomain}|${brief.audience}|${brief.valueProp}|${Math.floor(Date.now() / 3600000)}`)
    .digest("hex");
}

async function sendOnboardingEmail({ toEmail, subscriptionId, tier, dashboardUrl }) {
  const token = process.env.POSTMARK_SERVER_TOKEN;
  if (!token) return { sent: false, reason: "not_configured" };
  const tierLabel = tier === "single" ? "Single ($99)" : "Retainer ($499/mo)";
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
        Subject: `Welcome to DropHouse — ${tierLabel}`,
        HtmlBody: `<h1>Welcome to DropHouse</h1><p>Your ${tierLabel} subscription is active.</p><p><a href="${dashboardUrl}">Go to your dashboard</a></p><p>Subscription: <code>${subscriptionId}</code></p>`,
        TextBody: `Welcome to DropHouse!\n\nYour ${tierLabel} subscription is active.\nDashboard: ${dashboardUrl}\nSubscription: ${subscriptionId}`,
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

async function syncToNotion({ subscriptionId, tier, customerEmail, referralCode }) {
  const token = process.env.NOTION_TOKEN;
  const dbId = process.env.NOTION_DROPHOUSE_DSID;
  if (!token || !dbId) return { synced: false, reason: "not_configured" };
  try {
    const props = {
      "Subscription ID": { title: [{ text: { content: subscriptionId } }] },
      Tier: { select: { name: tier } },
      Email: { email: customerEmail },
      Status: { select: { name: "Active" } },
      "Created At": { date: { start: new Date().toISOString() } },
    };
    if (referralCode) {
      props["Referral Code"] = { rich_text: [{ text: { content: referralCode } }] };
    }
    const r = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({ parent: { database_id: dbId }, properties: props }),
    });
    if (!r.ok) return { synced: false, reason: `Notion ${r.status}` };
    const d = await r.json();
    return { synced: true, notionPageId: d.id };
  } catch (e) {
    return { synced: false, reason: e.message };
  }
}

// =============================================================================
// API Routes — Briefs (Phase 1-2)
// =============================================================================

// POST /api/briefs (3.1)
app.post("/api/briefs", async (c) => {
  try {
    const body = await c.req.json();
    const validated = briefSchema.parse(body);

    // Phase 4: Prompt injection check
    const injection = validateBriefNoInjection(validated);
    if (injection) {
      return c.json({ error: "Brief rejected: possible prompt injection", detail: injection }, 400);
    }

    // Idempotency check: deduplicate identical briefs within the same hour.
    const idem = briefIdemHash(validated);
    const existing = getQuery(
      "SELECT response_payload FROM idempotency_keys WHERE idem_hash = ? AND created_at > datetime('now','-1 hour') LIMIT 1",
      [idem],
    );
    if (existing) {
      console.log(`[briefs] idempotent_replay ${validated.email} ${validated.businessName}`);
      return c.json(JSON.parse(existing.response_payload), 200);
    }

    // Create or find customer by email
    let customer = getQuery("SELECT * FROM customers WHERE email = ?", [validated.email]);
    if (!customer) {
      const customerId = `cust_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      runQuery(
        `INSERT INTO customers (id, email, created_at) VALUES (?, ?, datetime('now'))`,
        [customerId, validated.email],
      );
      customer = { id: customerId };
    }

    const briefId = `brief_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const estimatedCompleteAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    runQuery(
      `INSERT INTO briefs (id, customer_id, brand_id, payload, custom_domain, status) VALUES (?, ?, ?, ?, ?, 'queued')`,
      [briefId, customer.id, validated.brandId || null, JSON.stringify(validated), validated.customDomain],
    );
    saveDb();

    const response = { briefId, statusUrl: `/api/briefs/${briefId}`, estimatedCompleteAt };

    // Cache idempotency response.
    try {
      runQuery(
        "INSERT INTO idempotency_keys (id, idem_hash, idem_key, response_payload) VALUES (?, ?, ?, ?)",
        [`idem_${Date.now()}`, idem, `${validated.email}|${validated.businessName}`, JSON.stringify(response)],
      );
      saveDb();
    } catch { /* non-fatal — duplicate idem_hash wins */ }

    return c.json(response, 201);
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
});

// GET /api/briefs/:id (3.2)
app.get("/api/briefs/:id", (c) => {
  const briefId = c.req.param("id");
  const brief = getQuery("SELECT * FROM briefs WHERE id = ?", [briefId]);
  if (!brief) return c.json({ error: "Brief not found" }, 404);

  const runs = allQuery("SELECT * FROM brief_runs WHERE brief_id = ?", [briefId]);
  const passResults = allQuery(
    `SELECT pr.* FROM pass_results pr JOIN brief_runs br ON pr.run_id = br.id WHERE br.brief_id = ?`,
    [briefId],
  );
  const deployedSite = getQuery("SELECT * FROM deployed_sites WHERE brief_id = ?", [briefId]);

  return c.json({ ...brief, payload: JSON.parse(brief.payload), runs, passResults, deployedSite });
});

// POST /api/briefs/:id/revise (3.3)
app.post("/api/briefs/:id/revise", async (c) => {
  try {
    const briefId = c.req.param("id");
    const body = await c.req.json();
    const validated = reviseSchema.parse(body);

    const brief = getQuery("SELECT * FROM briefs WHERE id = ?", [briefId]);
    if (!brief) return c.json({ error: "Brief not found" }, 404);

    const runId = `run_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    runQuery("INSERT INTO brief_runs (id, brief_id, started_at) VALUES (?, ?, datetime('now'))", [runId, briefId]);

    if (validated.patches.brand) {
      runQuery("INSERT INTO pass_results (id, run_id, pass_kind, status, started_at) VALUES (?, ?, 'brand', 'success', datetime('now'))",
        [`pass_${Date.now()}`, runId]);
    }
    if (validated.patches.copy) {
      runQuery("INSERT INTO pass_results (id, run_id, pass_kind, status, started_at) VALUES (?, ?, 'copy', 'success', datetime('now'))",
        [`pass_${Date.now()}`, runId]);
    }
    if (validated.patches.press) {
      runQuery("INSERT INTO pass_results (id, run_id, pass_kind, status, started_at) VALUES (?, ?, 'press', 'success', datetime('now'))",
        [`pass_${Date.now()}`, runId]);
    }
    saveDb();

    return c.json({ message: "Revision triggered", runId });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
});

// POST /api/briefs/:id/approve (3.4)
app.post("/api/briefs/:id/approve", (c) => {
  const briefId = c.req.param("id");
  const brief = getQuery("SELECT * FROM briefs WHERE id = ?", [briefId]);
  if (!brief) return c.json({ error: "Brief not found" }, 404);
  runQuery(`UPDATE briefs SET status = 'deploy' WHERE id = ?`, [briefId]);
  saveDb();
  return c.json({ message: "Deploy triggered" });
});

// =============================================================================
// Phase 2: Digest builder
// =============================================================================

export function buildDigest(customerId, { topN = 5, since = null } = {}) {
  const customer = getQuery("SELECT * FROM customers WHERE id = ?", [customerId]);
  if (!customer) return null;

  const briefs = allQuery(
    `SELECT b.*, ds.url as live_url, ds.gh_repo
     FROM briefs b
     LEFT JOIN deployed_sites ds ON ds.brief_id = b.id
     WHERE b.customer_id = ?
     ORDER BY b.created_at DESC`,
    [customerId],
  );

  const brands = allQuery(
    "SELECT * FROM brands WHERE customer_id = ? ORDER BY created_at DESC",
    [customerId],
  );

  // Group briefs by tone (interest topic)
  const topics = {};
  for (const brief of briefs) {
    const payload = JSON.parse(brief.payload || "{}");
    const tone = payload.tone || "general";
    if (!topics[tone]) {
      topics[tone] = { tone, briefs: [] };
    }
    topics[tone].briefs.push({
      id: brief.id,
      businessName: payload.businessName || "Untitled",
      status: brief.status,
      customDomain: brief.custom_domain,
      liveUrl: brief.live_url || null,
      audience: payload.audience || "",
      valueProp: payload.valueProp || "",
      createdAt: brief.created_at,
      liveAt: brief.live_at || null,
    });
  }

  // Top-N per topic
  const topicSummaries = Object.values(topics).map((topic) => ({
    tone: topic.tone,
    count: topic.briefs.length,
    topBriefs: topic.briefs.slice(0, topN),
  }));

  const digest = {
    customerId,
    customerEmail: customer.email,
    generatedAt: new Date().toISOString(),
    totalBriefs: briefs.length,
    totalBrands: brands.length,
    briefsByStatus: briefs.reduce((acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    }, {}),
    topics: topicSummaries,
    recentBriefs: briefs.slice(0, topN).map((b) => {
      const p = JSON.parse(b.payload || "{}");
      return {
        id: b.id,
        businessName: p.businessName || "Untitled",
        status: b.status,
        tone: p.tone || "general",
        createdAt: b.created_at,
      };
    }),
    brands: brands.slice(0, topN).map((b) => ({
      id: b.id,
      name: b.name,
      fontPair: b.font_pair,
      createdAt: b.created_at,
    })),
  };

  return digest;
}

// GET /api/digests/:customerId — latest digest; auto-builds if none or stale
app.get("/api/digests/:customerId", (c) => {
  const customerId = c.req.param("customerId");
  const customer = getQuery("SELECT 1 FROM customers WHERE id = ?", [customerId]);
  if (!customer) return c.json({ error: "Customer not found" }, 404);

  // Return latest stored digest if within 6 hours
  const latest = getQuery(
    "SELECT digest_json FROM digests WHERE customer_id = ? ORDER BY sent_at DESC LIMIT 1",
    [customerId],
  );
  if (latest) {
    const existing = JSON.parse(latest.digest_json);
    const age = Date.now() - new Date(existing.generatedAt).getTime();
    if (age < 6 * 3600000) {
      return c.json(existing);
    }
  }

  // Build fresh digest
  const digest = buildDigest(customerId);
  if (!digest) return c.json({ error: "Customer not found" }, 404);

  // Store it
  runQuery(
    "INSERT INTO digests (id, customer_id, digest_json, sent_at) VALUES (?, ?, ?, datetime('now'))",
    [`dgst_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, customerId, JSON.stringify(digest)],
  );
  saveDb();

  return c.json(digest);
});

// =============================================================================
// Phase 3: POST /api/checkout/nowpayments (3.5)
// =============================================================================

app.post("/api/checkout/nowpayments", async (c) => {
  try {
    const v = checkoutSchema.parse(await c.req.json());
    const email = (v.email ?? "").toLowerCase().trim();
    const referralCode = v.referralCode ?? null;

    // Idempotency
    if (email) {
      const hash = idemHash(email, v.tier);
      const cached = getQuery(
        "SELECT response_payload FROM idempotency_keys WHERE idem_hash = ? AND created_at > datetime('now','-1 hour') LIMIT 1",
        [hash],
      );
      if (cached) {
        console.log(`[checkout] idempotent_replay ${email} ${v.tier}`);
        return c.json(JSON.parse(cached.response_payload), 200);
      }
    }

    // Upsert customer
    let customerId = null;
    if (email) {
      const ex = getQuery("SELECT id FROM customers WHERE email = ?", [email]);
      if (ex) {
        customerId = ex.id;
        if (referralCode) {
          runQuery("UPDATE customers SET agency_partner_code = ? WHERE id = ?", [referralCode, customerId]);
        }
      } else {
        customerId = `cust_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        runQuery("INSERT INTO customers (id, email, agency_partner_code) VALUES (?,?,?)", [customerId, email, referralCode]);
      }
    }

    // Create subscription (pending)
    const subId = `sub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    runQuery("INSERT INTO subscriptions (id, customer_id, tier, status, briefs_remaining) VALUES (?,?,?,'pending',?)",
      [subId, customerId, v.tier, v.tier === "single" ? 1 : null]);
    saveDb();

    // Create NOWPayments invoice
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://landing-pages-on-demand.prin7r.com";
    let invoiceUrl, invoiceId;
    try {
      const inv = await createNowpaymentsInvoice({ tier: v.tier, baseUrl, orderId: subId });
      invoiceUrl = inv.invoice_url;
      invoiceId = inv.invoice_id;
    } catch (err) {
      if (err instanceof MissingEnvError) {
        invoiceUrl = `https://nowpayments.io/invoice/placeholder-${subId}`;
        invoiceId = `placeholder-${subId}`;
      } else {
        return c.json({ error: { code: "nowpayments_unavailable" } }, 502);
      }
    }

    const payload = { invoice_url: invoiceUrl, invoice_id: invoiceId, subscriptionId: subId, tier: v.tier };

    // Cache idempotency
    if (email) {
      try {
        runQuery("INSERT INTO idempotency_keys (id, idem_hash, idem_key, response_payload) VALUES (?,?,?,?)",
          [`idem_${Date.now()}`, idemHash(email, v.tier), `${email}|${v.tier}`, JSON.stringify(payload)]);
        saveDb();
      } catch { /* non-fatal */ }
    }

    return c.json(payload, 201);
  } catch (e) {
    if (e.name === "ZodError") return c.json({ error: { code: "validation_error", message: e.message } }, 400);
    return c.json({ error: { code: "internal", message: e.message } }, 500);
  }
});

// =============================================================================
// Phase 3: POST /api/webhooks/nowpayments (3.6)
// =============================================================================

app.post("/api/webhooks/nowpayments", async (c) => {
  const secret = process.env.NOWPAYMENTS_IPN_SECRET;
  if (!secret) return c.json({ error: "missing_env", missing: "NOWPAYMENTS_IPN_SECRET" }, 503);

  let payload;
  try {
    payload = await c.req.json();
  } catch {
    return c.json({ error: "invalid_payload", message: "Body was not valid JSON." }, 400);
  }

  if (!verifyNowpaymentsIpn(payload, c.req.header("x-nowpayments-sig"), secret)) {
    console.log(`[webhook] sig_invalid order_id=${payload.order_id ?? "?"}`);
    return c.json({ error: "signature_invalid" }, 401);
  }

  const status = String(payload.payment_status ?? "");
  const paid = ["finished", "confirmed"].includes(status.toLowerCase());
  const orderId = String(payload.order_id ?? payload.payment_id ?? "");

  // Idempotency
  if (
    getQuery("SELECT 1 FROM payment_events WHERE subscription_id = ? AND payment_status = ? LIMIT 1", [orderId, status])
  ) {
    return c.json({ ok: true, verified: true, paid, order_id: orderId, status, idempotent: true });
  }

  runQuery(
    "INSERT INTO payment_events (id, subscription_id, payment_status, nowpayments_invoice_id, raw_payload, created_at) VALUES (?,?,?,?,?,datetime('now'))",
    [`pevt_${Date.now()}`, orderId, status, String(payload.invoice_id ?? ""), JSON.stringify(payload)],
  );
  saveDb();

  let activated = false;
  if (paid) {
    const sub = getQuery("SELECT * FROM subscriptions WHERE id = ?", [orderId]);
    if (sub) {
      runQuery("UPDATE subscriptions SET status = 'active', valid_until = datetime('now','+1 month') WHERE id = ?", [orderId]);
      saveDb();

      let email = "";
      if (sub.customer_id) {
        const cust = getQuery("SELECT email FROM customers WHERE id = ?", [sub.customer_id]);
        email = cust?.email ?? "";
      }

      const dashUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://landing-pages-on-demand.prin7r.com";
      if (email) {
        sendOnboardingEmail({ toEmail: email, subscriptionId: orderId, tier: sub.tier, dashboardUrl: `${dashUrl}/dashboard` }).catch(() => {});
        syncToNotion({ subscriptionId: orderId, tier: sub.tier, customerEmail: email, referralCode: null }).catch(() => {});
      }
      activated = true;
    }
  }

  return c.json({ ok: true, verified: true, paid, order_id: orderId, status, activated });
});

// =============================================================================
// Phase 3: Admin Subscriptions
// =============================================================================

app.post("/api/admin/subscriptions", async (c) => {
  const ae = adminAuth(c);
  if (ae) return ae;
  try {
    const v = adminSubscriptionSchema.parse(await c.req.json());
    const email = v.customerEmail.toLowerCase().trim();

    let customerId;
    const ex = getQuery("SELECT id FROM customers WHERE email = ?", [email]);
    if (ex) {
      customerId = ex.id;
      if (v.referralCode) runQuery("UPDATE customers SET agency_partner_code = ? WHERE id = ?", [v.referralCode, customerId]);
    } else {
      customerId = `cust_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      runQuery("INSERT INTO customers (id, email, agency_partner_code) VALUES (?,?,?)", [customerId, email, v.referralCode ?? null]);
    }

    const subId = `sub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    runQuery(
      "INSERT INTO subscriptions (id, customer_id, tier, status, briefs_remaining, valid_until) VALUES (?,?,?,'active',?,datetime('now','+1 month'))",
      [subId, customerId, v.tier, v.tier === "single" ? 1 : null],
    );
    saveDb();

    const dashUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://landing-pages-on-demand.prin7r.com";
    sendOnboardingEmail({ toEmail: email, subscriptionId: subId, tier: v.tier, dashboardUrl: `${dashUrl}/dashboard` }).catch(() => {});
    syncToNotion({ subscriptionId: subId, tier: v.tier, customerEmail: email, referralCode: v.referralCode ?? null }).catch(() => {});

    return c.json({
      subscriptionId: subId, tier: v.tier, status: "active", customerEmail: email,
      briefsRemaining: v.tier === "single" ? 1 : null,
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString(),
    }, 201);
  } catch (e) {
    if (e.name === "ZodError") return c.json({ error: { code: "validation_error", message: e.message } }, 400);
    return c.json({ error: { code: "internal", message: e.message } }, 500);
  }
});

app.get("/api/admin/subscriptions", (c) => {
  const ae = adminAuth(c);
  if (ae) return ae;
  return c.json(
    allQuery("SELECT s.*, c.email as customer_email FROM subscriptions s LEFT JOIN customers c ON s.customer_id = c.id ORDER BY s.created_at DESC"),
  );
});

// =============================================================================
// Other routes
// =============================================================================

app.post("/api/account/cancel", async (c) => {
  try {
    const { subscriptionId } = await c.req.json();
    if (subscriptionId) {
      runQuery("UPDATE subscriptions SET status = 'cancelled' WHERE id = ?", [subscriptionId]);
      saveDb();
    }
    return c.json({ message: "Subscription cancelled" });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
});

app.get("/api/preview/:token", (c) => c.html("<html><body><h1>Preview</h1></body></html>"));

app.post("/api/admin/briefs/:id/retry", (c) => {
  const ae = adminAuth(c);
  if (ae) return ae;
  const briefId = c.req.param("id");
  if (!getQuery("SELECT 1 FROM briefs WHERE id = ?", [briefId])) return c.json({ error: "Not found" }, 404);
  runQuery("UPDATE briefs SET status = 'queued' WHERE id = ?", [briefId]);
  saveDb();
  return c.json({ message: "Retry triggered" });
});

app.get("/health", (c) => c.json({ status: "ok", service: "drophouse", version: "0.3.0", phase: "3" }));

app.get("/api", (c) =>
  c.json({
    message: "DropHouse API",
    version: "0.3.0",
    phase: "3",
    endpoints: {
      health: "GET /health",
      briefs: "POST /api/briefs · GET /api/briefs/:id",
      revise: "POST /api/briefs/:id/revise",
      approve: "POST /api/briefs/:id/approve",
      checkout: "POST /api/checkout/nowpayments",
      webhook: "POST /api/webhooks/nowpayments",
      cancel: "POST /api/account/cancel",
      preview: "GET /api/preview/:token",
      adminSubscriptions: "POST /api/admin/subscriptions · GET /api/admin/subscriptions",
      adminRetry: "POST /api/admin/briefs/:id/retry",
    },
  }),
);

export default app;

// Start if run directly
const isMain = process.argv[1]?.endsWith("index.js");
if (isMain) {
  (async () => {
    const { serve } = await import("@hono/node-server");
    const port = parseInt(process.env.PORT || "4000", 10);
    console.log(`[drophouse] Phase 3 on port ${port}`);
    serve({ fetch: app.fetch, port });
  })();
}
