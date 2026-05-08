// Deploy Pass Worker
// Creates GitHub repo, pushes code, SSH to server, docker compose up, DNS + TLS verify.
// Input:  builtPath  — local filesystem path to built site (static HTML/CSS/JS)
//         briefPayload — { id, businessName, customDomain? }
// Output: { url, ghRepo, success, status? }
//
// Dry-run mode: DH_DEPLOY_DRY_RUN=1 returns synthetic success without touching gh/ssh.

import { promises as fs } from 'node:fs';
import { resolve, basename } from 'node:path';
import {
  slugify,
  execAsync,
  sshExec,
  scpUpload,
  generateComposeYaml,
  generateNginxConf,
  pollDns,
  verifyTls,
  ghRepoExists,
  ghRepoCreate,
} from '../../lib/deploy-helpers.js';

const DRY_RUN = process.env.DH_DEPLOY_DRY_RUN === '1';
const SITES_ROOT = '/opt/drophouse/sites';
const GITHUB_ORG = 'prin7r-projects';
const BASE_DOMAIN = 'landing-pages-on-demand.prin7r.com';
const DNS_POLL_MAX_MS = parseInt(process.env.DH_DNS_POLL_MAX_MS || '300000', 10); // 5 min
const TLS_VERIFY_TIMEOUT_MS = parseInt(process.env.DH_TLS_VERIFY_TIMEOUT_MS || '15000', 10);

