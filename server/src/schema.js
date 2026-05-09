import initSqlJs from 'sql.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/app.sqlite');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize SQL.js
const SQL = await initSqlJs();
let db;

// Load existing DB or create new
if (fs.existsSync(dbPath)) {
  const buffer = fs.readFileSync(dbPath);
  db = new SQL.Database(buffer);
} else {
  db = new SQL.Database();
}

// Save DB to file helper
function saveDb() {
  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
}

// Helper to run a query with parameters
function runQuery(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  stmt.step(); // Execute
  saveDb();
  return stmt;
}

// Helper to get all rows
function allQuery(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  return results;
}

// Helper to get single row
function getQuery(sql, params = []) {
  const results = allQuery(sql, params);
  return results[0] || null;
}

// Initialize schema - fixed parentheses and syntax
db.run(`
  CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    email TEXT NOT NULL UNIQUE,
    gh_org TEXT,
    agency_partner_code TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    customer_id TEXT REFERENCES customers(id),
    tier TEXT NOT NULL CHECK(tier IN ('free', 'single', 'retainer')),
    status TEXT DEFAULT 'pending',
    valid_until TEXT,
    briefs_remaining INTEGER,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS brands (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    customer_id TEXT REFERENCES customers(id),
    name TEXT NOT NULL,
    palette_json TEXT,
    font_pair TEXT,
    logo_svg TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS briefs (
    id TEXT PRIMARY KEY,
    customer_id TEXT REFERENCES customers(id),
    brand_id TEXT REFERENCES brands(id),
    payload TEXT NOT NULL,
    custom_domain TEXT NOT NULL,
    status TEXT DEFAULT 'queued' CHECK(status IN ('queued', 'brand', 'copy', 'press', 'deploy', 'live', 'error', 'awaiting_dns', 'awaiting_approval', 'manual_review')),
    created_at TEXT DEFAULT (datetime('now')),
    live_at TEXT
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS brief_runs (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    brief_id TEXT REFERENCES briefs(id),
    started_at TEXT DEFAULT (datetime('now')),
    completed_at TEXT
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS pass_results (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    run_id TEXT REFERENCES brief_runs(id),
    pass_kind TEXT NOT NULL CHECK(pass_kind IN ('brand', 'copy', 'press', 'deploy')),
    status TEXT NOT NULL CHECK(status IN ('success', 'error')),
    output_json TEXT,
    error_message TEXT,
    started_at TEXT DEFAULT (datetime('now')),
    completed_at TEXT
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS deployed_sites (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    brief_id TEXT REFERENCES briefs(id),
    url TEXT NOT NULL,
    gh_repo TEXT NOT NULL,
    cert_issued_at TEXT,
    drophouse_credit_enabled INTEGER DEFAULT 1
  )
`);

// Phase 3: Payment idempotency + webhook tracking
db.run(`
  CREATE TABLE IF NOT EXISTS idempotency_keys (
    id TEXT PRIMARY KEY,
    idem_hash TEXT NOT NULL,
    idem_key TEXT NOT NULL,
    response_payload TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS payment_events (
    id TEXT PRIMARY KEY,
    subscription_id TEXT NOT NULL,
    payment_status TEXT NOT NULL,
    nowpayments_invoice_id TEXT,
    raw_payload TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

// Phase 2: Digest tracking
db.run(`
  CREATE TABLE IF NOT EXISTS digests (
    id TEXT PRIMARY KEY,
    customer_id TEXT REFERENCES customers(id),
    digest_json TEXT NOT NULL,
    sent_at TEXT DEFAULT (datetime('now')),
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

// Create indexes
try {
  db.run('CREATE INDEX IF NOT EXISTS idx_briefs_customer_status ON briefs(customer_id, status)');
  db.run('CREATE INDEX IF NOT EXISTS idx_pass_results_run_pass ON pass_results(run_id, pass_kind)');
  db.run('CREATE INDEX IF NOT EXISTS idx_idem_hash ON idempotency_keys(idem_hash, created_at)');
  db.run('CREATE INDEX IF NOT EXISTS idx_payment_events_sub_status ON payment_events(subscription_id, payment_status)');
  db.run('CREATE INDEX IF NOT EXISTS idx_digests_customer_sent ON digests(customer_id, sent_at)');
} catch (e) {
  // Indexes may already exist
}

saveDb();

export { db, saveDb, runQuery, allQuery, getQuery };
