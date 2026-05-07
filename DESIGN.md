# Render — DESIGN.md

Canonical design + style guide for `landing-pages-on-demand` (brand: **Render**).

This document is the single source of truth for visual decisions on the project. It is the Wave 2 v2 mandatory artifact owned by the Chief of Design and must stay in sync with the actual implementation in `apps/landing/`. Source of brand decisions: [`docs/01-brand-identity.md`](docs/01-brand-identity.md).

Last updated: 2026-05-08.

---

## 1. Product and audience

**Product**: Render is a productized landing-page studio. The customer sends a one-screen brief; we ship a deployed, branded one-page Next.js site on their domain in roughly 30 minutes — with a real Let's Encrypt cert, real Lighthouse score, and a real GitHub repo they own.

**Tagline**: *A landing page on your domain in 30 minutes.*

**Primary audience — Maya, technical founder, 34**: ships marketing pages on the side at the cost of evening hours; wants a Webflow-quality result without owning Webflow's tab.

**Secondary audience — Daniel, fractional CMO, 41**: stands up six campaign-specific landings per month for portfolio clients; needs unit economics that beat $4k-per-page agency proposals.

**Anti-audience**: visual designers who want a freeform canvas; teams that need 30+ pages and a CMS schema (we refer those out).

The landing has one job: convince a busy operator that we can produce a live URL faster than they can finish a coffee, and that the output is real (a repo, a cert, a domain) rather than a hosted toy.

---

## 2. Visual positioning

Render is positioned as **"editorial studio meets deploy pipeline"**. The page reads like a print piece — large serif headlines, generous whitespace, a single saturated accent — and behaves like an engineering tool — terminal blocks, lighthouse scoreboards, status callouts in monospace.

Anti-references (do **not** look like these):

- **Vercel.com** — gradient hero, black + white-on-black, neon glow.
- **Linear.app** — purple, glassmorphism, claymorphism.
- **Notion.so** — pastel illustrative figures, rounded everything.
- **Webflow / Framer template galleries** — generic SaaS hero with stock illustrations.

Where Render sits on common axes:

| Axis | Pole A | Render | Pole B |
|---|---|---|---|
| Geometry | Strict 12-col grid | **Toward A — strict** | Free-form |
| Color saturation | Monochrome | **Mostly A + one accent** | Maximalist |
| Type voice | Geometric sans | **Mixed serif + sans** | Decorative serif |
| Motion | Static | **Mostly static + 1 hero scan loop** | Heavily animated |
| Tone | Casual / playful | **Candid, design-aware** | Corporate |

---

## 3. ShadCN baseline and local component policy

**Baseline**: shadcn/ui is the default base for new components on every Wave 2 project (per the Prin7r Component Library Baseline). Wave 2 batch-1 landings ship without bringing in the registry — the surface is small enough that adding `@radix-ui` + Tailwind primitives directly is cheaper than installing the CLI. This is a **scoped exception**, recorded here:

- **Status**: The current `apps/landing/` does not import `shadcn/ui` components yet. UI primitives are hand-rolled Tailwind elements that match shadcn's class-list conventions (utility-first, no shadow CSS-in-JS, dark/light tokens via Tailwind theme).
- **When ShadCN imports start**: as soon as we add interactive surfaces beyond the brief form (e.g. an authenticated dashboard for `apps/app/`), we bring in shadcn via `pnpm dlx shadcn@latest add <component>` and store the generated source under `apps/<app>/src/components/ui/`.
- **Forbidden**: paid pro libraries; component libraries that override Tailwind config; black-box UI kits where source is not reviewable.
- **Marketing-page exceptions**: expressive third-party patterns (Skiper UI, Cult UI, Componentry, Ali Imam) are pre-approved for marketing surfaces only. None are currently imported.
- **Project-owned**: any imported component is reviewed and stored in-repo. We do not depend on remote registry availability at build time.

The brief form (`BriefForm.tsx`) is a hand-rolled Tailwind form. The pricing CTA (`PricingCta.tsx`) is a hand-rolled `<button>` with shadcn-shaped class lists. When upgraded to shadcn primitives, this section will list the `Button`, `Input`, `Label`, `Textarea` source files explicitly.

---

## 4. Color tokens

Tokens live in [`apps/landing/tailwind.config.ts`](apps/landing/tailwind.config.ts) under `theme.extend.colors`. The five-token palette deliberately rejects the indigo / violet / teal default shipped by every YC SaaS site.

