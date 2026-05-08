# Landing pages on demand · DropHouse

> Send the brief. We write the copy, pick the palette, and push the page live to your domain — with a real Next.js repo, real analytics, and a real Let's Encrypt certificate. The site at the deploy URL below was generated, alongside 19 sibling landings, by the very pipeline this product packages.

- **Live**: <https://landing-pages-on-demand.prin7r.com>
- **DropHouse App**: `https://landing-pages-on-demand.prin7r.com/app` (Wave 3)
- **Notion opportunity**: `3543ceec-2619-8124-81fb-c9076db87b72` (Prin7r workspace, Opportunities database, Wave 2)
- **Pitch deck**: [`docs/pitch-deck.html`](docs/pitch-deck.html) — opens directly in a browser
- **Design system**: [`DESIGN.md`](DESIGN.md) — canonical design + style guide (15-section playbook)
- **Strategy + design dossier**: [`docs/`](docs/) (10 markdown files, see below)

## Screenshots

Captured from the live deploy via Playwright. Re-run the capture script after any landing change (see [`DESIGN.md`](DESIGN.md) section 13).

| Desktop — 1440 × 900 | Mobile — 390 × 844 |
| --- | --- |
| [![DropHouse landing — desktop](docs/screenshots/landing-desktop.png)](docs/screenshots/landing-desktop.png) | [![DropHouse landing — mobile](docs/screenshots/landing-mobile.png)](docs/screenshots/landing-mobile.png) |

## Repo layout

```
.
├── apps/
│   ├── landing/          Next.js 15 + Tailwind marketing site (production)
│   └── app/              Open-SaaS shell scaffold (Wave 3+)
├── server/               Hono + sql.js API (DropHouse backend)
│   └── src/
│       ├── index.js       API endpoints (docs/12)
│       ├── schema.js      SQLite schema
│       └── queue-processor.js  Brief pipeline processor
├── workers/              Pipeline workers (brand → copy → press → deploy)
│   ├── brand-pass/
│   ├── copy-pass/
│   ├── press-pass/
│   └── deplo-pass/
├── templates/
│   └── landing-base/    Next.js template for generated landings
├── docs/
│   ├── 01-brand-identity.md
│   ├── 02-architecture.md
│   ├── 03-user-journeys.md
│   ├── 04-pain-points.md
│   ├── 05-audience-profile.md
│   ├── 06-sales-channels.md
│   ├── 07-sales-strategy.md
│   ├── 08-marketing-strategy.md
│   ├── 09-go-to-market.md
│   ├── 10-pitch-deck.md
│   ├── 11-user-stories-and-scenarios.md
│   ├── 12-technical-specification.md
│   └── 13-implementation-plan.md
├── Dockerfile.landing    Multistage Next.js standalone build
├── docker-compose.yml    Single landing service + Traefik labels
├── .github/workflows/    CI: typecheck + next build
├── .env.example
├── LICENSE               (MIT)
└── README.md
```

## Stack

- **Landing** — Next.js 15 (App Router), React 19 RC, Tailwind v3, Fraunces + Inter + JetBrains Mono via `next/font`. Output is `standalone` for a slim Docker image.
- **App** (Wave 3) — fork of [`wasp-lang/open-saas`](https://github.com/wasp-lang/open-saas) for auth + billing + dashboard.
- **Server** — Hono + sql.js (SQLite) providing the DropHouse API.
- **Workers** — Brand/Copy/Press/Deploy passes using Anthropic SDK.
- **Deploy** — Docker Compose on `storage-contabo`. Reverse proxied by `dokploy-traefik` (Traefik v3 with Let's Encrypt HTTP-01).
- **DNS** — wildcard `*.prin7r.com → 161.97.99.120` already provisioned at Cloudflare; no per-subdomain record needed.

## Dev quickstart

### Landing page only
```bash
cd apps/landing
npm install
npm run dev
# -> http://localhost:3000
```

### DropHouse server (API)
```bash
cd server
npm install
npm start
# -> http://localhost:4000
# Health check: curl http://localhost:4000/health
```

### Full stack (landing + server)
```bash
# Terminal 1: landing page
cd apps/landing && npm run dev

# Terminal 2: DropHouse API server
cd server && npm start

# Terminal 3: Queue processor (processes briefs)
cd server && node src/queue-processor.js
```

## API Endpoints (docs/12)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/briefs` | POST | Submit new brief (3.1) |
| `/api/briefs/:id` | GET | Get brief status (3.2) |
| `/api/briefs/:id/revise` | POST | Revise brief (3.3) |
| `/api/briefs/:id/approve` | POST | Approve brief for deploy (3.4) |
| `/api/checkout/nowpayments` | POST | Create NOWPayments invoice (3.5) |
| `/api/webhooks/nowpayments` | POST | NOWPayments IPN webhook (3.6) |
| `/api/account/cancel` | POST | Cancel subscription (3.7) |
| `/api/preview/:token` | GET | Preview generated page (3.8) |
| `/api/admin/briefs/:id/retry` | POST | Retry failed pass (3.9) |

## Environment

See [`.env.example`](.env.example). Required for server:

```
# Server (.env in server/)
DATABASE_URL=./data/app.sqlite
PORT=4000

# NOWPayments (for checkout)
NOWPAYMENTS_API_KEY=...        # https://nowpayments.io > Settings > API Keys
NOWPAYMENTS_IPN_SECRET=...     # paired secret used to verify x-nowpayments-sig
NOWPAYMENTS_SANDBOX=false

# Anthropic (for workers)
ANTHROPIC_API_KEY=...          # https://console.anthropic.com/

# GitHub (for deploy pass)
GITHUB_TOKEN=...              # gh auth token

# SSH (for deploy pass)
SSH_HOST=161.97.99.120
SSH_USER=root
```

## Production deploy

The deploy target is `storage-contabo` (root@161.97.99.120) with Traefik in host-network mode listening on :80 / :443 and routing via container labels.

```bash
# on the deploy target
mkdir -p /opt/prin7r-deploys/landing-pages-on-demand
cd /opt/prin7r-deploys/landing-pages-on-demand
git clone https://github.com/prin7r-projects/landing-pages-on-demand.git .
docker compose build
docker compose up -d
# verify within 5 minutes:
curl -sI https://landing-pages-on-demand.prin7r.com
```

## Wave 3 Implementation Status

- [x] Phase 0: Scaffolding (server, workers, templates)
- [x] API endpoints (docs/12)
- [ ] Phase 1: Brief intake + queue + status surface
- [ ] Phase 2: UX surfaces (dashboard + preview)
- [ ] Phase 3: Payments + Notion + first paying customer
- [ ] Phase 4: Production hardening
- [ ] Phase 5: Launch ops (custom domains + repo transfer)
- [ ] Phase 6: Post-launch (revisions + analytics)

See [docs/13-implementation-plan.md](docs/13-implementation-plan.md) for details.

## Self-referential proof

This site, plus 19 sibling landings in the prin7r-projects portfolio, was generated by the **prin7r-projects Wave 2 pipeline** — the same pipeline this product packages. See [`docs/02-architecture.md`](docs/02-architecture.md) section *"How this very pipeline works"* for details.

## License

MIT — see [`LICENSE`](LICENSE).
