# DropHouse — DESIGN.md

Canonical design + style guide for `landing-pages-on-demand` (brand: **DropHouse**).

This document is the single source of truth for visual decisions on the project. It is the Wave 2 v2 mandatory artifact owned by the Chief of Design and must stay in sync with the actual implementation in `apps/landing/`. Source of brand decisions: [`docs/01-brand-identity.md`](docs/01-brand-identity.md).

Last updated: 2026-05-08 (Wave 2 redesign — Swiss Industrial Print archetype).

---

## 1. Product and audience

**Product**: DropHouse is a productized landing-page studio. The customer sends a one-screen brief; we ship a deployed, branded one-page Next.js site on their domain in roughly 30 minutes — with a real Let's Encrypt cert, real Lighthouse score, and a real GitHub repo they own.

**Tagline**: *A landing page on your domain in 30 minutes.*

**Primary audience — Maya, technical founder, 34**: ships marketing pages on the side at the cost of evening hours; wants a result that does not look like every Webflow template, without owning Webflow's tab.

**Secondary audience — Daniel, fractional CMO, 41**: stands up six campaign-specific landings per month for portfolio clients; needs unit economics that beat $4k-per-page agency proposals.

**Anti-audience**: visual designers who want a freeform canvas; teams that need 30+ pages and a CMS schema (we refer those out).

The landing has one job: convince a busy operator that we can produce a live URL faster than they can finish a coffee, and that the output is real (a repo, a cert, a domain) rather than a hosted toy.

**Visual archetype (chosen 2026-05-08)**: **Swiss Industrial Print**. The landing reads like a draftsman's title-block — heavy display sans, ruled borders, monolithic numerals, single aviation-red accent. The previous warm beige paper/bone palette (paper #FAF7F2 / bone #EDE7DD / serif Fraunces / Inter body) has been retired; that combination read as "another Substack-aesthetic studio site" and softened the engineering claim. The new substrate is near-pure newsprint with carbon ink, and the type is uppercase Archivo Black with Geist as body and JetBrains Mono for telemetry. The portfolio rack now uses extreme scale variance to amplify the self-referential claim ("20 distinct landings, one afternoon").

---

## 2. Visual positioning

DropHouse is positioned as **"editorial studio meets deploy pipeline"**. The page reads like a print piece — large serif headlines, generous whitespace, a single saturated accent — and behaves like an engineering tool — terminal blocks, lighthouse scoreboards, status callouts in monospace.

Anti-references (do **not** look like these):

- **Vercel.com** — gradient hero, black + white-on-black, neon glow.
- **Linear.app** — purple, glassmorphism, claymorphism.
- **Notion.so** — pastel illustrative figures, rounded everything.
- **Webflow / Framer template galleries** — generic SaaS hero with stock illustrations.

Where DropHouse sits on common axes:

| Axis | Pole A | DropHouse | Pole B |
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

Tokens live in [`apps/landing/tailwind.config.ts`](apps/landing/tailwind.config.ts) under `theme.extend.colors`. The five-token palette is the **Swiss Industrial substrate**: matte newsprint paper, carbon ink, a single aviation-red accent. The previous warm-beige paper/bone canvas was retired in the 2026-05-08 redesign because it read as "studio cosy" rather than "engineering deliverable" and clashed with the macro display type. There are no gradients, no soft shadows, and no rounded corners anywhere on the page.

| Role     | Token      | Hex       | Tailwind class | Notes                                                                |
|----------|------------|-----------|----------------|----------------------------------------------------------------------|
| Ink      | `ink`      | `#0A0A0A` | `bg-ink`, `text-ink` | Carbon black for body type, dark substrate, and dividing rules. Not pure `#000`. |
| Paper    | `paper`    | `#F8F8F6` | `bg-paper`, `text-paper` | Newsprint off-white. 0% chroma — the warm magenta tilt of the previous palette is gone. |
| Bone     | `bone`     | `#ECECE8` | `bg-bone`     | Sub-substrate (concierge band) — half a step below paper, still neutral. |
| Accent   | `accent`   | `#E61919` | `text-accent`, `bg-accent`, `ring-accent` | Aviation / hazard red. The single saturated hit, used as alert-grade marker. |
| Mute     | `mute`     | `#5C5C58` | `text-mute`   | Neutral gray for telemetry captions, axis labels, footer metadata.   |

**Usage rules:**