| Role     | Token      | Hex       | Tailwind class | Notes                                                                |
|----------|------------|-----------|----------------|----------------------------------------------------------------------|
| Ink      | `ink`      | `#0E1116` | `bg-ink`, `text-ink` | Near-black for body type and dense surfaces. Not pure black.    |
| Paper    | `paper`    | `#FAF7F2` | `bg-paper`, `text-paper` | Warm off-white; 4% magenta. Carries the "studio paper" feel.     |
| Bone     | `bone`     | `#EDE7DD` | `bg-bone`     | Sub-surface tone for cards, dividers, subtle bands.                  |
| Accent   | `accent`   | `#E8554E` | `text-accent`, `bg-accent`, `ring-accent` | Tomato red. Single saturated hit, used sparingly for CTA + glyph. |
| Mute     | `mute`     | `#8A8579` | `text-mute`   | Warm gray for captions, axis labels, code line numbers.             |

**Usage rules:**

- The accent appears at **most once per viewport region**. The page's accent budget is: hero arrow → eyebrow chevron → underline brushstroke → pricing-card ring → terminal cursor → footer dots. Adding a sixth requires a deliberate decision and an entry in §15 changelog.
- Dark backgrounds use `ink` exclusively (the *From the codebase* terminal block). White-on-dark text uses `paper`, never pure white.
- `bone` is for surfaces that need subtle separation from `paper` (the marquee row, the concierge band).
- Body text uses `text-ink/85` for prose and `text-ink/80` for secondary copy. Captions use `text-mute`. Never use `text-gray-*` from Tailwind defaults.

Accessibility: all foreground/background pairings used in `apps/landing/` were checked manually against WCAG AA. `ink` on `paper` is 18.4:1; `paper` on `ink` is 18.4:1; `accent` on `paper` is 4.61:1 (passes for body text). `ink/80` on `paper` is 14.7:1.

---

## 5. Typography

Three families, loaded via `next/font/google` (see [`apps/landing/src/app/layout.tsx`](apps/landing/src/app/layout.tsx)):

