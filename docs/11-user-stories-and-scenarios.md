# 11 — User Stories and Scenarios

This document is the canonical input contract for Pagewright's Phase 2 SaaS implementation. It enumerates personas, primary user stories, end-to-end scenarios, and ties each flow to the frontend touch-points and backend services that doc 12 specifies. Every API endpoint in doc 12 must trace back to a story here; no orphan endpoints, no orphan stories.

Pagewright is a **productized landing-page studio** — operator submits a brief, receives a deployed branded one-pager on their domain in 30 minutes. The product is **the deployed URL itself**. Self-referential proof: the Pagewright marketing site WAS built by Pagewright; same for the 19 sister Wave 2 landings.

---

## 1. Personas summary

### P1 — Maya, technical founder of Series A SaaS (primary; deep dive `05-audience-profile.md` §Persona 1)

34, ex-staff-engineer, ~$5M ARR / 25 people. Personal budget $0-$50/mo; company budget $200-$500/mo if framed against one Webflow seat. Voice cue: "send brief at 9am, live URL by 9:30am, with a real cert from Let's Encrypt." Trigger: needs to launch new product line on Tuesday.

### P2 — Daniel, fractional CMO with 6 active clients (secondary; deep dive `05-audience-profile.md` §Persona 2)

41, runs retainer practice. Goal: 18 campaign LPs/quarter across 6 clients without adding a designer. Voice cue: "$99/mo, ships same-day." Buys retainer tier ($499/mo unlimited briefs).

### P3 — Author/course creator launching a single sales site (new in this doc)

42, mid-career professional shipping a $1,200 course. Voice cue: "I need this live in 24 hours; my course launches Tuesday." Buys Single tier $99 once.

### Anti-personas (out of scope — see doc 05 §Anti-personas)

Indie hacker collecting tools (free-tier shopper, 1-page only), agency owner who thinks her team can build it cheaper, multi-page corporate buyer (Pagewright is single-page only).

---

## 2. Primary user stories

12 stories covering brief → brand → copy → render → deploy → revisions.

1. **As Maya, I want to submit a brief in <2 minutes (form: business name, audience, value prop, primary CTA, custom domain), so that the friction to first deploy is low.** *(US-01)*
2. **As Maya, I want a deployed live URL on my custom domain within 30 minutes of submitting the brief, so that I can launch this Tuesday as planned.** *(US-02)*
3. **As Maya, I want a unique brand identity (palette, fonts, voice) generated for my landing — not a template — so that my page doesn't look like every other YC SaaS site.** *(US-03)*
4. **As Maya, I want the page to come with a real CMS (so I can edit copy without a deploy), real analytics, and a Let's Encrypt cert, so that I can hand it to my marketing hire on day 2.** *(US-04)*
5. **As Maya, I want to revise a section by re-prompting the brief, so that I can iterate without learning Webflow.** *(US-05)*
6. **As Daniel, I want a retainer tier ($499/mo unlimited briefs) with white-label client domains, so that my CFO sees one line item, not 18.** *(US-06)*
7. **As Daniel, I want client-domain pages that point at my customer's domain (not Pagewright's), so that the page reads as the client's own.** *(US-07)*
8. **As Daniel, I want to share a brief preview link with a client before deploy, so that approval cycles compress to one round.** *(US-08)*
9. **As any buyer, I want to see proof that Pagewright built this very site (footer mark + repo link), so that the claim is auditable.** *(US-09)*
10. **As any buyer, I want to pay $99 (Single) or $499/mo (Retainer) via NOWPayments USDT/USDC, so that I don't deal with a card-merchant onboarding.** *(US-10)*
11. **As any buyer, I want a refund within 7 days if the deployed page doesn't go live or doesn't match my brief, so that the 30-min promise has teeth.** *(US-11)*
12. **As any buyer, I want my generated repo handed to me (`gh repo transfer`) on cancellation, so that I don't lose my page if I leave.** *(US-12)*

