# 04 — Pain points (root-cause analysis of current alternatives)

## The job

The buyer has a fully-formed business idea + a real audience and needs a marketing one-pager **on a real domain, with real analytics, today**. They are not shopping for "a website." They are shopping for **the elimination of the 4-hour Webflow afternoon**.

## Alternative 1 — Generic page builders (Webflow, Framer, Squarespace, Wix)

| Layer                | Specific failure                                                                                                  |
|----------------------|--------------------------------------------------------------------------------------------------------------------|
| **Time to first value** | The empty canvas is the product. The first 30 minutes are spent picking a template that already looks like 8,000 other startup landings. |
| **Copy**             | The builder writes zero copy. The buyer's blank-page anxiety is the bottleneck, not the layout grid.              |
| **Identity**         | Templates leak their author's identity through specific component choices (the round avatar in the testimonial card, the cyan gradient on the hero button). |
| **Deploy**           | "Publish" works, but mapping a custom domain involves DNS edits the buyer must learn for every project.           |
| **Iteration**        | Editing copy means editing every page section by hand; there is no "regenerate with a different positioning" affordance. |
| **Pricing**          | $23–$49/mo per site adds up to thousands per year for an agency running 10 client landings.                       |

Root cause: **page builders solve the layout problem; the buyer's problem is the strategy + copy problem.**

## Alternative 2 — AI website generators (Durable, 10Web, Mixo, Hostinger AI)

| Layer                | Specific failure                                                                                                  |
|----------------------|--------------------------------------------------------------------------------------------------------------------|
| **Output quality**   | Pages obviously share a single template — the same accordion FAQ, same "Trusted by" strip with grayed logos.      |
| **Identity**         | "AI-generated" reads as a smell, not a feature. The audience is sophisticated enough to detect Inter + indigo + glass blur in ≤2 seconds. |
| **Domain workflow**  | Output is on `*.durable.co` until you upgrade and reconfigure DNS in their admin.                                 |
| **Editability**      | Most AI generators are dead-end outputs — once "generated," you live with what you got, or start over.            |
| **Tech stack**       | Closed, hosted, often WordPress-under-the-hood. A developer can't take the artifact, version it, and self-host.   |

Root cause: **AI generators optimize for "wow, look, it generated a page" demos; they don't optimize for the deployed-and-credible page the buyer needs to put on their X bio.**

## Alternative 3 — Freelance designer + developer (Upwork, Fiverr, Dribbble)

| Layer                | Specific failure                                                                                                  |
|----------------------|--------------------------------------------------------------------------------------------------------------------|
| **Time**             | Average turnaround: 5–10 business days for the first cut. Premium rates for "this week."                          |
| **Variance**         | Quality is bimodal: $400 gets you a passable Figma → 8 days; $4,000 gets you the right thing.                     |
| **Brief overhead**   | The freelancer needs the same brief DropHouse needs — but the buyer has to write it twice (once to filter freelancers, once to brief the chosen one). |
| **Coordination**     | Designer hands off to dev; dev hands off to deploy; deploy hands off to "wait, the copy is wrong"; cycle repeats. |
| **Vendor lock-in**   | Custom Webflow site means you re-hire the same freelancer for every change — billed hourly, scheduled weekly.     |

Root cause: **the freelance market is sized for $4k bespoke work, not $400 done-fast work; the price floor and the time floor are misaligned with the actual job.**

## Alternative 4 — DIY by the founder

| Layer                | Specific failure                                                                                                  |
|----------------------|--------------------------------------------------------------------------------------------------------------------|
| **Opportunity cost** | The founder's hour is the most expensive hour in the company. A page that takes 4 hours costs ~$600 in foregone work for a $200k-paid founder. |
| **Skill mismatch**   | Most founders are not designers; the page reads as "founder-built" — which is fine for v0, fatal at fundraise.    |
| **Iteration**        | Founder-built means founder-maintained; every copy tweak is a Saturday.                                           |

Root cause: **founders confuse "I can do it" with "I should do it."**

## What DropHouse attacks specifically

DropHouse does not compete on "more flexible" or "more AI." DropHouse competes on **the entire delivery loop**:

1. The brief is the only artifact the buyer has to produce.
2. The output is on the buyer's own domain (no `*.drophouse.com` URL).
3. The output is a real GitHub repo the buyer can fork.
4. The turnaround is measured in minutes, with a public counter.
5. Iteration is a re-brief, not a manual edit session.

The other categories all leave at least one of those five hurdles in the buyer's lap.