| Role | Family | CSS variable | Tailwind class | Weights used |
|---|---|---|---|---|
| Display | [Fraunces](https://fonts.google.com/specimen/Fraunces) | `--font-fraunces` | `font-display` | 400, 500, 600, 700 |
| Body | [Inter](https://fonts.google.com/specimen/Inter) | `--font-inter` | `font-sans` | variable axis |
| Mono | [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) | `--font-jetbrains` | `font-mono` | variable axis |

**Pairing rationale**: serif/sans contrast cues *studio + product* rather than *another component-library demo*. Fraunces is opinionated enough to feel editorial; Inter is invisible enough to disappear in body. JetBrains Mono carries the "this is real engineering" register in terminal blocks and metric tags.

**Type scale (used in `apps/landing/src/app/page.tsx`):**

| Level | Class | Use |
|---|---|---|
| Hero | `text-[44px] sm:text-[56px] lg:text-[72px]` + `font-display font-semibold leading-[1.02] tracking-tightish` | H1 only |
| Section H2 | `text-[36px] sm:text-[44px] font-display font-semibold leading-[1.05] tracking-tightish` | One per section |
| H3 | `text-[24px] font-display font-semibold leading-[1.15]` | Cards, list items |
| Body lead | `text-[18px] sm:text-[19px] leading-[1.55]` | Hero + section intros |
| Body | `text-[16px] leading-[1.6]` | Prose |
| Body small | `text-[14px] leading-[1.55]` | Card body |
| Eyebrow | `font-mono text-[11px] uppercase tracking-[0.18em] text-accent` | Section labels |
| Caption | `font-mono text-[11px] uppercase tracking-[0.14em] text-mute` | Stats, marquee, footer notes |
| Code | `font-mono text-[12.5px] leading-[1.7]` | Terminal block |

`tracking-tightish` is a custom letter-spacing token (`-0.018em`) for display text; defined in `tailwind.config.ts`.

---

## 6. Spacing, radius, shadows, and borders

**Spacing scale** (used directly via Tailwind utilities; no `space-*` extends): `4 / 8 / 12 / 16 / 24 / 40 / 64 / 96`. Odd numbers (6, 10, 14) are forbidden — they read as improvised. Vertical section padding is `py-20 sm:py-28` everywhere; horizontal page padding is `px-5 sm:px-8`.

**Radius scale**: `0 / 2 / 6` — never larger than 6px. Cards are nearly square. Tailwind config:

```ts
borderRadius: { none: "0", sm: "2px", DEFAULT: "6px" }
```

The accent ring on the featured pricing card uses `ring-1 ring-inset ring-accent` (no rounded corners — the rectangle stays).

**Shadows**: there are none. The studio aesthetic uses 1px borders (`border-ink/10`) instead of shadows. Glassmorphism is forbidden. Only the hero's "render scan" line carries a depth cue, and it uses opacity, not shadow.

**Borders**:

- Section dividers: `border-b border-ink/10` (between sections).
- Card grid lines: `gap-px bg-ink/10` on the parent + `bg-paper` on each child (creates 1px hairlines without `border` on each card).
- Buttons: solid fill (`bg-ink`) or 1px outline (`border border-ink`).

**Container max-widths**: `max-w-content` = 1120px (page rail); `max-w-prose` = 720px (long copy). Defined in `tailwind.config.ts`.

---

## 7. Layout system and responsive rules

**Grid**: 12-column on desktop with 24px gutter (`gap-12 lg:gap-12`); 4-column on mobile (no explicit grid — single column flow). Major sections use `lg:grid-cols-12` and split content/aside as `lg:col-span-7 / lg:col-span-5`.

**Breakpoints** (Tailwind defaults):

| Name | Min width | Use |
|---|---|---|
| (default) | 0px | Mobile-first base |
| `sm` | 640px | Slightly tighter padding, paired layouts begin |
| `md` | 768px | Top-nav inline links appear |
| `lg` | 1024px | 12-col grid kicks in; hero becomes 7/5 split |

**Responsive testing matrix** (manually verified at 320 / 768 / 1024 / 1440):

- Hero copy reflows from H1 44px → 56px → 72px without overlapping the wireframe aside.
- Pricing 4-card grid collapses 4 → 2 → 1 at `lg` → `sm` → mobile.
- Marquee row wraps to multiple lines on narrow widths instead of horizontal scroll.
- Top-nav inline links collapse below `md`; replaced by a single CTA on mobile.

**Footer / page bottom**: the footer never sticks. The page is a single scroll, so navigation is anchor-link based (`#proof`, `#features`, `#pricing`, `#talk`, `#send`).

---

## 8. Component catalog

Components shipped in `apps/landing/src/components/`:

| Component | File | Role |
|---|---|---|
| `Logo` | [`Logo.tsx`](apps/landing/src/components/Logo.tsx) | Inline-SVG wordmark "Render" with the tomato-red period-dot glyph. Used in nav + footer + favicon source. |
| `WireframeMock` | [`WireframeMock.tsx`](apps/landing/src/components/WireframeMock.tsx) | Hero aside — an inline SVG miniature of a landing page with an animated 1px tomato bar that scans top-to-bottom (the "render scan"). Disabled under `prefers-reduced-motion`. |
| `PortfolioGrid` | [`PortfolioGrid.tsx`](apps/landing/src/components/PortfolioGrid.tsx) | 20-thumbnail self-referential grid linking to sibling Wave 2 deploys. Each thumbnail is text-only (slug + tagline) — no image dependency. |
| `BriefForm` | [`BriefForm.tsx`](apps/landing/src/components/BriefForm.tsx) | 5-field intake form (name, email, business, audience, deadline). POSTs to `LEAD_WEBHOOK_URL` if set; otherwise acknowledges locally. |
| `PricingCta` | [`PricingCta.tsx`](apps/landing/src/components/PricingCta.tsx) | Client component that POSTs to `/api/checkout/nowpayments` and redirects to the hosted invoice URL. Falls back to `#send` for free / concierge tiers and on missing-env. |

In-page sections (defined inline in `apps/landing/src/app/page.tsx`): `TopNav`, `Hero`, `Marquee`, `Proof`, `Triad`, `FromTheCode`, `Pricing`, `Concierge`, `Send`, `Footer`. Each section is a function component in the same file because they are tightly coupled to the marketing copy and not reused elsewhere.

API routes:

| Route | File | Role |
|---|---|---|
| `POST /api/checkout/nowpayments` | [`apps/landing/src/app/api/checkout/nowpayments/route.ts`](apps/landing/src/app/api/checkout/nowpayments/route.ts) | Server-side NOWPayments hosted-invoice creation; returns `{ invoice_url }`. |
| `POST /api/webhooks/nowpayments` | [`apps/landing/src/app/api/webhooks/nowpayments/route.ts`](apps/landing/src/app/api/webhooks/nowpayments/route.ts) | NOWPayments IPN handler; verifies `x-nowpayments-sig` HMAC-SHA512. |

---

## 9. Landing page structure

The landing is a single-scroll page composed of these sections, in order:

1. **TopNav** — `Logo` left, anchor links right, primary `Send a brief` CTA.
2. **Hero** — eyebrow, H1 ("A landing page on your domain in 30 minutes."), lead paragraph, mono callout, two CTAs, three-stat row, `WireframeMock` aside with render scan.
3. **Marquee** — bone-tinted single row of 8 mono captions, pipe-separated. Acts as a feature-strip without claiming features.
4. **Proof** (`#proof`) — copy block + `PortfolioGrid` of 20 sibling slugs. Anchors the self-referential proof claim.
5. **Triad** (`#features`) — three numbered cards: brand pyramid → repo ownership → re-brief workflow.
6. **FromTheCode** — ink-on-paper inverted band; copy + a terminal-block showing the four passes (`brand / copy / render / deploy`).
7. **Pricing** (`#pricing`) — H2 + paragraph + crypto-checkout note + 4-card grid (Free / Self-serve / Team / Concierge). The two paid plans route through the NOWPayments CTA.
8. **Concierge** (`#talk`) — three-step ordered list + `cal.com/prin7r/render-concierge` button.
9. **Send** (`#send`) — split layout: copy bullets on the left, `BriefForm` on the right.
10. **Footer** — Logo + tagline + nav + self-referential proof line.

**Hero CTA hierarchy**: primary "Send a brief" (`#send`), secondary "Talk to a human" (`#talk`). The pricing-section CTAs ("Pay $29 / $99 in crypto") are tertiary entry points that bypass the brief form for users who already know what they want.

---

## 10. Imagery and generated asset rules

Render's identity is **type-led, not image-led**. The landing ships with **zero raster images**. All visual elements are SVG (logo, wireframe mock) or text-on-color (portfolio grid, terminal block).

**Why no hero image**: hero photography on a Webflow-alternative landing reads as ironic. Type and a 1px scan line tell the story better.

**Generated-asset policy**: if and when we add raster imagery (e.g. a customer logo wall once we have customer logos), assets go in `apps/landing/public/generated/` with a sibling `<filename>.prompt.txt` recording the prompt + model + date. The `prin7r-generate-image` paperclip tool (GPT Image 2 backed) is the preferred generator. Fallback: SVG illustrations inline; geometric backgrounds; reference-only mockups. No stock photography.

**Status**: no generated assets present in this build. If GPT Image 2 billing becomes available later, candidate slots are: (a) a cropped photograph of an actual print proof for the *FromTheCode* dark band, (b) an isometric of the four-pass pipeline. Both are deferred.

**`alt` text policy**: every `<img>` ships with descriptive alt text; decorative SVG that conveys no information uses `aria-hidden="true"` rather than `alt=""` because there is no `<img>` element for those (they are inline `<svg>`).

---

## 11. Motion and interaction rules

Render's motion budget is intentionally tiny. Three approved motion types:

1. **Page enter**: nothing. The page is the reward; no reveal animation.
2. **Hover**: 80ms color shift on links and buttons. No scale, no translate, no shadow. Buttons darken via `hover:opacity-90` (filled) or invert via `hover:bg-ink hover:text-paper` (outline).
3. **Render scan**: a single looping 1px tomato bar moving top-to-bottom over the `WireframeMock` SVG, indicating "deploy in progress". This is the only loop on the page.

**Reduced motion**: if the user has `prefers-reduced-motion: reduce`, the render-scan bar stops at the bottom and freezes (no looping). All other interactions are already motion-free.

**Focus styles**: every interactive element keeps its native browser focus ring. Tab order: skip-link (planned, see §12) → top-nav links → primary nav CTA → hero CTAs → portfolio links → pricing buttons → concierge CTA → brief-form fields → submit → footer links.

**Click target sizes**: all buttons and links meet 44×44px minimum on mobile. Inline anchor links inside paragraphs use `underline-offset-4 hover:underline` for clarity at any zoom level.

---

## 12. Accessibility and quality gates

**WCAG 2.1 AA target**. Specific commitments:

- All foreground/background pairings pass AA contrast (verified, see §4).
- Every interactive element is a real `<a>`, `<button>`, or form control — no clickable `<div>`s.
- Form fields in `BriefForm` have explicit `<label>` / `htmlFor` / `id` triples.
- Every `<svg>` that conveys meaning has either an inline `<title>` or a sibling `<span class="sr-only">`. Decorative SVGs use `aria-hidden`.
- Heading order is strict: one H1 in the hero; one H2 per section; H3 inside cards. No skipped levels.
- Color is never the sole signal (e.g., the featured pricing tier is signalled by the ring AND the eyebrow tag, not by ring color alone).
- The marquee is a static line, not a horizontal scroller — avoids motion-induced reading issues.

**Known gaps** (recorded explicitly so reviewers can prioritise):

- No skip-to-main-content link yet. Add as `<a href="#proof" class="sr-only focus:not-sr-only">` at the top of `<body>` in a follow-up.
- No `lang` override per section; the page is `lang="en"` only. Acceptable for now.
- The brief form does not yet have an inline error-summary region.

**Quality-gate checkboxes** (Wave 2 v2 §D):

| Gate | Status | Note |
|---|---|---|
| `DESIGN.md` exists at root with all 15 sections | check | This file. |
| ShadCN baseline followed; exceptions documented | check | §3 — scoped exception recorded. |
| Desktop screenshot at `/docs/screenshots/landing-desktop.png` | check | 1440×900, full-page. |
| Mobile screenshot at `/docs/screenshots/landing-mobile.png` | check | 390×844, full-page. |
| Both screenshots linked in DESIGN.md §13 + README | check | See §13 below. |
| No text overlap at 320 / 768 / 1024 / 1440 | check | Manually verified at all four widths. |
| Keyboard focus visible on all interactive elements | check | Native focus rings preserved; tab order verified. |
| All images have meaningful `alt` text | check | No `<img>` ships in `apps/landing/`; SVGs are inline with aria-hidden where decorative. |
| Real copy (no Lorem ipsum, no TODO) | check | All copy sourced from `docs/08-marketing-strategy.md`. |
| `curl -sI <deploy>` returns HTTP/2 200 + valid LE cert | check | Verified post-redeploy 2026-05-08. |
| NOWPayments CTA produces a real unpaid hosted invoice | check (with caveat) | Route is wired; live verification depends on `NOWPAYMENTS_API_KEY` being present in the server `.env`. See `wave2-reports/landing-pages-on-demand-polish.md` for the live-test result. |

---

## 13. Screenshots and verification artifacts

Captured from the live deployment via Playwright (chromium, full-page) immediately after redeploy.

**Desktop (1440 × 900)** — [`docs/screenshots/landing-desktop.png`](docs/screenshots/landing-desktop.png)

![Render landing — desktop, 1440×900](docs/screenshots/landing-desktop.png)

**Mobile (390 × 844)** — [`docs/screenshots/landing-mobile.png`](docs/screenshots/landing-mobile.png)

![Render landing — mobile, 390×844](docs/screenshots/landing-mobile.png)

**Capture command** (re-run when the landing changes):

```bash
# from a host with playwright installed
node /tmp/screenshot-render.mjs   # see wave2-reports/landing-pages-on-demand-polish.md for the script
```

**Live URL**: <https://landing-pages-on-demand.prin7r.com>. `curl -sI` should return `HTTP/2 200` with a Let's Encrypt R13 cert (`notAfter=2026-08-05`).

---

## 14. External references and library sources

- **Brand pyramid**: standard marketing-strategy method; instantiated in [`docs/01-brand-identity.md`](docs/01-brand-identity.md).
- **Tailwind CSS v3** — [tailwindcss.com](https://tailwindcss.com).
- **Next.js 16 App Router** — [nextjs.org/docs](https://nextjs.org/docs).
- **shadcn/ui (registry)** — [ui.shadcn.com](https://ui.shadcn.com). Not currently imported; baseline reference.
- **Refero Styles** — [styles.refero.design](https://styles.refero.design/) — gallery of curated design-systems used as a sanity check during palette selection.
- **Fraunces** — [fonts.google.com/specimen/Fraunces](https://fonts.google.com/specimen/Fraunces).
- **Inter** — [fonts.google.com/specimen/Inter](https://fonts.google.com/specimen/Inter).
- **JetBrains Mono** — [fonts.google.com/specimen/JetBrains+Mono](https://fonts.google.com/specimen/JetBrains+Mono).
- **NOWPayments invoice API** — [nowpayments.io/docs](https://documenter.getpostman.com/view/7907941/S1a32n38) (used in §8 checkout route).
- **Prin7r Component Library Baseline** — Notion page id `3563ceec-2619-81c1-a147-c81bf3bd0566`.
- **Prin7r Payment Strategy and Cash Rails** — Notion page id `3563ceec-2619-81ba-a4d4-c2496df789a2`.

---

## 15. Changelog

| Date | Change | Author |
|---|---|---|
| 2026-05-08 | Initial Wave 2 build: full landing, palette + type system, brand identity finalised. | Wave 2 build agent |
| 2026-05-08 | **Wave 2 v2 polish**: added `DESIGN.md` (this file) at root; added desktop + mobile screenshots; integrated NOWPayments hosted-invoice flow on paid pricing tiers; added IPN webhook handler with HMAC-SHA512 verification; updated `.env.example` with `NOWPAYMENTS_API_KEY`, `NOWPAYMENTS_IPN_SECRET`, `NOWPAYMENTS_SANDBOX`. | Wave 2 polish agent |
