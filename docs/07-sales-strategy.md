# 07 — Sales strategy

## Motion: PLG with a high-touch concierge tail

- **Self-serve is the front door.** Free brief → live URL on a Render-owned subdomain in 30 minutes. No card required for the first page.
- **PLG paywall trips on the second page** (custom domain) and on team features (multi-brief workspace, brand-kit reuse).
- **Concierge tier is inbound only.** No outbound sales. The "Talk to a human" CTA on the landing routes to a single calendar; the concierge call is the close.

## Tiers

### Free — *"One page, our subdomain, no card"*
- 1 brief / lifetime
- Output on `<your-slug>.render.so` (placeholder; final domain TBD)
- 7-day analytics retention
- "Built with Render" footer (removable on paid tiers)

### Self-serve — $29/mo
- Unlimited briefs
- Custom domain (Render handles ACME)
- 90-day analytics retention
- Edit-via-PR (each brief is a real GitHub repo on the user's account or a Render-owned org)
- One brand-kit slot

### Team — $99/mo
- Up to 5 seats
- 10 brand-kit slots
- Shared brief library
- Page versioning + diff
- Slack notifications when a page goes live

### Concierge — $1,200 setup + $99/mo retainer
- 20-min onboarding Zoom; brief filled on-call
- One human polish pass (typography, photo, copy nuance)
- 48h iteration cycle for the first month
- Loom walkthrough delivered with the page
- White-glove domain setup if the buyer doesn't own one

## Pricing logic

The competitor pricing matrix:

| Vendor              | Plan name        | $/mo | Implied $/page (10 pages) |
|---------------------|------------------|-----:|--------------------------:|
| Webflow             | CMS              | $29  | $29 (template anxiety free) |
| Framer              | Pro              | $30  | $30                       |
| Durable             | Business         | $25  | $25                       |
| Squarespace         | Business         | $23  | $23                       |
| Freelance designer  | one-page         |   —  | $400–$4,000 / page         |
| Agency              | one-page         |   —  | $4,000–$15,000 / page      |

Render's $29/mo with unlimited briefs prices like a builder but delivers like a (cheap) freelancer. The team tier ($99) prices like a single Webflow seat but absorbs five.

## Objection handling

| Objection                                          | Reframe                                                                                  |
|----------------------------------------------------|-------------------------------------------------------------------------------------------|
| "AI-generated pages all look the same."            | Show the prin7r-projects portfolio: 20 landings, 20 distinct identities, all by the pipeline. |
| "I want to control every pixel."                   | Output is a real Next.js + Tailwind repo on your GitHub. Edit anything; redeploy with `git push`. |
| "What if I want to change the copy later?"         | Two paths: re-brief (regenerate with a tweaked input) or open a PR in your repo. Both supported. |
| "Why not just use Webflow?"                        | Webflow is a tool; Render is a service. The afternoon you'd spend in Webflow is the price. |
| "Will the page actually rank in search?"           | Output is a Next.js standalone with proper meta, OG, sitemap, structured data. Lighthouse SEO ≥95 baseline. |
| "$1,200 for concierge feels steep."                | Compare to a designer's deposit. Render's concierge ships the artifact in 48h, not 5 weeks. |

## Trial → paid conversion

| Stage                          | Target rate |
|--------------------------------|------------:|
| Visit → brief started          |        12%  |
| Brief started → submitted      |        65%  |
| Submitted → live page          |        96%  |
| Live page → viewed by buyer    |        88%  |
| Live page → upgrade to paid    |        18%  |
| Upgrade → 90-day retention     |        72%  |

Levers if the brief-start rate falls below target: tighten hero proof; promote one customer's deployed URL above the fold.

Levers if the upgrade rate falls below target: shorten the gap between "page is live" email and the upgrade prompt (offer 24h promo at signup); add a "first-month-free if you bring your own domain" promo.

## Sales motion calendar

| Time    | Activity                              |
|---------|----------------------------------------|
| Mon 9a  | Review weekend briefs + concierge inbound |
| Tue 10a | X thread post (channel 1)              |
| Wed     | One newsletter sponsorship send        |
| Thu     | Concierge calls (afternoon block)      |
| Fri 4p  | Weekly portfolio update on the marketing site (rolling 20 latest landings) |