---

## 3. Main scenarios (happy paths)

### Scenario 1 — Maya submits brief, page deploys in 28 minutes

**Trigger.** Maya reads HN comments at 09:00 Tuesday. Sees Pagewright footer credit on a peer's launch page.

**Steps.**
1. Lands on `https://landing-pages-on-demand.prin7r.com`. Reads hero. Self-referential footer "this site was built by Pagewright" closes the deal. *Frontend: `Hero`, `SelfReferentialFooter` on `apps/landing/app/page.tsx`.*
2. Clicks **Start brief** (Single tier, $99). 8-field form: name, audience, value prop, CTA, brand-color preference (free text or "surprise me"), tone, custom domain, brand assets (optional).
3. Pays $99 via NOWPayments. *Backend: `POST /api/checkout/nowpayments` returns invoice; pays USDT.*
4. IPN fires. *Backend: `POST /api/webhooks/nowpayments` activates brief.*
5. Brief enqueues. Email to Maya: "Brief received. Watch live deploy at https://app.landing-pages-on-demand.prin7r.com/briefs/<id>."
6. **+5 min.** Brand pass runs (Claude generates palette, fonts, voice). Status: "Brand drafted."
7. **+10 min.** Copy pass runs (hero, feature triad, social proof slot, CTA, footer). Status: "Copy drafted."
8. **+18 min.** Press pass runs (template clone + theme injection + `pnpm build`). Status: "Pressed."
9. **+25 min.** Deploy pass runs (`gh repo create` + push + SSH compose up + TLS). Status: "Deploying."
10. **+28 min.** Status: "Live." Email to Maya with `https://maya-launch.com` + repo URL + first-revisit link.

**Success criteria.** Brief → live URL <30min p95. TLS valid. Page LCP <2.5s on first load. Brand passes anti-template check (palette + voice not seen in past 30 days of generations).

**Frontend touch-points.** `Hero`, `SelfReferentialFooter`, `BriefForm`, `LiveDeployStatus` (poll `/api/briefs/:id`).
**Backend touch-points.** `POST /api/briefs`, `POST /api/checkout/nowpayments`, `POST /api/webhooks/nowpayments`, `BriefService`, `BrandPass`, `CopyPass`, `PressPass`, `DeployPass`.

### Scenario 2 — Daniel buys Retainer, runs 6 client briefs in week 1

**Trigger.** Daniel hears about Pagewright in a Demand Curve Slack.

**Steps.**
1. Lands. Clicks **Retainer $499/mo unlimited briefs**.
2. Pays. Onboarding magic-link email arrives. He logs into `app.landing-pages-on-demand.prin7r.com`.
3. Adds his 6 clients to "Brands" with each client's brand kit (colors, fonts, logos).
4. Submits 6 briefs over 3 days. Each picks the relevant client brand from the dropdown.
5. Each brief generates at the client's domain (e.g., `acme.client.com`). DNS prep: Daniel sets a CNAME at his client's DNS pointing to `pagewright-edge.prin7r.com`.
6. All 6 deploy in <30min each. Daniel forwards the URLs to clients.

**Success criteria.** Retainer dashboard supports multi-brand; brand kits applied to generated pages; CNAME-pointed domains TLS-valid.

### Scenario 3 — Maya revises copy via re-prompt

**Trigger.** Maya looks at the deployed page; the hero CTA copy is too soft.

**Steps.**
1. Dashboard `/app/briefs/<id>`. Clicks **Revise**.
2. Form: she edits the brief's "value prop" + "tone" fields.
3. Clicks **Re-prompt copy pass only** (skip brand + press; just re-render copy).
4. **+3 min.** Copy regenerated. Press + deploy run. Live URL updated.

**Success criteria.** Per-pass revision possible. Brand stable across revisions; copy refreshed in <5min.

### Scenario 4 — Daniel shares preview before deploy

**Trigger.** Daniel's client wants approval before launch.

