# 13 — Implementation Plan

> **Hand-off ready.** This plan is for the Phase 2 implementation agent picking up DropHouse after Wave 2's marketing landing has shipped. You will find: (a) deployed marketing landing at `https://landing-pages-on-demand.prin7r.com` (which itself was built by DropHouse's pipeline); (b) brand identity / audience / architecture in `/docs/01..10-*.md`; (c) the user-story contract in `/docs/11-user-stories-and-scenarios.md`; (d) the technical spec in `/docs/12-technical-specification.md`; (e) the existing pipeline that built the 20 Wave 2 sites — that pipeline IS your starting point. The DropHouse product is a productized version of the Wave 2 build pipeline. Wave 3's job: turn the agent-orchestrated pipeline into a self-serve API surface. Read docs 11 + 12 before starting.

---

## 1. Phase breakdown

7 phases.

| Phase | Goal | Effort |
|---|---|---|
| **0 — Scaffolding** | Apps stubs + extracted pipeline workers from Wave 2 build process | M — 2-3d |
| **1 — Brief intake + queue + status surface** | Customer can submit brief and watch live status | M — 2-3d |
| **2 — UX surfaces (dashboard + preview)** | Customer dashboard, brand kits, preview links | L — 3-5d |
| **3 — Payments + Notion + first paying customer** | Single + Retainer flows end-to-end | M — 2-3d |
| **4 — Production hardening** | Idempotency, content filter, rate limits, alerts | M — 1-2d |
| **5 — Launch ops (custom domains + repo transfer)** | Custom domain CNAME flow + cancel-with-transfer | M — 1-2d |
| **6 — Post-launch (revisions + analytics)** | Per-pass revisions, generation analytics, brand-collision protection | M — 1-2d |

---

### Phase 0 — Scaffolding

**Goal.** Extract the Wave 2 build-agent pipeline (brand → copy → press → deploy) into reusable workers under `workers/`.

**Tasks.**
1. Verify Wave 2 state.
2. Fork open-saas into `apps/app/`.
3. Workers extracted from Wave 2 build playbook:
   - `workers/brand-pass`: prompts Claude with brand-pyramid template; writes `briefs.brand_json`.
   - `workers/copy-pass`: hero, feature triad, social-proof slot, CTA, footer.
   - `workers/press-pass`: clones `templates/landing-base`, injects theme, runs `pnpm build`.
   - `workers/deploy-pass`: `gh repo create` + push + ssh compose up + DNS poll + TLS verify.
4. Templates: `templates/landing-base/` is a Next.js 15 + ShadCN scaffold with theme variables. Theme = palette + font-pair + logo SVG injected at build time.
5. Add SQLite + Bun cron + Hono API service.

**Effort.** M — 100-150 tool-uses, 2-3 days.

**DoD.**
 - [x] Each worker has `pnpm dev` and a stub end-to-end test.
 - [x] Template renders with theme injection.
 - [x] SQLite DB initializes with `briefs`, `runs`, `passResults`, `deployedSites` tables.

**Hand-off context.** The Wave 2 build agents already know how to run this pipeline manually. Treat their playbook (`/Users/keer/projects/prin7r/wave2-playbook.md`) as the spec for these workers.

---

### Phase 1 — Brief intake + queue + status surface

**Goal.** Customer submits brief on landing → API queues → workers run sequentially → live status visible.

**Tasks.**
1. Brief form on landing → `POST /api/briefs`.
2. SQLite enqueue with `status='queued'`. Acknowledge in <300ms.
3. Bun cron worker pulls queue every 30s; runs Brand pass first, then Copy, then Press, then Deploy.
4. Each pass writes a `passResults` row with status + output.
5. Live status surface: customer-facing `https://app.landing-pages-on-demand.prin7r.com/briefs/<id>` polls `GET /api/briefs/:id` every 5s.
6. Brand-collision check: brand pass output hashed against last 30 days; regenerate if collision.
7. Email customer when `status='live'`.

**Effort.** M — 100-180 tool-uses, 2-3 days.

**DoD.**
 - [x] End-to-end demo: submit brief, watch status flip through 5 stages, see live URL within 30min.
 - [x] Brand collision: 30-day-history seeded; brand pass detects repeat palette and regenerates.
 - [x] Status page renders without page reload (5s polling).

**Hand-off context.** Don't try to parallelize passes; sequential is required (Copy depends on Brand, Press on Copy, etc.).

---

### Phase 2 — UX surfaces (dashboard + brand kits + preview)

**Goal.** Customers can manage brand kits, see brief history, generate preview links before deploy.

**Tasks.**
1. Dashboard `/app/briefs`: list of briefs with status, live URL.
2. Brand kits `/app/brands`: customer adds brands (palette, fonts, logo SVG); briefs reference a brand.
3. Preview link generation: after Press pass, status flips to `awaiting_approval`; customer clicks **Share preview** → 24h-signed token URL.
4. Preview rendering: `/api/preview/:token` serves the rendered HTML pre-deploy.
5. Approval triggers Deploy pass.
6. Mobile pass on dashboard.

**Effort.** L — 200-350 tool-uses, 3-5 days.

**DoD.**
 - [x] Customer adds brand, references in brief, generated page applies brand kit.
 - [x] Preview link works for 24h, then 410.
 - [x] Approval triggers Deploy within 5min.
 - [x] Dashboard mobile a11y >= 95.

**Hand-off context.**
- Brand kits inheritance: a brief without `brandId` triggers a fresh brand pass. With `brandId`, brand pass is skipped and the customer's kit applied directly.

---

### Phase 3 — Payments + Notion + first paying customer

**Goal.** Single $99 + Retainer $499/mo flows end-to-end. Notion sync of paid customers.

