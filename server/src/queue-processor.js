// Queue processor for DropHouse brief pipeline
// Runs as a cron job (every 30s) or can be triggered manually
// Processes briefs in status: queued → brand → copy → press → deploy → live

import { db, saveDb, allQuery, getQuery, runQuery } from './schema.js';
import brandPass from '../workers/brand-pass/index.js';
import copyPass from '../workers/copy-pass/index.js';
import pressPass from '../workers/press-pass/index.js';
import deployPass from '../workers/deploy-pass/index.js';

const BRIEF_TIMEOUT = 45 * 60 * 1000; // 45 minutes

async function processQueue() {
  console.log('Checking queue...');
  
  // Get queued briefs ordered by created_at
  const queuedBriefs = allQuery(`
    SELECT * FROM briefs 
    WHERE status = 'queued' 
    ORDER BY created_at ASC 
    LIMIT 5
  `);
  
  console.log(`Found ${queuedBriefs.length} queued brief(s)`);
  
  for (const brief of queuedBriefs) {
    await processBrief(brief);
  }
}

async function processBrief(brief) {
  const briefId = brief.id;
  const payload = JSON.parse(brief.payload);
  
  console.log(`Processing brief ${briefId}...`);
  
  // Create a new run
  const runId = `run_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  runQuery(`
    INSERT INTO brief_runs (id, brief_id, started_at)
    VALUES (?, ?, datetime('now'))
  `, [runId, briefId]);
  
  try {
    // Step 1: Brand Pass
    if (!brief.brand_id) {
      console.log(`Running brand pass for ${briefId}...`);
      updateBriefStatus(briefId, 'brand');
      const brandResult = await brandPass(payload);
      
      // Save brand result
      runQuery(`
        INSERT INTO pass_results (id, run_id, pass_kind, status, output_json, started_at, completed_at)
        VALUES (?, ?, 'brand', 'success', ?, datetime('now'), datetime('now'))
      `, [`pass_${Date.now()}`, runId, JSON.stringify(brandResult)]);
    }
    
    // Step 2: Copy Pass
    console.log(`Running copy pass for ${briefId}...`);
    updateBriefStatus(briefId, 'copy');
    const copyResult = await copyPass(payload, payload); // TODO: get brand result
    
    runQuery(`
      INSERT INTO pass_results (id, run_id, pass_kind, status, output_json, started_at, completed_at)
      VALUES (?, ?, 'copy', 'success', ?, datetime('now'), datetime('now'))
    `, [`pass_${Date.now()}`, runId, JSON.stringify(copyResult)]);
    
    // Step 3: Press Pass
    console.log(`Running press pass for ${briefId}...`);
    updateBriefStatus(briefId, 'press');
    const pressResult = await pressPass(payload, payload, payload); // TODO: get brand + copy results
    
    runQuery(`
      INSERT INTO pass_results (id, run_id, pass_kind, status, output_json, started_at, completed_at)
      VALUES (?, ?, 'press', 'success', ?, datetime('now'), datetime('now'))
    `, [`pass_${Date.now()}`, runId, JSON.stringify(pressResult)]);
    
    // Step 4: Deploy Pass
    console.log(`Running deploy pass for ${briefId}...`);
    updateBriefStatus(briefId, 'deploy');
    const deployResult = await deployPass('/tmp/built-site', payload); // TODO: get actual built path
    
    // Update brief status to live
    runQuery(`
      UPDATE briefs 
      SET status = 'live', live_at = datetime('now')
      WHERE id = ?
    `, [briefId]);
    
    // Save deployed site
    runQuery(`
      INSERT INTO deployed_sites (id, brief_id, url, gh_repo, drophouse_credit_enabled)
      VALUES (?, ?, ?, ?, 1)
    `, [`site_${Date.now()}`, briefId, deployResult.url, deployResult.ghRepo]);
    
    // Update run as completed
    runQuery(`
      UPDATE brief_runs 
      SET completed_at = datetime('now')
      WHERE id = ?
    `, [runId]);
    
    saveDb();
    console.log(`Brief ${briefId} completed successfully!`);
    
  } catch (error) {
    console.error(`Error processing brief ${briefId}:`, error);
    updateBriefStatus(briefId, 'error');
  }
}

function updateBriefStatus(briefId, status) {
  runQuery(`UPDATE briefs SET status = ? WHERE id = ?`, [status, briefId]);
  saveDb();
}

// Check for stuck briefs (>45min in same status)
function checkStuckBriefs() {
  const stuckBriefs = allQuery(`
    SELECT * FROM briefs 
    WHERE status IN ('brand', 'copy', 'press', 'deploy')
    AND created_at < datetime('now', '-45 minutes')
  `);
  
  if (stuckBriefs.length > 0) {
    console.log(`Found ${stuckBriefs.length} stuck brief(s)`);
    // TODO: Send Slack alert
  }
}

// Main loop
async function main() {
  console.log('DropHouse Queue Processor started');
  
  while (true) {
    try {
      await processQueue();
      checkStuckBriefs();
    } catch (error) {
      console.error('Queue processor error:', error);
    }
    
    // Wait 30 seconds
    await new Promise(resolve => setTimeout(resolve, 30000));
  }
}

// Run if called directly
if (process.argv[1]?.endsWith('queue-processor.js')) {
  main().catch(console.error);
}

export { processQueue, checkStuckBriefs };
