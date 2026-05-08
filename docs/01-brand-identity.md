# 01 — Brand identity

## Brand pyramid

- **Essence (1 word)**: *DropHouse.* The product turns scattered business intent into a deployed page — the wright (craftsperson) who builds the page. The compound is the brand.
- **Personality (3 traits)**: candid, design-aware, fast-finishing.
- **Values (3)**: Clarity over cleverness. Real screenshots over stock vectors. Done beats perfect.
- **Attributes (5)**: typography-forward, generous whitespace, monochrome-with-one-accent, evidence-first copy, deploy-as-proof.

## Positioning statement

> For founders and operators who need a real landing page yesterday, **DropHouse** is a productized landing-page studio that ships a deployed, branded one-pager in 30 minutes — unlike DIY page builders that hand you a blank canvas, because DropHouse writes the copy, picks the palette, and pushes the page live to your domain while you finish coffee.

## Audience personas

### Primary — *Maya, technical founder, 34*
- **Goals**: launch the new product line on Tuesday; stop hand-coding marketing pages on a Saturday.
- **Frustrations**: Webflow eats four hours per page; Framer templates leak someone else's identity through the seams.
- **Lives in**: Linear, Slack, Hacker News, the 10am-Tuesday "we go live this week" panic.

### Secondary — *Daniel, fractional CMO, 41*
- **Goals**: stand up six campaign-specific landings per month for portfolio clients without hiring a third designer.
- **Frustrations**: agency proposals start at $4k for a single page; handoff cycles burn the campaign window.
- **Lives in**: Notion, Loom, retainer roadmaps, CFO emails about per-page ROI.

## Voice & tone

**Do**
- Quote the turnaround in literal minutes.
- Show the page that proves the claim ("this site you're reading was built by DropHouse").
- Treat the reader like an operator who has shipped before.

**Don't**
- Promise "AI magic" — promise a deployed URL.
- Use abstract gradients to fake polish; ship the polish.
- Hide pricing behind "contact sales" for the self-serve tier.

**Sample sentence**: *"Send the brief by 9am. Your landing is on your domain by 9:30am, with a real CMS, real analytics, and a real cert from Let's Encrypt."*

## Visual system

### Palette

| Role     | Hex       | Notes                                                                |
|----------|-----------|----------------------------------------------------------------------|
| Ink      | `#0E1116` | Near-black for body type and dense surfaces. Not pure black.         |
| Paper    | `#FAF7F2` | Warm off-white; 4% magenta. Carries the "studio paper" feel.         |
| Bone     | `#EDE7DD` | Sub-surface tone for cards, dividers, subtle bands.                  |
| Accent   | `#E8554E` | Tomato red. Single saturated hit, used sparingly for CTA + glyph.    |
| Mute     | `#8A8579` | Warm gray for captions, axis labels, code line-numbers.              |

The palette deliberately rejects the indigo/violet/teal default of every YC SaaS site. The accent is a single warm red — the color of a printer's ink-pad mark — applied to one element per viewport.

### Typography

- **Display**: `Fraunces` (variable, optical sizing) — a contemporary serif with a literary edge. Used for hero, section heads.
- **Body**: `Inter` (variable) — geometric sans for prose, UI, buttons.
- **Mono**: `JetBrains Mono` — for code, terminal, lighthouse score readouts.

Pairing rationale: the serif/sans contrast cues "studio + product" rather than "another component library demo."

### Logo concept

A heavy-display block with the word `DropHouse` set in Archivo Black uppercase, leading-trimmed, with a single aviation-red square replacing the period at the end. The square is the deploy. Inline SVG (the actual canonical wordmark lives in `apps/landing/src/components/Logo.tsx`):

```svg
<svg width="220" height="40" viewBox="0 0 220 40" xmlns="http://www.w3.org/2000/svg">
  <text x="0" y="28" font-family="Archivo Black, Helvetica, sans-serif" font-size="26" font-weight="900" fill="#0A0A0A" letter-spacing="-1">DROPHOUSE</text>
  <rect x="200" y="22" width="7" height="7" fill="#E61919"/>
</svg>
```

### Spacing & radius

- Spacing scale: 4 / 8 / 12 / 16 / 24 / 40 / 64 / 96 (no 6/10/14 — odd numbers feel improvised).
- Radius scale: 0 / 2 / 6 — never larger than 6px. Cards are nearly square.
- Container max-widths: 1120px content, 720px prose.
- Grid: 12 col @ 24px gutter on desktop, 4 col on mobile.

### Motion principles

- Page enter: nothing. The page is the reward.
- Hover: 80ms color shift, no scale.
- One looping animation allowed per page (the hero "press line" — a single 1px aviation-red bar that scans down a wireframe to indicate deploy).
- Reduced-motion: kill the bar.

## Anti-references (do not look like these)

- Vercel.com (gradient hero + black + white-text recipe)
- Linear.app (purple + glass + claymorphism)
- Notion.so (rounded illustrative figures)

## Self-referential proof

The site at `landing-pages-on-demand.prin7r.com` IS the proof of capability. The footer reads: *"This site, plus 19 others in the prin7r-projects portfolio, was generated by the very pipeline this product packages."*
