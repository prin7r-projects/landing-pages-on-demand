// Press Pass Worker
// Clones templates/landing-base, injects theme, runs pnpm build
// Input:  brandJson   — { palette, fontPair, logoSvg }
//         copyJson    — { hero, features, socialProof, cta, footer }
//         briefPayload — { id, businessName, ... }
// Output: { builtPath, success, distSize }

import { promises as fs } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Template source — relative to repo root
const TEMPLATE_DIR = resolve(__dirname, '../../templates/landing-base');

// Build timeout (4 minutes)
const BUILD_TIMEOUT_MS = 4 * 60 * 1000;

/**
 * Recursively copy a directory (cp -r equivalent with fs).
 * Excludes node_modules, .next, out, .git.
 */
async function copyTemplate(src, dest) {
  const SKIP = new Set(['node_modules', '.next', 'out', '.git']);
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    if (SKIP.has(entry.name)) continue;
    const srcPath = resolve(src, entry.name);
    const destPath = resolve(dest, entry.name);

    if (entry.isDirectory()) {
      await copyTemplate(srcPath, destPath);
    } else if (entry.isSymbolicLink()) {
      const linkTarget = await fs.readlink(srcPath);
      await fs.symlink(linkTarget, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

/**
 * Run a command with spawn, capturing stdout/stderr.
 * Throws PressPassError on timeout or non-zero exit.
 */
function spawnAsync(command, args, cwd, timeoutMs = BUILD_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env },
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: timeoutMs, // Node will send SIGTERM on timeout
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr?.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (err) => {
      if (err.code === 'ETIMEDOUT' || err.killed) {
        reject(
          new PressPassError(
            `Build timed out after ${timeoutMs / 1000}s`,
            'BUILD_TIMEOUT',
          ),
        );
      } else {
        reject(
          new PressPassError(`Spawn failed: ${err.message}`, 'SPAWN_ERROR'),
        );
      }
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(
          new PressPassError(
            `Build exited with code ${code}\n${stderr.slice(-1000)}`,
            'BUILD_FAILED',
          ),
        );
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

/**
 * Calculate total size of a directory recursively.
 */
async function dirSize(dirPath) {
  let total = 0;
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const full = resolve(dirPath, entry.name);
    if (entry.isDirectory()) {
      total += await dirSize(full);
    } else {
      const stat = await fs.stat(full);
      total += stat.size;
    }
  }
  return total;
}

/**
 * Main press pass: clone template, inject theme, build.
 *
 * @param brandJson    — { palette, fontPair, logoSvg }
 * @param copyJson     — { hero, features, socialProof, cta, footer }
 * @param briefPayload — { id, businessName, ... }
 * @returns { builtPath, success, distSize }
 */
export default async function pressPass(brandJson, copyJson, briefPayload) {
  const briefId = briefPayload.id || 'unknown';
  const buildDir = `/tmp/dh-build-${briefId}`;

  console.log(`[press-pass] Starting build for brief ${briefId} in ${buildDir}`);

  // ── 1. Copy template ──
  console.log('[press-pass] Copying template...');
  await copyTemplate(TEMPLATE_DIR, buildDir);

  // ── 2. Write theme.generated.json ──
  const themeJson = {
    palette: brandJson.palette,
    fontPair: brandJson.fontPair || '',
    logoSvg: brandJson.logoSvg || '',
    copy: copyJson,
  };

  const themePath = resolve(buildDir, 'theme.generated.json');
  await fs.writeFile(themePath, JSON.stringify(themeJson, null, 2));
  console.log('[press-pass] Theme injected:', themePath);

  // ── 3. Install dependencies (frozen lockfile) ──
  console.log('[press-pass] Installing dependencies...');
  try {
    await spawnAsync('pnpm', ['install', '--frozen-lockfile'], buildDir, BUILD_TIMEOUT_MS);
  } catch (err) {
    // Clean up on failure
    await fs.rm(buildDir, { recursive: true, force: true }).catch(() => {});
    throw err;
  }

  // ── 4. Build ──
  console.log('[press-pass] Building...');
  try {
    await spawnAsync('pnpm', ['build'], buildDir, BUILD_TIMEOUT_MS);
  } catch (err) {
    // Clean up on failure
    await fs.rm(buildDir, { recursive: true, force: true }).catch(() => {});
    throw err;
  }

  // ── 5. Determine built output path ──
  // Next.js static export goes to 'out/', fallback to '.next/' if no out/
  let outPath = resolve(buildDir, 'out');
  try {
    await fs.access(outPath);
  } catch {
    outPath = resolve(buildDir, '.next');
  }

  // ── 6. Calculate dist size ──
  const distSize = await dirSize(outPath);
  console.log(`[press-pass] Build complete — ${outPath} (${(distSize / 1024).toFixed(1)} KB)`);

  return {
    builtPath: outPath,
    success: true,
    distSize,
  };
}

/**
 * Typed error for press pass failures.
 * Queue processor should catch this and handle accordingly.
 */
export class PressPassError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'PressPassError';
    this.code = code;
  }
}
