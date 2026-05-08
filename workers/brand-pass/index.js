// Brand Pass Worker
// Generates brand identity (palette, fonts, logo) using Anthropic SDK
// Input: brief payload
// Output: brand_json with palette, fontPair, logoSvg

import Anthropic from '@anthropic-ai/sdk';
import { createHash } from 'node:crypto';
import { allQuery } from '../../server/src/schema.js';

const BRAND_PROMPT = `You are a brand identity designer. Given a business brief, produce a JSON brand specification.

Output ONLY valid JSON (no markdown, no explanation) with this exact shape:
{
  "palette": {
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex"
  },
  "fontPair": "DisplayFont + BodyFont",
  "logoSvg": "<svg>...</svg>"
}

Rules:
- primary: dominant brand color (used for headers, CTAs)
- secondary: supporting color (backgrounds, borders)
- accent: optional saturated highlight (sparingly used)
- fontPair: Google Fonts pair, "Display + Body" format
- logoSvg: simple inline SVG wordmark using the business name, under 500 chars
- Colors must have sufficient contrast (WCAG AA on white)
- Avoid cliché SaaS palettes (indigo/purple/teal default)
- The logo SVG should use the primary color for text`;

const COLLISION_PROMPT_ADDON = `\n\nIMPORTANT: The previous brand hash collided with a recent design. Generate a DISTINCTLY different palette and font pair. Try a different color temperature, saturation level, or font style category.`;

const MAX_COLLISION_RETRIES = 3;

/**
 * Hash a brand JSON object (palette + fontPair) to a sha256 hex string.
 * Used for collision detection.
 */
export function hashBrand(brandJson) {
  const canonical = JSON.stringify({
    palette: brandJson.palette,
    fontPair: brandJson.fontPair,
  });
  return createHash('sha256').update(canonical).digest('hex');
}

/**
 * Check if a brand hash collides with any brand created in the last 30 days.
 * Returns true if collision detected.
 */
function checkCollision(hash) {
  const rows = allQuery(`
    SELECT b.palette_json, b.font_pair
    FROM brands b
    WHERE b.created_at >= datetime('now', '-30 days')
  `);

  for (const row of rows) {
    const existingBrand = {
      palette: JSON.parse(row.palette_json || '{}'),
      fontPair: row.font_pair || '',
    };
    if (hashBrand(existingBrand) === hash) {
      return true;
    }
  }
  return false;
}

/**
 * Deterministic stub brand for when ANTHROPIC_API_KEY is missing.
 * Produces a unique-per-brief hash so collision logic can still be exercised.
 */
function generateStubBrand(briefPayload) {
  const briefHash = createHash('sha256')
    .update(JSON.stringify(briefPayload))
    .digest('hex')
    .slice(0, 6);

  const hue = parseInt(briefHash.slice(0, 2), 16) % 360;
  const secondaryHue = (hue + 120) % 360;
  const accentHue = (hue + 200) % 360;
  const stubPalette = {
    primary: `hsl(${hue}, 65%, 45%)`,
    secondary: `hsl(${secondaryHue}, 40%, 60%)`,
    accent: `hsl(${accentHue}, 70%, 50%)`,
  };

  return {
    palette: stubPalette,
    fontPair: 'Inter + Georgia',
    logoSvg: `<svg width="200" height="30" xmlns="http://www.w3.org/2000/svg"><text x="0" y="22" font-family="Inter, sans-serif" font-size="20" font-weight="700" fill="${stubPalette.primary}">${briefPayload.businessName || 'Brand'}</text></svg>`,
    _stub: true,
  };
}

/**
 * Call Anthropic Claude to generate a brand specification.
 */
async function callClaude(briefPayload, collisionInstruction = '') {
  const client = new Anthropic();

  const briefContext = `Business: ${briefPayload.businessName || 'Unknown'}
One-liner: ${briefPayload.oneLiner || briefPayload.valueProp || 'Not provided'}
Audience: ${briefPayload.audience || 'General'}
Tone: ${briefPayload.tone || 'Professional'}
Palette hint: ${briefPayload.paletteHint || 'None — use your judgment'}${collisionInstruction}`;

  const message = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 1024,
    messages: [
      { role: 'user', content: `${BRAND_PROMPT}\n\n${briefContext}` },
    ],
  });

  const text = message.content[0].text.trim();

  // Extract JSON from response (handle potential markdown wrapping)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`Claude returned non-JSON response: ${text.slice(0, 200)}`);
  }

  return JSON.parse(jsonMatch[0]);
}

/**
 * Main brand pass function.
 * Generates brand identity with collision detection and retry logic.
 *
 * @param {Object} briefPayload - The brief form data
 * @returns {Object} brandJson with palette, fontPair, logoSvg
 */
export default async function brandPass(briefPayload) {
  const useStub = !process.env.ANTHROPIC_API_KEY;

  if (useStub) {
    console.log('[brand-pass] ANTHROPIC_API_KEY not set — using deterministic stub mode');
    const stub = generateStubBrand(briefPayload);
    console.log('[brand-pass] Stub brand generated:', { palette: stub.palette, fontPair: stub.fontPair });
    return stub;
  }

  let lastError = null;

  for (let attempt = 0; attempt <= MAX_COLLISION_RETRIES; attempt++) {
    const collisionInstruction = attempt > 0 ? COLLISION_PROMPT_ADDON : '';

    console.log(`[brand-pass] Generating brand (attempt ${attempt + 1}/${MAX_COLLISION_RETRIES + 1})...`);

    const brandJson = await callClaude(briefPayload, collisionInstruction);
    const hash = hashBrand(brandJson);

    console.log(`[brand-pass] Generated brand hash: ${hash}`);

    if (!checkCollision(hash)) {
      console.log('[brand-pass] No collision — brand accepted');
      return brandJson;
    }

    console.log(`[brand-pass] Collision detected on attempt ${attempt + 1}, retrying...`);
    lastError = new Error('Brand collision detected');
  }

  // All retries exhausted — throw typed error for queue to mark as manual_review
  const error = new BrandCollisionError(
    `Brand collision persisted after ${MAX_COLLISION_RETRIES + 1} attempts. Manual review required.`
  );
  throw error;
}

/**
 * Typed error for persistent brand collisions.
 * Queue processor should catch this and set brief status to 'manual_review'.
 */
export class BrandCollisionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BrandCollisionError';
    this.code = 'BRAND_COLLISION';
  }
}
