# 09 — Go-to-market: 90-day plan

The plan is dated relative to **launch day** (T=0). The launch day is the day DropHouse's marketing site (`landing-pages-on-demand.prin7r.com`) and the prin7r-projects portfolio (20 landings) are simultaneously live and link to each other.

## Pre-launch (T-21 to T-1)

| Day  | Milestone                                                                 |
|------|----------------------------------------------------------------------------|
| T-21 | Landing site live on staging subdomain; 20 prin7r-projects landings live. |
| T-18 | Comparison posts (3 of 12) drafted; one published as soft-launch SEO seed.|
| T-14 | Notion kanban for inbound briefs; SQLite queue tested with 50 briefs.     |
| T-10 | Concierge process documented; first internal "rehearsal call" logged.     |
| T-7  | Hunter list (30 contacts) primed via DM for the PH launch.                |
| T-3  | HN post drafted, reviewed by 3 trusted readers.                            |
| T-1  | Final pricing-page audit; CTA copy A/B variants frozen.                    |

## Week 1 — Launch (T=0 to T+6)

- **T=0 (Mon)**: HN Show HN at 09:00 ET. Concurrent X thread. PH launch queued for T+1.
- **T+1 (Tue)**: PH launch. Concierge inbound capacity capped at 6 calls/day.
- **T+3 (Thu)**: First newsletter sponsorship sends (Demand Curve).
- **T+5 (Sat)**: Public retro post with Day-1 → Day-5 numbers (briefs, conversion, top objection).
- **T+6 (Sun)**: Quiet day; bug-fix sprint on whatever broke.

**Targets**: 600 brief-starts, 200 brief-submits, 25 paid (self-serve), 4 paid (concierge), $4k MRR.

## Weeks 2–4 — Iterate (T+7 to T+27)

- Weekly X thread Tuesday 10a.
- One newsletter send per week (Demand Curve, RevGenius newsletter, MarketingDive).
- 2 SEO comparison posts/week.
- Concierge calls: 12/week target.
- Tighten the activation step (brief-submitted → page-live) to ≤25 min p95.
- Ship: brand-kit reuse, custom-domain UX (currently a manual ticket).

**Targets** (cumulative T+27): $14k MRR, 80 paid self-serve, 18 paid concierge, 110 NPS responses with median ≥45.

## Weeks 5–8 — Channel deepening (T+28 to T+55)

- Begin "Built with DropHouse" footer experiment: A/B remove/keep on a 50/50 split. (Removal is a paid feature; the experiment measures whether the footer drives signups or just looks branded.)
- Launch the team tier publicly. Reach into 3 fractional-CMO communities for the team-tier soft sell.
- Open a `templates/` directory: 4 hand-curated variants (saas / agency / clinic / course) the brief generator can draw on.
- Start the "drophouse.weekly" — 1 newsletter/week shipping the previous week's portfolio (Mailchimp, ~$0 spend).

**Targets** (cumulative T+55): $35k MRR, 200 paid self-serve, 35 paid concierge.

## Weeks 9–12 — Position (T+56 to T+89)

- Comparison post grid completed (12/12). Begin publishing one "we re-pressed the X.com landing" satirical demo per week.
- Apply for a Stripe Atlas / Mercury feature placement.
- First case study: a paying customer's landing + before/after, on their domain.
- Refresh hero copy with month-3 numbers (X pages live, X median minutes-to-live).
- Start scoping Wave 3 (the SaaS app proper — auth, dashboard, brief history) for build at T+90.

**Targets** (cumulative T+89): $60k MRR, 350 paid self-serve, 55 paid concierge, 1 named case study customer.

## Risks + responses

| Risk                                             | Trigger metric                       | Response                                                |
|--------------------------------------------------|--------------------------------------|---------------------------------------------------------|
| Activation > 30 min p95                          | Real-time monitor; alert on day 2    | Pause new briefs; debug the orchestrator's slowest pass.|
| Customer churn > 12% in month 1                  | Day-30 cohort retention              | 30-min interviews with 5 churned customers.             |
| HN doesn't catch the launch                      | T+0 +6h: <3,000 visits               | Pivot to a paid X thread + 2 newsletter sponsorships.   |
| Concierge concentration risk (one human bottleneck) | Calendly wait time > 5 days       | Hire a second concierge before T+45.                    |
| Per-page infrastructure cost > $0.30/visitor     | Monthly server bill / unique visitors| Move static assets to Cloudflare R2 + cache aggressively. |
