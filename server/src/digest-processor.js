// server/src/digest-processor.js — DropHouse Phase 2: Nightly digest builder
//
// Runs as a cron (once per day). Queries all customers, calls buildDigest()
// for each, and stores the result in the digests table. Idempotent: each run
// overwrites the previous day's digest.
//
// Schedule: node server/src/digest-processor.js (via docker sleep-loop)

import { db, saveDb, runQuery, allQuery, getQuery } from "./schema.js";
import { buildDigest } from "./index.js";

async function processDigests() {
  console.log(`[digest-processor] Starting digest build at ${new Date().toISOString()}`);

  const customers = allQuery("SELECT id, email FROM customers ORDER BY email ASC");
  console.log(`[digest-processor] Found ${customers.length} customer(s)`);

  const results = [];

  for (const customer of customers) {
    console.log(`[digest-processor] Building digest for customer ${customer.id} (${customer.email})`);

    try {
      const digest = buildDigest(customer.id);
      if (!digest) {
        console.warn(`[digest-processor] No digest generated for ${customer.id}`);
        results.push({ customerId: customer.id, action: "skipped", reason: "no_digest" });
        continue;
      }

      const digestId = `dgst_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      runQuery(
        "INSERT INTO digests (id, customer_id, digest_json, sent_at) VALUES (?, ?, ?, datetime('now'))",
        [digestId, customer.id, JSON.stringify(digest)],
      );

      console.log(`[digest-processor] Digest stored for ${customer.id}: ${digest.totalBriefs} briefs, ${digest.totalBrands} brands`);
      results.push({
        customerId: customer.id,
        action: "digest_stored",
        digestId,
        totalBriefs: digest.totalBriefs,
        totalBrands: digest.totalBrands,
      });
    } catch (err) {
      console.error(`[digest-processor] Error building digest for ${customer.id}:`, err.message);
      results.push({ customerId: customer.id, action: "error", reason: err.message });
    }
  }

  saveDb();
  console.log(`[digest-processor] Digest build complete: ${results.length} processed`);
  return results;
}

// Main
async function main() {
  console.log("[digest-processor] DropHouse Nightly Digest Builder starting");
  const results = await processDigests();
  console.log("[digest-processor] Done. Results:", JSON.stringify(results));
}

// Run if called directly
const isMain = process.argv[1]?.endsWith("digest-processor.js");
if (isMain) {
  main()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[digest-processor] Fatal:", err);
      process.exit(1);
    });
}

export { processDigests };
