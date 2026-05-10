import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

const tmpDir = mkdtempSync(path.join(tmpdir(), 'drophouse-queue-'));
process.env.DB_PATH = path.join(tmpDir, 'app.sqlite');
delete process.env.ANTHROPIC_API_KEY;

const { processQueue } = await import('../src/queue-processor.js');
const { allQuery, getQuery, runQuery } = await import('../src/schema.js');

test.after(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

test('queue processor runs brand -> copy -> press -> deploy and passes each output forward', async () => {
  const briefPayload = {
    id: 'brief-e2e',
    businessName: 'Acme Studio',
    audience: 'founders',
    valueProp: 'launch polished product pages quickly',
    primaryCta: 'Book a build',
    tone: 'confident',
    paletteHint: 'high contrast',
    customDomain: 'acme.example',
  };
  const brandOutput = {
    palette: { primary: '#111111', secondary: '#eeeeee', accent: '#ff3300' },
    fontPair: 'Archivo + Geist',
    logoSvg: '<svg><text>Acme</text></svg>',
  };
  const copyOutput = {
    hero: { headline: 'Launch Acme pages fast', subhead: 'Built for founders.' },
    features: [{ title: 'Fast', description: 'Pages without drag.' }],
    socialProof: { quote: 'It shipped.', author: 'Sam Lee' },
    cta: { text: 'Book a build', url: '#' },
    footer: { copyright: 'Acme Studio' },
  };
  const pressOutput = { builtPath: '/tmp/drophouse-built-acme', success: true, distSize: 42 };
  const deployOutput = {
    success: true,
    url: 'https://acme.example',
    ghRepo: 'prin7r-projects/acme-studio',
    status: 'live',
  };
  const calls = [];

  runQuery(
    'INSERT INTO customers (id, email) VALUES (?, ?)',
    ['customer-e2e', 'founder@example.com'],
  );
  runQuery(
    'INSERT INTO briefs (id, customer_id, payload, custom_domain, status) VALUES (?, ?, ?, ?, ?)',
    ['brief-e2e', 'customer-e2e', JSON.stringify(briefPayload), 'acme.example', 'queued'],
  );

  await processQueue({
    brandPass: async (payload) => {
      calls.push('brand');
      assert.deepEqual(payload, briefPayload);
      return brandOutput;
    },
    copyPass: async (brand, payload) => {
      calls.push('copy');
      assert.deepEqual(brand, brandOutput);
      assert.deepEqual(payload, briefPayload);
      return copyOutput;
    },
    pressPass: async (brand, copy, payload) => {
      calls.push('press');
      assert.deepEqual(brand, brandOutput);
      assert.deepEqual(copy, copyOutput);
      assert.deepEqual(payload, briefPayload);
      return pressOutput;
    },
    deployPass: async (builtPath, payload) => {
      calls.push('deploy');
      assert.equal(builtPath, pressOutput.builtPath);
      assert.deepEqual(payload, briefPayload);
      return deployOutput;
    },
  });

  assert.deepEqual(calls, ['brand', 'copy', 'press', 'deploy']);

  const brief = getQuery('SELECT status, live_at, brand_id FROM briefs WHERE id = ?', ['brief-e2e']);
  assert.equal(brief.status, 'live');
  assert.ok(brief.live_at);
  assert.ok(brief.brand_id);

  const passRows = allQuery(
    `SELECT pr.pass_kind, pr.status, pr.output_json
     FROM pass_results pr
     JOIN brief_runs br ON br.id = pr.run_id
     WHERE br.brief_id = ?
     ORDER BY pr.started_at, pr.rowid`,
    ['brief-e2e'],
  );
  assert.deepEqual(
    passRows.map((row) => [row.pass_kind, row.status]),
    [
      ['brand', 'success'],
      ['copy', 'success'],
      ['press', 'success'],
      ['deploy', 'success'],
    ],
  );
  assert.deepEqual(JSON.parse(passRows[0].output_json), brandOutput);
  assert.deepEqual(JSON.parse(passRows[1].output_json), copyOutput);
  assert.deepEqual(JSON.parse(passRows[2].output_json), pressOutput);
  assert.deepEqual(JSON.parse(passRows[3].output_json), deployOutput);

  const deployedSite = getQuery('SELECT url, gh_repo FROM deployed_sites WHERE brief_id = ?', ['brief-e2e']);
  assert.deepEqual(deployedSite, {
    url: deployOutput.url,
    gh_repo: deployOutput.ghRepo,
  });
});

test('queue processor persists partial deploy states without marking brief live', async () => {
  const briefPayload = {
    id: 'brief-awaiting-tls',
    businessName: 'TLS Studio',
    audience: 'operators',
    valueProp: 'launch static pages',
    primaryCta: 'Review',
    tone: 'direct',
    customDomain: 'tls.example',
  };
  const deployOutput = {
    success: true,
    url: 'https://tls.example',
    ghRepo: 'prin7r-projects/tls-studio',
    status: 'awaiting_tls',
    note: 'TLS is still being issued.',
  };

  runQuery(
    'INSERT INTO customers (id, email) VALUES (?, ?)',
    ['customer-awaiting-tls', 'ops@example.com'],
  );
  runQuery(
    'INSERT INTO briefs (id, customer_id, payload, custom_domain, status) VALUES (?, ?, ?, ?, ?)',
    ['brief-awaiting-tls', 'customer-awaiting-tls', JSON.stringify(briefPayload), 'tls.example', 'queued'],
  );

  await processQueue({
    brandPass: async () => ({
      palette: { primary: '#111111' },
      fontPair: 'Archivo + Geist',
      logoSvg: '<svg />',
    }),
    copyPass: async () => ({ hero: { headline: 'TLS Studio' } }),
    pressPass: async () => ({ builtPath: '/tmp/drophouse-built-tls', success: true }),
    deployPass: async () => deployOutput,
  });

  const brief = getQuery('SELECT status, live_at FROM briefs WHERE id = ?', ['brief-awaiting-tls']);
  assert.equal(brief.status, 'awaiting_tls');
  assert.equal(brief.live_at, null);

  const deployRow = getQuery(
    `SELECT pr.status, pr.output_json
     FROM pass_results pr
     JOIN brief_runs br ON br.id = pr.run_id
     WHERE br.brief_id = ? AND pr.pass_kind = 'deploy'`,
    ['brief-awaiting-tls'],
  );
  assert.equal(deployRow.status, 'success');
  assert.deepEqual(JSON.parse(deployRow.output_json), deployOutput);

  const deployedSite = getQuery('SELECT url, gh_repo FROM deployed_sites WHERE brief_id = ?', ['brief-awaiting-tls']);
  assert.deepEqual(deployedSite, {
    url: deployOutput.url,
    gh_repo: deployOutput.ghRepo,
  });
});