export default async function deployPass(builtPath, briefPayload) {
  const briefId = briefPayload.id || 'unknown';
  const rawName = briefPayload.customDomain || briefPayload.businessName || `brief-${briefId}`;
  const slug = slugify(rawName);
  const domain = briefPayload.customDomain || `${slug}.${BASE_DOMAIN}`;
  const ghRepo = `${GITHUB_ORG}/${slug}`;
  const siteDir = `${SITES_ROOT}/${slug}`;
  const url = `https://${domain}`;

  console.log(`[deploy-pass] Starting for brief ${briefId} → slug=${slug} domain=${domain}`);

  // --------------- DRY RUN ---------------
  if (DRY_RUN) {
    console.log(`[deploy-pass] DRY RUN — skipping gh repo create, SSH, docker compose.`);
    return {
      success: true,
      url,
      ghRepo,
      status: 'live',
      dryRun: true,
    };
  }

  // --------------- Validate builtPath ---------------
  try {
    const stat = await fs.stat(builtPath);
    if (!stat.isDirectory()) {
      return { success: false, url, ghRepo, error: `builtPath is not a directory: ${builtPath}` };
    }
  } catch {
    return { success: false, url, ghRepo, error: `builtPath not found: ${builtPath}` };
  }

  // --------------- 1. GitHub repo create + push ---------------
  console.log(`[deploy-pass] Step 1/5: GitHub repo ${ghRepo}`);
  const repoExists = await ghRepoExists(ghRepo);

  // Ensure builtPath is a git repo with at least one commit
  let hasGit = false;
  try {
    await execAsync(`git -C ${escapeShellArg(builtPath)} rev-parse --git-dir`, { timeout: 10_000 });
    hasGit = true;
  } catch {
    // Not a git repo — init and commit
    await execAsync(`git -C ${escapeShellArg(builtPath)} init`, { timeout: 10_000 });
    await execAsync(`git -C ${escapeShellArg(builtPath)} add -A`, { timeout: 15_000 });
    await execAsync(`git -C ${escapeShellArg(builtPath)} commit -m "DropHouse deploy for ${rawName}" --allow-empty`, { timeout: 15_000 });
    await execAsync(`git -C ${escapeShellArg(builtPath)} branch -M main`, { timeout: 5_000 });
    hasGit = true;
  }

  if (!repoExists) {
    try {
      // Remove any existing origin to avoid "Unable to add remote" errors
      await execAsync(`git -C ${escapeShellArg(builtPath)} remote remove origin 2>/dev/null; true`, { timeout: 5_000 });
      await ghRepoCreate(ghRepo, builtPath, {
        description: `DropHouse landing for ${rawName}`,
        timeout: 60_000,
      });
      console.log(`[deploy-pass] Created and pushed ${ghRepo}`);
    } catch (err) {
      console.error(`[deploy-pass] gh repo create failed: ${err.message}`);
      // If repo already exists (race), continue
      if (!err.stderr?.includes('already exists')) {
        return { success: false, url, ghRepo, error: `gh repo create failed: ${err.message}` };
      }
      console.log(`[deploy-pass] Repo already exists (race), continuing.`);
    }
  } else {
    console.log(`[deploy-pass] Repo ${ghRepo} already exists, skipping create.`);
    // Set remote and push latest to existing repo
    try {
      await execAsync(`git -C ${escapeShellArg(builtPath)} remote remove origin 2>/dev/null; true`, { timeout: 5_000 });
      const remoteUrl = `https://github.com/${ghRepo}.git`;
      await execAsync(`git -C ${escapeShellArg(builtPath)} remote add origin ${escapeShellArg(remoteUrl)}`, { timeout: 10_000 });
      await execAsync(`git -C ${escapeShellArg(builtPath)} push origin main --force`, { timeout: 30_000 });
    } catch (err) {
      console.error(`[deploy-pass] Git push failed: ${err.message}`);
      return { success: false, url, ghRepo, error: `git push failed: ${err.message}` };
    }
  }

  // --------------- 2. Prepare remote site directory ---------------
  console.log(`[deploy-pass] Step 2/5: Prepare remote directory ${siteDir}`);
  try {
    await sshExec(`mkdir -p ${siteDir}/site`);
    console.log(`[deploy-pass] Remote directory created.`);
  } catch (err) {
    return { success: false, url, ghRepo, error: `SSH mkdir failed: ${err.message}` };
  }

  // --------------- 3. Upload site files + generate compose config ---------------
  console.log(`[deploy-pass] Step 3/5: Upload site files`);
  try {
    // Upload built site files
    await scpUpload(`${builtPath}/.`, `${siteDir}/site/`, { timeout: 60_000 });
    console.log(`[deploy-pass] Site files uploaded.`);
  } catch (err) {
    return { success: false, url, ghRepo, error: `SCP upload failed: ${err.message}` };
  }

  // Generate compose and nginx configs locally, then upload
  const composeYaml = generateComposeYaml({ slug, domain });
  const nginxConf = generateNginxConf();

  const tmpDir = `/tmp/dh-deploy-${slug}-${Date.now()}`;
  try {
    await fs.mkdir(tmpDir, { recursive: true });
    await fs.writeFile(`${tmpDir}/docker-compose.yml`, composeYaml);
    await fs.writeFile(`${tmpDir}/nginx.conf`, nginxConf);

    await scpUpload(`${tmpDir}/docker-compose.yml`, `${siteDir}/docker-compose.yml`, { timeout: 15_000 });
    await scpUpload(`${tmpDir}/nginx.conf`, `${siteDir}/nginx.conf`, { timeout: 15_000 });
    console.log(`[deploy-pass] Compose and nginx configs uploaded.`);
  } finally {
    // Cleanup tmp dir
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }

  // --------------- 4. Docker compose up ---------------
  console.log(`[deploy-pass] Step 4/5: Docker compose up`);
  try {
    // Pull latest nginx image first
    await sshExec(`cd ${siteDir} && docker compose pull`, { timeout: 60_000 });
    // Bring up (idempotent — compose up -d handles already-running)
    await sshExec(`cd ${siteDir} && docker compose up -d --force-recreate`, { timeout: 60_000 });
    console.log(`[deploy-pass] Container started.`);
  } catch (err) {
    return { success: false, url, ghRepo, error: `docker compose up failed: ${err.message}` };
  }

  // --------------- 5. DNS poll + TLS verify ---------------
  console.log(`[deploy-pass] Step 5/5: DNS poll + TLS verify for ${domain}`);
  try {
    // Check if this is a custom domain that might need CNAME pointing
    if (briefPayload.customDomain) {
      console.log(`[deploy-pass] Custom domain — polling DNS for ${domain}`);
      try {
        await pollDns(domain, {
          maxWaitMs: DNS_POLL_MAX_MS,
          intervalMs: 15_000,
        });
        console.log(`[deploy-pass] DNS resolved for ${domain}`);
      } catch {
        console.log(`[deploy-pass] DNS not resolved within ${DNS_POLL_MAX_MS}ms`);
        return {
          success: true,
          url,
          ghRepo,
          status: 'awaiting_dns',
          note: `DNS poll timed out. Point CNAME/A record for ${domain} to ${BASE_DOMAIN}.`,
        };
      }
    } else {
      // Subdomain under our control — shorter poll
      try {
        await pollDns(domain, {
          maxWaitMs: Math.min(DNS_POLL_MAX_MS, 60_000),
          intervalMs: 10_000,
        });
        console.log(`[deploy-pass] DNS resolved for ${domain}`);
      } catch {
        console.log(`[deploy-pass] DNS not yet resolved, but returning success (subdomain should propagate)`);
      }
    }

    // TLS verify
    try {
      const tlsResult = await verifyTls(domain, 443, TLS_VERIFY_TIMEOUT_MS);
      console.log(`[deploy-pass] TLS verified: subject=${tlsResult.subject?.CN}, authorized=${tlsResult.authorized}`);
    } catch (err) {
      console.log(`[deploy-pass] TLS not ready yet: ${err.message}`);
      return {
        success: true,
        url,
        ghRepo,
        status: 'awaiting_tls',
        note: `TLS handshake failed. Traefik may still be obtaining certificate. Retry in 30s.`,
      };
    }
  } catch (err) {
    return { success: false, url, ghRepo, error: `DNS/TLS check failed: ${err.message}` };
  }

  console.log(`[deploy-pass] Complete — ${url}`);
  return {
    success: true,
    url,
    ghRepo,
    status: 'live',
  };
}

/** Escape a single shell argument. */
function escapeShellArg(s) {
  return `'${String(s).replace(/'/g, "'\\''")}'`;
}
