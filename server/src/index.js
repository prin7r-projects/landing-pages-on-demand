import { Hono } from 'hono';
import { db, saveDb, runQuery, allQuery, getQuery } from './schema.js';
import { z } from 'zod';

const app = new Hono();

// Validation schema for POST /api/briefs
const briefSchema = z.object({
  businessName: z.string().min(1),
  audience: z.string().min(1),
  valueProp: z.string().min(1),
  primaryCta: z.string().min(1),
  tone: z.string().min(1),
  paletteHint: z.string().optional(),
  customDomain: z.string().min(1),
  brandId: z.string().optional(),
  brandAssets: z.any().optional()
});

// POST /api/briefs
app.post('/api/briefs', async (c) => {
  try {
    const body = await c.req.json();
    const validated = briefSchema.parse(body);

    const briefId = `brief_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const estimatedCompleteAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30min from now

    // Insert brief into DB
    runQuery(`
      INSERT INTO briefs (id, customer_id, brand_id, payload, custom_domain, status)
      VALUES (?, ?, ?, ?, ?, 'queued')
    `, [briefId, null, validated.brandId || null, JSON.stringify(validated), validated.customDomain]);
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

// GET /api/briefs/:id
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