**Steps.**
1. Daniel submits brief. After Press pass completes, status = "Awaiting approval."
2. Daniel clicks **Share preview**. Generates a temporary URL `preview.pagewright.app/<token>`.
3. Client opens preview, approves via "Looks good" CTA → `POST /api/briefs/:id/approve` → deploy pass runs.
4. Production URL active.

**Success criteria.** Preview URL temporary (24h TTL) and signed; approval → deploy in <5min.

### Scenario 5 — Free-tier buyer hits 1-page limit

**Trigger.** Greg (anti-persona) submits a 2nd free brief from same email.

**Steps.**
1. Form submission detects email already has 1 published brief on free tier.
2. Returns 402 with message "Free tier supports 1 page per email. Upgrade to Single ($99) or Retainer ($499/mo) to ship more."
3. CTA on form points at pricing page.

**Success criteria.** Clean rejection, no LLM tokens spent.

### Scenario 6 — Cancellation + repo transfer

**Trigger.** Maya cancels her Retainer.

**Steps.**
1. Dashboard → Settings → Cancel.
2. Form: confirm cancellation; option to transfer all generated repos to her GitHub org.
3. `POST /api/account/cancel { transferReposTo: 'maya-org' }` → for each generated repo, run `gh api -X POST /repos/prin7r-projects/<slug>/transfer -f new_owner=maya-org`.
4. Email confirms transfer + lists transferred repos.

**Success criteria.** All her generated repos owned by her org within 24h. Pagewright's deploy stops within 5min of cancellation.

---

## 4. Edge case scenarios

### EC-1 — IPN replay

`BriefService.activate()` idempotent on `(briefId, status)`.

### EC-2 — Custom domain DNS not pointed yet at deploy time

Pre-deploy check: poll the customer's CNAME for 5 minutes. If not pointed, status = "Awaiting DNS." Email customer with the CNAME instruction. Deploy completes once CNAME resolves.

### EC-3 — Brand pass collides with prior generation (palette repeated)

Brand pass output is hashed against the last 30 days of palettes. If collision, regenerate with anti-collision constraint. Caps at 3 retries; after 3, ship anyway with a flag for manual review.

### EC-4 — `pnpm build` fails (template error from edited copy)

Press pass fails → status = "Press error." Triage queue ping to ops desk. Refund within 24h if not resolved.

### EC-5 — `gh repo create` fails (rate limit or naming collision)

Retry with naming suffix. If exhausted, status = "Deploy error" + ops-desk page.

### EC-6 — Customer asks for multi-page (4+ sections)

Brand voice politely redirects: "Pagewright is single-page. For multi-page, see [partner agency]." No multi-page code path exists.

### EC-7 — Self-referential footer credit removed by customer

Allowed per terms. Brand still tracks the page via `Pagewright-Generated: true` HTML meta tag for portfolio audit.

---

## 5. Anti-scenarios

### AS-1 — No multi-page output

Pagewright is single-page only. Implementation must NOT add a multi-page renderer.

### AS-2 — No template marketplace

Each generation is unique-brand. Implementation must NOT add a "browse templates" route.

### AS-3 — No DIY editor (drag-drop)

Customer revises via re-prompt, not via WYSIWYG. Implementation must NOT add an inline editor.

### AS-4 — No "AI magic" copy ("AI-powered landings")

Brand voice forbids. Implementation must promise a deployed URL, not magic.

### AS-5 — No e-commerce / shopping cart

Pagewright is for marketing pages, not stores.

### AS-6 — No "free month" trial

Free tier has 1-page-per-email cap. No 14-day trial.

---

## 6. Cross-references

- §2 stories US-01..US-12 → doc 12 §3 endpoints.
- §3 scenarios → doc 12 §1 architecture services + doc 13 phase Definitions of Done.
- §4 edge cases → doc 12 §7 + doc 13 phase 4.
- §5 anti-scenarios → doc 12 §10 non-goals.