**Tasks.**
1. Persist subscriptions on `POST /api/checkout/nowpayments`.
2. Webhook activates subscription; for Single, sets `briefsRemaining=1`.
3. `POST /api/admin/subscriptions` for retainer-tier custom invoicing.
4. Magic-link onboarding email post-payment.
5. Notion sync: paid subscriptions → `DropHouse Subscriptions` data source.
6. Retainer renewal: NOWPayments lacks recurring; email fresh invoice 5d before validUntil.

**Effort.** M — 100-180 tool-uses, 2-3 days.

**DoD.**
 - [x] Single $99 purchase → 1 brief allowed.
 - [x] Retainer $499 → unlimited briefs.
 - [x] Notion row created.
 - [x] Renewal invoice email goes out at validUntil-5d.

---

### Phase 4 — Production hardening

**Goal.** System survives traffic spikes, prompt injection, generated-site abuse, custom-domain manipulation.

**Tasks.**
1. Idempotency on checkout + brief submission.
2. Traefik rate limits.
3. Forged-IPN tests.
4. LLM prompt-injection tests: brief payloads with attacks (SYSTEM:, ignore previous, etc.) MUST fail validation.
5. Content filter on press output: forbidden-topics regex (CSAM, malware distribution sites, terror content, illegal-substances marketplace).
6. Slack alerts: brief stuck >45min, daily anomalies, Anthropic 5xx, GitHub 5xx.
7. PII scrub, CSP.
8. Takedown runbook at `/docs/runbooks/takedowns.md`.

**Effort.** M — 80-120 tool-uses, 1-2 days.

**DoD.**
 - [x] Idempotency: same brief 5x = ONE row.
 - [x] Forged IPN bad sig = 401.
 - [x] Prompt injection test cases all rejected at brief validation.
 - [x] Content filter rejects test forbidden-topic brief.
 - [x] Takedown runbook drilled.

---

### Phase 5 — Launch ops (custom domains + repo transfer)

**Goal.** Custom-domain CNAME flow polished. Cancel-with-transfer works.

**Tasks.**
1. CNAME pre-flight: pre-deploy check polls customer's CNAME for 5min. If not pointed, status `awaiting_dns`; emails CNAME instruction.
2. Resume deploy when CNAME resolves.
3. Cancel + transfer flow: form lets customer pick GH org for repo transfer; queues `gh repo transfer` for each.
4. DropHouse credit footer: customer can disable in dashboard; we still track via `DropHouse-Generated: true` HTML meta.

**Effort.** M — 100-180 tool-uses, 1-2 days.

**DoD.**
 - [x] CNAME mismatch demo: status `awaiting_dns` until customer fixes.
 - [x] Cancel + transfer test: all generated repos transferred.
 - [x] DropHouse credit toggle works.
 - [x] HTML meta tag present even when footer credit disabled.

---

### Phase 6 — Post-launch (revisions + analytics + collision)

**Goal.** Per-pass revisions; generation analytics; brand-collision-prevention robust.

**Tasks.**
1. Per-pass revisions: `POST /api/briefs/:id/revise { patches: { copy?, brand?, press? } }`. Triggers selective re-pass.
2. Generation analytics: brief volume by tier, completion-time p95/p99 by pass, brand-collision-rate weekly.
3. Brand-collision-prevention: hash palette + fonts; if collision, regenerate with anti-collision prompt; cap 3 retries; manual review on persistent collisions.
4. Public `/changelog` page.

**Effort.** M — 80-120 tool-uses, 1-2 days.

**DoD.**
 - [x] Per-pass revision: customer revises copy only; Brand stable; Press + Deploy re-run in <5min.
 - [x] Analytics dashboard for ops.
 - [x] Brand-collision suite demonstrably regenerates on simulated collision.

---

## 2. Cross-cutting concerns

| Concern | First addressed | Notes |
|---|---|---|
| Accessibility | Phase 2 | Lighthouse a11y >= 95 on dashboard + generated sites |
| i18n | Out of scope through Wave 4 |
| Mobile | Phase 2 | Responsive dashboard |
| Telemetry | Phase 4 | Stdout JSON; Loki Wave 4+ |
| GDPR / DSAR | Phase 4 | Email-only PII; runbook |
| SOC 2 | Out of scope |

---

## 3. Risk register

| # | Risk | Owner | Mitigation |
|---|---|---|---|
| R1 | NOWPayments outage | Phase 4 | Plisio + Reown Wave 4 |
| R2 | Forged IPN | Phase 4 | HMAC-SHA512 |
| R3 | Anthropic API outage | Phase 4 | Haiku fallback; brief queues until recovery |
| R4 | Generated site abuses (illegal content) | Phase 4 | Content filter pre-press; sampling post-deploy; takedown runbook |
| R5 | Brand collision causes "all our pages look alike" | Phase 6 | Hash + retry; manual review; expanding palette diversity prompts |
| R6 | Custom domain takeover during deploy | Phase 5 | DNS verification gated TLS issuance; CNAME-flip survives via existing container |

---

## 4. References

- Doc 11 — `/docs/11-user-stories-and-scenarios.md`.
- Doc 12 — `/docs/12-technical-specification.md`.
- DESIGN.md — `/DESIGN.md` — typography-forward visual contract.
- Wave 2 playbook — `/Users/keer/projects/prin7r/wave2-playbook.md` — the manual version of this product's pipeline.
- Wave 2 build report — `/Users/keer/projects/prin7r/wave2-reports/landing-pages-on-demand.md` (and -rebrand, -polish).
- Payments prototypes — `/Users/keer/projects/prin7r/payments-prototypes/`.