- The accent appears as the **only** saturated colour on the page. Its budget per viewport region is: one eyebrow tag, one numeric pip, one structural pip on a button or card, and the pricing recommended-pill. Anything else must be `ink` on `paper`. Adding a fifth instance per viewport requires a deliberate decision and an entry in §15 changelog.
- Dark substrate: the *From the codebase* band uses pure `ink`; the Marquee strip uses `ink`; the Footer uses `ink`. White-on-dark text uses `paper`, never pure white.
- `bone` separates the Concierge band from neighbouring paper sections without warming the page.
- Body prose: `text-ink/85`. Secondary descriptive prose: `text-ink/85` (collapsed to one weight; the prior split between /85 and /80 was illegible noise). Telemetry captions: `text-mute`. Never use `text-gray-*` from Tailwind defaults.

Accessibility: foreground/background pairings used in `apps/landing/` were checked manually against WCAG AA. `ink` on `paper` is 19.6:1; `paper` on `ink` is 19.6:1; `accent` on `paper` is 4.74:1 (passes for body text); `accent` on `ink` is 4.14:1 (passes for large text and graphical objects); `ink/85` on `paper` is 16.9:1.

---

## 5. Typography

Three families, loaded via `next/font/google` (see [`apps/landing/src/app/layout.tsx`](apps/landing/src/app/layout.tsx)). The 2026-05-08 redesign retired Fraunces (serif) and Inter (banned by the Wave 2 redesign brief) and replaced them with Archivo Black + Geist:

| Role | Family | CSS variable | Tailwind class | Weights used |
|---|---|---|---|---|
| Display | [Archivo Black](https://fonts.google.com/specimen/Archivo+Black) | `--font-archivo` | `font-display` | 400 (the only weight Archivo Black ships) |
| Body | [Geist](https://vercel.com/font) | `--font-geist` | `font-sans` | variable axis |
| Mono | [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) | `--font-jetbrains` | `font-mono` | variable axis |

**Pairing rationale**: Archivo Black is the modern Swiss-Industrial workhorse — solid, unwavering, no romantic terminals — used in uppercase at extreme scale to form architectural blocks rather than read as text. Geist disappears in body copy, replacing Inter (which is the LLM default and was BANNED by the redesign brief); the two share the same Helvetica lineage so they mortise cleanly. JetBrains Mono carries the telemetry register in eyebrow tags, marquee strips, footer metadata, and the terminal block. **Fraunces is gone**: serif headlines are not compatible with the Swiss Industrial archetype.

**Type scale (used in `apps/landing/src/app/page.tsx`):**

| Level | Class / utility | Use |
|---|---|---|
| Hero macro | `.display-mega` (`clamp(3.25rem, 13vw, 14rem)`, line-height 0.86, tracking -0.045em, uppercase) | H1 only — viewport-bleeding |
| Section H2 | `.display-large` (`clamp(2.25rem, 7.5vw, 6.5rem)`, line-height 0.9, tracking -0.035em, uppercase) | One per section |
| Card H3 | `text-[20-26px] font-display uppercase leading-[1.05] tracking-tighter2` | Cards, list items |
| Stat figure | `text-[26-30px] font-display uppercase leading-none tracking-tighter2` | Hero stat trio + pricing prices |
| Body lead | `text-[16-18px] leading-[1.55]` | Hero + section intros |
| Body | `text-[16px] leading-[1.6]` | Prose |
| Body small | `text-[14-15px] leading-[1.55-1.6]` | Card body, list items |
| Eyebrow | `font-mono text-[11px] uppercase tracking-[0.22em] text-accent` (with `[ ... ]` framing brackets) | Section labels |
| Caption | `font-mono text-[10-11px] uppercase tracking-[0.18-0.22em] text-mute` | Stats, marquee, footer notes |
| Code | `font-mono text-[12.5px] leading-[1.7] uppercase` | Terminal block |

**Casing**: all display headlines, eyebrows, button labels, and marquee items are uppercase per the Swiss Industrial archetype. Body prose stays sentence case.

Custom letter-spacing tokens (`tailwind.config.ts`):

- `tracking-tighter2` = `-0.04em` (display headers, card titles, stat figures)
- `tracking-wider2` = `0.08em` (button labels)
- `tracking-tightish` = `-0.018em` (legacy, retained for compatibility with any inline use)

---

## 6. Spacing, radius, shadows, and borders

**Spacing scale** (used directly via Tailwind utilities; no `space-*` extends): `4 / 8 / 12 / 16 / 24 / 40 / 64 / 96`. Odd numbers (6, 10, 14) are forbidden — they read as improvised. Vertical section padding is `py-20 sm:py-28` everywhere; horizontal page padding is `px-5 sm:px-8`.

**Radius scale**: `0 / 2 / 6` — never larger than 6px. Cards are nearly square. Tailwind config:

```ts
borderRadius: { none: "0", sm: "2px", DEFAULT: "6px" }
```

The accent ring on the featured pricing card uses `ring-1 ring-inset ring-accent` (no rounded corners — the rectangle stays).

**Shadows**: there are none. The studio aesthetic uses 1px borders (`border-ink/10`) instead of shadows. Glassmorphism is forbidden. Only the hero's "press scan" line carries a depth cue, and it uses opacity, not shadow.

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
| `Logo` | [`Logo.tsx`](apps/landing/src/components/Logo.tsx) | Inline-SVG wordmark "DropHouse" with the aviation-red square-block glyph. Used in nav + footer + favicon source. |
| `WireframeMock` | [`WireframeMock.tsx`](apps/landing/src/components/WireframeMock.tsx) | Hero aside — an inline SVG miniature of a landing page with an animated 1px aviation-red bar that scans top-to-bottom (the "press scan"). Disabled under `prefers-reduced-motion`. |
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
2. **Hero** — eyebrow, H1 ("A landing page on your domain in 30 minutes."), lead paragraph, mono callout, two CTAs, three-stat row, `WireframeMock` aside with press scan.
3. **Marquee** — bone-tinted single row of 8 mono captions, pipe-separated. Acts as a feature-strip without claiming features.
4. **Proof** (`#proof`) — copy block + `PortfolioGrid` of 20 sibling slugs. Anchors the self-referential proof claim.
5. **Triad** (`#features`) — three numbered cards: brand pyramid → repo ownership → re-brief workflow.
6. **FromTheCode** — ink-on-paper inverted band; copy + a terminal-block showing the four passes (`brand / copy / press / deploy`).
7. **Pricing** (`#pricing`) — H2 + paragraph + crypto-checkout note + 4-card grid (Free / Self-serve / Team / Concierge). The two paid plans route through the NOWPayments CTA.
8. **Concierge** (`#talk`) — three-step ordered list + `cal.com/prin7r/drophouse-concierge` button.
9. **Send** (`#send`) — split layout: copy bullets on the left, `BriefForm` on the right.
10. **Footer** — Logo + tagline + nav + self-referential proof line.

**Hero CTA hierarchy**: primary "Send a brief" (`#send`), secondary "Talk to a human" (`#talk`). The pricing-section CTAs ("Pay $29 / $99 in crypto") are tertiary entry points that bypass the brief form for users who already know what they want.

---

## 10. Imagery and generated asset rules

DropHouse's identity is **type-led, not image-led**. The landing ships with **zero raster images**. All visual elements are SVG (logo, wireframe mock) or text-on-color (portfolio grid, terminal block).

**Why no hero image**: hero photography on a Webflow-alternative landing reads as ironic. Type and a 1px scan line tell the story better.

**Generated-asset policy**: if and when we add raster imagery (e.g. a customer logo wall once we have customer logos), assets go in `apps/landing/public/generated/` with a sibling `<filename>.prompt.txt` recording the prompt + model + date. The `prin7r-generate-image` paperclip tool (GPT Image 2 backed) is the preferred generator. Fallback: SVG illustrations inline; geometric backgrounds; reference-only mockups. No stock photography.

**Status**: no generated assets present in this build. If GPT Image 2 billing becomes available later, candidate slots are: (a) a cropped photograph of an actual print proof for the *FromTheCode* dark band, (b) an isometric of the four-pass pipeline. Both are deferred.

**`alt` text policy**: every `<img>` ships with descriptive alt text; decorative SVG that conveys no information uses `aria-hidden="true"` rather than `alt=""` because there is no `<img>` element for those (they are inline `<svg>`).

---

## 11. Motion and interaction rules

DropHouse's motion budget is intentionally tiny. Three approved motion types:

1. **Page enter**: nothing. The page is the reward; no reveal animation.
2. **Hover**: 80ms color shift on links and buttons. No scale, no translate, no shadow. Buttons darken via `hover:opacity-90` (filled) or invert via `hover:bg-ink hover:text-paper` (outline).
3. **Press scan**: a single looping 1px aviation-red bar moving top-to-bottom over the `WireframeMock` SVG, indicating "deploy in progress". This is the only loop on the page.

**Reduced motion**: if the user has `prefers-reduced-motion: reduce`, the press-scan bar stops at the bottom and freezes (no looping). All other interactions are already motion-free.

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

![DropHouse landing — desktop, 1440×900](docs/screenshots/landing-desktop.png)

**Mobile (390 × 844)** — [`docs/screenshots/landing-mobile.png`](docs/screenshots/landing-mobile.png)

![DropHouse landing — mobile, 390×844](docs/screenshots/landing-mobile.png)

**Capture command** (re-run when the landing changes):

```bash
# from a host with playwright installed
node /tmp/prin7r-screenshots/capture.mjs https://landing-pages-on-demand.prin7r.com
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
| 2026-05-08 | **Wave 2 redesign — Swiss Industrial Print archetype**. Retired the warm beige paper/bone palette (`#FAF7F2` / `#EDE7DD`) for newsprint off-white `#F8F8F6` over carbon ink `#0A0A0A`. Pushed accent from tomato `#E8554E` to aviation red `#E61919` per Swiss Industrial alert-grade rule. Retired Fraunces (serif) and Inter (banned) display+body stack; replaced with Archivo Black (display, uppercase, viewport-bleeding macro scale) + Geist (body) + JetBrains Mono (kept). Added `.display-mega` and `.display-large` clamp() utilities for viewport-bleeding type. Hero H1 redrafted as a single architectural block ("30·MINUTES"). Replaced the previous 3-column zig-zag with rigid hairline-grid sections separated by 2px solid ink rules between each band. Pricing tiers became a 4-cell rigid grid with monolithic display prices and a square aviation-red "Recommended" pill on the Self-serve tier; CTA on the featured tier flipped from filled-ink to filled-accent. Portfolio rack rebuilt with extreme scale variance — two hero cells (col-6 row-2), supporting cells at col-3 / col-4 / col-6, and per-cell type sized to its span (mega 56px / mid 34px / micro 20px). Marquee converted to a kinetic ink-on-paper inverted strip with `///` separators and reduced-motion fallback. Added a fixed-position low-opacity SVG noise grain overlay to break digital flatness. Removed all `border-radius` (radius scale is now `0 / 0 / 0`). Re-shot desktop (1440×900) and mobile (390×844) screenshots from the redeployed live site and replaced the pre-redesign captures in `docs/screenshots/`. NOWPayments routes, brief webhook, sitemap, and live URL contract were preserved unchanged. | Wave 2 redesign agent |
| 2026-05-08 | **Wave 2 rebrand v1 — Render → Pagewright (FAIL on render.com PaaS conflict)**. Per the `wave2-name-research.md` backfill audit, "Render" was unsalvageable: render.com is Render Inc. (a major Vercel/Heroku-tier PaaS), the SERP for "Render landing pages" is buried under their docs. Renamed to Pagewright — a craft-led compound (page + wright). | Wave 2 rebrand agent |
| 2026-05-08 | **Wave 2 rebrand v2 — Pagewright → DropHouse (FAIL on pagewright.co.uk and Playwright SEO eclipse)**. The Pagewright name failed two new criteria: (a) `pagewright.co.uk` is a live "Your Digital Layer, Handled" agency in the same sector, and (b) Microsoft's `playwright.dev` causes autocorrect/SEO eclipse on every search for "Pagewright". Renamed to **DropHouse** on `drophouse.com` (verified available). Brand essence: "drop a landing page on your domain" — productized landing studio, fast finish, museum-quality. Monogram swapped from `P` → `D` (or `Dh` for the double-letter mark). All occurrences of `Pagewright` / `pagewright` / `PAGEWRIGHT` swept across `apps/landing/src/**`, all 13 files in `docs/`, `README.md`, `DESIGN.md`, `apps/landing/package.json` (`@prin7r/pagewright-landing` → `@prin7r/drophouse-landing`), `Dockerfile.landing`, the NOWPayments checkout order-description block, the wordmark in `Logo.tsx`, the metadata title + OG + Twitter card in `layout.tsx`, and the `pitch-deck.html`. The placeholder subdomain `drophouse.so` (carried over from the v1 sweep) was promoted to `drophouse.com` to match the verified domain. One vestigial Render reference (`apps/app/README.md` line 3, "backs Render's self-serve product") was caught and cleaned to "backs DropHouse's self-serve product" — a layered three-stage cleanup (Render → Pagewright → DropHouse). The repo slug `landing-pages-on-demand`, GitHub remote, live URL `landing-pages-on-demand.prin7r.com`, NOWPayments invoice contract, brief-form webhook, and sitemap all stayed unchanged so no external integration broke. | Wave 2 rebrand Agent O |
