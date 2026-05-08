// Copy Pass Worker
// Generates landing page copy using Anthropic SDK
// Input: brandJson + briefPayload
// Output: copyJson with hero, features, socialProof, cta, footer

import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

// Output shape validation schema
const copyOutputSchema = z.object({
  hero: z.object({
    headline: z.string().min(1),
    subhead: z.string().min(1)
  }),
  features: z.array(
    z.object({
      title: z.string().min(1),
      description: z.string().min(1)
    })
  ).min(1).max(6),
  socialProof: z.object({
    quote: z.string().min(1),
    author: z.string().min(1),
    role: z.string().optional()
  }),
  cta: z.object({
    text: z.string().min(1),
    url: z.string().min(1)
  }),
  footer: z.object({
    copyright: z.string().min(1)
  })
});

function buildPrompt(brandJson, briefPayload) {
  const businessName = briefPayload.businessName || 'Your Business';
  const oneLiner = briefPayload.oneLiner || briefPayload.valueProp || '';
  const audience = briefPayload.audience || '';
  const cta = briefPayload.cta || briefPayload.primaryCta || 'Get Started';
  const tone = briefPayload.tone || 'professional';
  const palette = brandJson?.palette || {};
  const fontPair = brandJson?.fontPair || 'Inter + Playfair';

  return `You are a senior conversion copywriter. Write landing-page copy for the business below.

## Business context
- Name: ${businessName}
- One-liner: ${oneLiner}
- Target audience: ${audience}
- Tone: ${tone}
- Brand palette: primary ${palette.primary || '#06b6d4'}, secondary ${palette.secondary || '#3b82f6'}
- Font pair: ${fontPair}

## Instructions
- Write concise, specific copy. No generic marketing fluff.
- Hero subhead must be 1–2 sentences.
- Each feature description must be 1–2 sentences.
- Social proof should feel realistic and specific.
- CTA text should match the business context.

## Required output format
Return **only** a single JSON object (no markdown fences, no extra commentary) with this exact shape:

{
  "hero": { "headline": "...", "subhead": "..." },
  "features": [
    { "title": "...", "description": "..." },
    { "title": "...", "description": "..." },
    { "title": "...", "description": "..." }
  ],
  "socialProof": { "quote": "...", "author": "...", "role": "..." },
  "cta": { "text": "...", "url": "#" },
  "footer": { "copyright": "..." }
}`;
}

function buildFallbackCopy(brandJson, briefPayload) {
  const businessName = briefPayload.businessName || 'Your Business';
  const oneLiner = briefPayload.oneLiner || briefPayload.valueProp || 'Solutions that work for you.';
  const audience = briefPayload.audience || 'your customers';
  const cta = briefPayload.cta || briefPayload.primaryCta || 'Get Started';

  return {
    hero: {
      headline: `${businessName} — ${oneLiner}`,
      subhead: `Built for ${audience}. Get started in minutes.`
    },
    features: [
      {
        title: 'Save Time',
        description: `Automate the busywork so you can focus on growing ${businessName}.`
      },
      {
        title: 'Built for You',
        description: `Designed specifically for ${audience}, not a generic one-size-fits-all tool.`
      },
      {
        title: 'Results That Matter',
        description: 'Track outcomes and optimize without guesswork.'
      }
    ],
    socialProof: {
      quote: `${businessName} changed how we work. Highly recommend.`,
      author: 'Alex Morgan',
      role: 'Founder'
    },
    cta: {
      text: cta,
      url: '#'
    },
    footer: {
      copyright: `© ${new Date().getFullYear()} ${businessName}. All rights reserved.`
    }
  };
}

export default async function copyPass(brandJson, briefPayload) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.warn('[copy-pass] ANTHROPIC_API_KEY missing — returning deterministic fallback copy');
    return buildFallbackCopy(brandJson, briefPayload);
  }

  const anthropic = new Anthropic({ apiKey });
  const prompt = buildPrompt(brandJson, briefPayload);

  try {
    const response = await anthropic.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 2048,
      temperature: 0.7,
      system: 'You are a senior conversion copywriter. You write only strict JSON. No markdown, no explanations.',
      messages: [
        { role: 'user', content: prompt }
      ]
    });

    const rawContent = response.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('')
      .trim();

    // Strip markdown fences if present
    const jsonMatch = rawContent.match(/```json\s*([\s\S]*?)\s*```/) ||
                      rawContent.match(/```\s*([\s\S]*?)\s*```/);
    const jsonString = jsonMatch ? jsonMatch[1].trim() : rawContent;

    let parsed;
    try {
      parsed = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('[copy-pass] JSON parse error:', parseError.message);
      console.error('[copy-pass] Raw content:', rawContent.slice(0, 500));
      throw new Error('Copy pass returned invalid JSON');
    }

    const validated = copyOutputSchema.parse(parsed);
    return validated;
  } catch (error) {
    console.error('[copy-pass] Claude API error:', error.message);
    console.warn('[copy-pass] Falling back to deterministic stub');
    return buildFallbackCopy(brandJson, briefPayload);
  }
}
