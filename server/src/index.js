import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { db, saveDb, runQuery, allQuery, getQuery } from './schema.js';
import { z } from 'zod';

const app = new Hono();

// CORS — allow same-origin and configured frontends
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Validation schemas
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
  brandAssets: z.any().optional()
});

const reviseSchema = z.object({
  patches: z.object({
    copy: z.any().optional(),
    brand: z.any().optional(),
    press: z.any().optional()
  })
});

const checkoutSchema = z.object({
  tier: z.enum(['single', 'retainer'])
});

// POST /api/briefs (3.1)
app.post('/api/briefs', async (c) => {
  try {
    const body = await c.req.json();
    const validated = briefSchema.parse(body);

    // Create or find customer by email
    let customer = getQuery('SELECT * FROM customers WHERE email = ?', [validated.email]);
    if (!customer) {
      const customerId = `cust_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      runQuery(`
        INSERT INTO customers (id, email, created_at)
        VALUES (?, ?, datetime('now'))
      `, [customerId, validated.email]);
      customer = { id: customerId };
    }

    const briefId = `brief_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const estimatedCompleteAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    runQuery(`
      INSERT INTO briefs (id, customer_id, brand_id, payload, custom_domain, status)
      VALUES (?, ?, ?, ?, ?, 'queued')
    `, [briefId, customer.id, validated.brandId || null, JSON.stringify(validated), validated.customDomain]);
    saveDb();

    return c.json({
      briefId,
      statusUrl: `/api/briefs/${briefId}`,
      estimatedCompleteAt
    }, 201);
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
});

// GET /api/briefs/:id (3.2)
app.get('/api/briefs/:id', (c) => {
  const briefId = c.req.param('id');
  const brief = getQuery('SELECT * FROM briefs WHERE id = ?', [briefId]);
  
  if (!brief) return c.json({ error: 'Brief not found' }, 404);
  
  const runs = allQuery('SELECT * FROM brief_runs WHERE brief_id = ?', [briefId]);
  const passResults = allQuery(`
    SELECT pr.* FROM pass_results pr
    JOIN brief_runs br ON pr.run_id = br.id
    WHERE br.brief_id = ?
  `, [briefId]);
  const deployedSite = getQuery('SELECT * FROM deployed_sites WHERE brief_id = ?', [briefId]);

  return c.json({
    ...brief,
    payload: JSON.parse(brief.payload),
    runs,
    passResults,
    deployedSite
  });
});

// POST /api/briefs/:id/revise (3.3)
app.post('/api/briefs/:id/revise', async (c) => {
  try {
    const briefId = c.req.param('id');
    const body = await c.req.json();
    const validated = reviseSchema.parse(body);

    const brief = getQuery('SELECT * FROM briefs WHERE id = ?', [briefId]);
    if (!brief) return c.json({ error: 'Brief not found' }, 404);

    // Create new run for revision
    const runId = `run_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    runQuery(`
      INSERT INTO brief_runs (id, brief_id, started_at)
      VALUES (?, ?, datetime('now'))
    `, [runId, briefId]);

    // Trigger selective re-pass based on patches
    if (validated.patches.brand) {
      // Re-run brand pass
      runQuery(`
        INSERT INTO pass_results (id, run_id, pass_kind, status, started_at)
        VALUES (?, ?, 'brand', 'success', datetime('now'))
      `, [`pass_${Date.now()}`, runId]);
    }
    if (validated.patches.copy) {
      // Re-run copy pass
      runQuery(`
        INSERT INTO pass_results (id, run_id, pass_kind, status, started_at)
        VALUES (?, ?, 'copy', 'success', datetime('now'))
      `, [`pass_${Date.now()}`, runId]);
    }
    if (validated.patches.press) {
      // Re-run press + deploy
      runQuery(`
        INSERT INTO pass_results (id, run_id, pass_kind, status, started_at)
        VALUES (?, ?, 'press', 'success', datetime('now'))
      `, [`pass_${Date.now()}`, runId]);
    }
    saveDb();

    return c.json({ message: 'Revision triggered', runId });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
});

// POST /api/briefs/:id/approve (3.4)
app.post('/api/briefs/:id/approve', (c) => {
  const briefId = c.req.param('id');
  const brief = getQuery('SELECT * FROM briefs WHERE id = ?', [briefId]);
  
  if (!brief) return c.json({ error: 'Brief not found' }, 404);
  
  runQuery(`UPDATE briefs SET status = 'deploy' WHERE id = ?`, [briefId]);
  saveDb();
  
  return c.json({ message: 'Deploy triggered' });
});

// POST /api/checkout/nowpayments (3.5)
app.post('/api/checkout/nowpayments', async (c) => {
  try {
    const body = await c.req.json();
    const validated = checkoutSchema.parse(body);
    
    // TODO: Integrate with NOWPayments API
    const invoiceId = `inv_${Date.now()}`;
    const subscriptionId = `sub_${Date.now()}`;
    
    runQuery(`
      INSERT INTO subscriptions (id, customer_id, tier, status)
      VALUES (?, ?, ?, 'pending')
    `, [subscriptionId, null, validated.tier]);
    saveDb();
    
    return c.json({
      invoice_url: `https://nowpayments.io/invoice/${invoiceId}`,
      invoice_id: invoiceId,
      subscriptionId
    }, 201);
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
});

// POST /api/webhooks/nowpayments (3.6)
app.post('/api/webhooks/nowpayments', async (c) => {
  try {
    const body = await c.req.json();
    // TODO: Verify HMAC-SHA512 signature
    
    if (body.payment_status === 'finished') {
      const subscriptionId = body.order_id;
      runQuery(`
        UPDATE subscriptions 
        SET status = 'active', valid_until = datetime('now', '+1 month')
        WHERE id = ?
      `, [subscriptionId]);
      saveDb();
    }
    
    return c.json({ received: true });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
});

// POST /api/account/cancel (3.7)
app.post('/api/account/cancel', async (c) => {
  try {
    const body = await c.req.json();
    const { transferReposTo } = body;
    
    // TODO: Cancel subscription, transfer repos
    return c.json({ message: 'Subscription cancelled' });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
});

// GET /api/preview/:token (3.8)
app.get('/api/preview/:token', (c) => {
  const token = c.req.param('token');
  // TODO: Verify 24h-signed token, render preview HTML
  return c.html('<html><body><h1>Preview</h1></body></html>');
});

// POST /api/admin/briefs/:id/retry (3.9)
app.post('/api/admin/briefs/:id/retry', (c) => {
  const briefId = c.req.param('id');
  const brief = getQuery('SELECT * FROM briefs WHERE id = ?', [briefId]);
  
  if (!brief) return c.json({ error: 'Brief not found' }, 404);
  
  runQuery(`UPDATE briefs SET status = 'queued' WHERE id = ?`, [briefId]);
  saveDb();
  
  return c.json({ message: 'Retry triggered' });
});

// Health check
app.get('/health', (c) => c.json({ status: 'ok' }));

export default app;

// Start server if run directly
const isMain = process.argv[1]?.endsWith('index.js');
if (isMain) {
  const port = process.env.PORT || 4000;
  console.log(`Server running on port ${port}`);
  const http = await import('http');
  const server = http.createServer((req, res) => {
    app.fetch(req, res);
  });
  server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
      console.log(`Port ${port} in use, trying ${port + 1}`);
      server.listen(port + 1);
    } else {
      throw e;
    }
  });
  server.listen(port, () => {
    console.log(`Server listening on ${port}`);
  });
}
