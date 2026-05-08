import { Logo } from "@/components/Logo";
import { WireframeMock } from "@/components/WireframeMock";
import { PortfolioGrid } from "@/components/PortfolioGrid";
import { BriefForm } from "@/components/BriefForm";
import { PricingCta } from "@/components/PricingCta";

export default function Home() {
  return (
    <main className="min-h-[100dvh] bg-paper text-ink">
      <div className="grain" aria-hidden />
      <TopNav />
      <Hero />
      <Marquee />
      <Proof />
      <Triad />
      <FromTheCode />
      <Pricing />
      <Concierge />
      <Send />
      <Footer />
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* TopNav                                                              */
/* ------------------------------------------------------------------ */

function TopNav() {
  return (
    <header className="border-b-2 border-ink">
      <div className="mx-auto flex max-w-content items-center justify-between px-5 py-4 sm:px-8">
        <Logo className="text-[22px]" />
        <span className="hidden font-mono text-[11px] uppercase tracking-[0.22em] text-ink/70 md:inline">
          UNIT 01 · WAVE 2 · REV 2.6
        </span>
        <nav className="hidden items-center gap-7 md:flex">
          <a
            href="#proof"
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink hover:text-accent"
          >
            Proof
          </a>
          <a
            href="#features"
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink hover:text-accent"
          >
            How
          </a>
          <a
            href="#pricing"
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink hover:text-accent"
          >
            Pricing
          </a>
          <a
            href="#send"
            className="bg-ink px-4 py-2 font-display text-[11px] uppercase tracking-wider2 text-paper hover:bg-accent"
          >
            Send brief
          </a>
        </nav>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Hero — viewport-bleeding macro-typography                           */
/* ------------------------------------------------------------------ */

function Hero() {
  return (
    <section className="relative overflow-hidden border-b-2 border-ink">
      {/* Top metadata strip — telemetry register */}
      <div className="border-b border-ink/30">
        <div className="mx-auto flex max-w-content items-center justify-between gap-4 px-5 py-3 font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink/70 sm:px-8">
          <span className="text-accent">[ RENDER / PRODUCTIZED LANDING STUDIO ]</span>
          <span className="hidden md:inline">SUBSTRATE: PAPER · INK: 0A0A0A · ACCENT: E61919</span>
          <span>BRIEF → LIVE · 27M MEDIAN</span>
        </div>
      </div>

      <div className="mx-auto max-w-content px-5 pt-10 sm:px-8 sm:pt-14">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
          A landing page on your domain in
        </p>

        {/* The macro headline — bleeds toward the viewport edge */}
        <h1
          className="mt-3 font-display uppercase text-ink display-mega"
          style={{ textWrap: "balance" }}
        >
          30
          <span className="text-accent">·</span>
          Minutes
        </h1>

        {/* Inline rule with metadata, like a draftsman's title block */}
        <div className="mt-6 grid items-end gap-x-6 gap-y-3 border-t-2 border-ink pt-5 md:grid-cols-12">
          <p className="text-[16px] leading-[1.55] text-ink/85 md:col-span-7 md:text-[18px]">
            Send the brief. Render writes the copy, picks the palette, and
            pushes the page live to your domain &mdash; with a real Next.js
            repo, real analytics, and a real Let&rsquo;s Encrypt certificate.
            <span className="block pt-3 font-mono text-[12px] uppercase tracking-[0.18em] text-ink/70">
              <span className="text-accent">{"<<"}</span>{" "}
              The site you are reading was rendered in 27 minutes, alongside 19
              sibling landings, by the very pipeline this product packages.
            </span>
          </p>

          <dl className="grid grid-cols-3 gap-px border-2 border-ink bg-ink md:col-span-5">
            <Stat k="27 min" v="median brief → live" />
            <Stat k="20 / 20" v="sibling landings" />
            <Stat k="real" v="repo · domain · cert" />
          </dl>
        </div>
      </div>

      {/* Hero CTAs */}
      <div className="mx-auto mt-10 flex max-w-content flex-wrap items-center gap-4 px-5 sm:px-8">
        <a
          href="#send"
          className="inline-flex items-center gap-3 bg-accent px-6 py-3 font-display text-[14px] uppercase tracking-wider2 text-paper hover:bg-ink"
        >
          Send a brief
          <span aria-hidden className="font-mono text-[12px]">→</span>
        </a>
        <a
          href="#talk"
          className="inline-flex items-center gap-3 border-2 border-ink px-6 py-3 font-display text-[14px] uppercase tracking-wider2 text-ink hover:bg-ink hover:text-paper"
        >
          Talk to a human
          <span aria-hidden className="font-mono text-[12px]">↗</span>
        </a>
      </div>

      {/* Wireframe band — full-width, anchored to the bottom of the hero */}
      <div className="mx-auto mt-12 max-w-content px-5 pb-16 sm:px-8 sm:pb-20">
        <div className="grid gap-x-8 gap-y-4 md:grid-cols-12">
          <div className="md:col-span-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
              [ LIVE PREVIEW ]
            </p>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink/70">
              RENDER SCAN <br /> IN PROGRESS
            </p>
            <p className="mt-6 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink/55">
              FIG. 01 · WIREFRAME / <br /> ACME ARTIFACT
            </p>
          </div>
          <div className="md:col-span-9">
            <WireframeMock />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="bg-paper p-4 sm:p-5">
      <dt className="font-display text-[26px] uppercase leading-none tracking-tighter2 text-ink sm:text-[30px]">
        {k}
      </dt>
      <dd className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-mute">
        {v}
      </dd>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Marquee — kinetic register                                          */
/* ------------------------------------------------------------------ */

function Marquee() {
  const items = [
    "27 MIN P95",
    "REAL NEXT.JS REPO",
    "CUSTOM DOMAIN",
    "LIGHTHOUSE ≥ 95",
    "LET'S ENCRYPT CERT",
    "EDIT VIA PR",
    "RE-BRIEF, DON'T REDESIGN",
    "20 SIBLING LANDINGS",
  ];
  // Two copies for seamless loop
  const loop = [...items, ...items];
  return (
    <div className="overflow-hidden border-b-2 border-ink bg-ink py-3 text-paper">
      <div className="marquee-track flex w-max items-center gap-6 px-5 font-mono text-[12px] uppercase tracking-[0.22em] sm:px-8">
        {loop.map((it, i) => (
          <span key={`${it}-${i}`} className="flex items-center gap-6">
            <span className="text-accent">///</span>
            <span>{it}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Proof — portfolio rack                                              */
/* ------------------------------------------------------------------ */

function Proof() {
  return (
    <section id="proof" className="border-b-2 border-ink">
      <div className="mx-auto max-w-content px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
              [ THE PROOF ]
            </p>
            <h2 className="mt-4 font-display uppercase text-ink display-large">
              20 landings.<br />
              One afternoon.
            </h2>
            <p className="mt-6 max-w-prose text-[16px] leading-[1.6] text-ink/85">
              Below is the full prin7r-projects Wave 2 portfolio. Each cell
              links to a different brand, palette, and voice &mdash; all
              generated by the same Render pipeline that built the page you
              are reading. Click any. Inspect the source.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="https://github.com/prin7r-projects"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 border-2 border-ink px-5 py-3 font-display text-[12px] uppercase tracking-wider2 text-ink hover:bg-ink hover:text-paper"
              >
                See the GitHub org
                <span aria-hidden className="font-mono text-[11px]">↗</span>
              </a>
              <a
                href="#features"
                className="inline-flex items-center font-mono text-[12px] uppercase tracking-[0.18em] text-ink underline-offset-4 hover:underline"
              >
                Or read how it works
              </a>
            </div>
          </div>
          <div className="lg:col-span-7">
            <PortfolioGrid />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Triad — three principles                                            */
/* ------------------------------------------------------------------ */

function Triad() {
  const items = [
    {
      t: "Brand pyramid first.",
      b: "Before the layout grid: essence, personality, palette, typography. The brand decision is locked, then the page is laid out around it. No template gallery.",
      tag: "01",
    },
    {
      t: "Yours to own.",
      b: "Each output is a real Next.js repo on your GitHub. Standalone build, Tailwind, no proprietary CMS. Fork it, extend it, walk away.",
      tag: "02",
    },
    {
      t: "Iterate by re-brief.",
      b: "Don't drag a hero block around. Tweak the brief, regenerate, diff the change. Iteration is a workflow, not a Saturday.",
      tag: "03",
    },
  ];
  return (
    <section id="features" className="border-b-2 border-ink">
      <div className="mx-auto max-w-content px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
              [ HOW IT WORKS ]
            </p>
            <h2 className="mt-4 font-display uppercase text-ink display-large">
              Three calls<br />
              we make.<br />
              <span className="text-accent">One</span> stays yours.
            </h2>
            <p className="mt-6 text-[16px] leading-[1.6] text-ink/85">
              The decision you keep is &lsquo;is this the right business to
              pitch?&rsquo; Everything else &mdash; copy, palette, typography,
              deploy &mdash; is on us.
            </p>
          </div>
          <ol className="grid gap-px border-2 border-ink bg-ink lg:col-span-7 lg:grid-cols-1">
            {items.map((it) => (
              <li key={it.tag} className="bg-paper p-7 sm:p-9">
                <div className="flex items-start gap-6 sm:gap-8">
                  <div className="font-display text-[44px] uppercase leading-none tracking-tighter2 text-accent sm:text-[56px]">
                    {it.tag}
                  </div>
                  <div className="flex-1 border-l-2 border-ink pl-6 sm:pl-8">
                    <h3 className="font-display text-[22px] uppercase leading-[1.05] tracking-tighter2 text-ink sm:text-[26px]">
                      {it.t}
                    </h3>
                    <p className="mt-3 text-[15px] leading-[1.6] text-ink/85">{it.b}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* FromTheCode — terminal band, dark substrate                         */
/* ------------------------------------------------------------------ */

function FromTheCode() {
  return (
    <section className="relative border-b-2 border-ink bg-ink text-paper">
      <div className="mx-auto max-w-content px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
              [ FROM THE CODEBASE ]
            </p>
            <h2 className="mt-4 font-display uppercase display-large">
              Four passes.<br />
              One brief.<br />
              One <span className="text-accent">live URL</span>.
            </h2>
            <p className="mt-6 max-w-prose text-[16px] leading-[1.6] text-paper/85">
              The orchestrator runs the same four passes for every brief.
              Brand → Copy → Render → Deploy. The output is a per-tenant
              repo and a per-tenant container. Nothing multi-tenant, nothing
              clever, no surprises in production.
            </p>
            <a
              href="https://github.com/prin7r-projects/landing-pages-on-demand/blob/main/docs/02-architecture.md"
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center gap-3 border-2 border-paper px-5 py-3 font-display text-[12px] uppercase tracking-wider2 text-paper hover:bg-paper hover:text-ink"
            >
              Read the architecture doc
              <span aria-hidden className="font-mono text-[11px]">↗</span>
            </a>
          </div>

          <div className="lg:col-span-7">
            <div className="border-2 border-paper">
              {/* terminal title bar */}
              <div className="flex items-center justify-between border-b-2 border-paper bg-paper px-4 py-2 text-ink">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.22em]">
                  /BIN/RENDER · BRIEF=ACME.JSON
                </span>
                <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-accent">
                  T+27M12S
                </span>
              </div>
              <pre className="overflow-x-auto bg-ink p-6 font-mono text-[12.5px] leading-[1.7] text-paper sm:p-7">
{`$ render brief acme.json

[01/04] BRAND     fraunces + inter,  ink + paper + accent
[02/04] COPY      hero + triad + cta + footer
[03/04] RENDER    apps/landing → standalone
[04/04] DEPLOY    gh repo create + ssh up

→ LIVE AT  https://acme.com   in 27m12s
  LIGHTHOUSE  perf 99   a11y 100   best 100   seo 100
  CERT        Let's Encrypt R13
  REPO        github.com/acme/acme-landing`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Pricing — 4 monolithic tiers in a rigid hairline grid               */
/* ------------------------------------------------------------------ */

function Pricing() {
  const tiers = [
    {
      name: "Free",
      plan: "free" as const,
      price: "$0",
      sub: "First page on us",
      tag: "[ TRY IT ]",
      lines: [
        "1 page on render.so",
        "7-day analytics",
        "“Built with Render” footer",
      ],
      cta: "Send a brief",
      href: "#send",
      featured: false,
    },
    {
      name: "Self-serve",
      plan: "self-serve" as const,
      price: "$29",
      sub: "/ MONTH",
      tag: "[ MOST OPERATORS ]",
      lines: [
        "Unlimited briefs",
        "Custom domain (we handle ACME)",
        "1 brand kit",
        "90-day analytics",
        "Edit-via-PR",
      ],
      cta: "Pay $29 in crypto",
      href: "#send",
      featured: true,
    },
    {
      name: "Team",
      plan: "team" as const,
      price: "$99",
      sub: "/ MONTH",
      tag: "[ AGENCIES + FRACTIONAL ]",
      lines: [
        "5 seats",
        "10 brand kits",
        "Page versioning + diff",
        "Slack delivery digest",
      ],
      cta: "Pay $99 in crypto",
      href: "#send",
      featured: false,
    },
    {
      name: "Concierge",
      plan: "concierge" as const,
      price: "$1,200",
      sub: "+ $99 / MO",
      tag: "[ DONE FOR YOU ]",
      lines: [
        "20-min Zoom brief intake",
        "One human polish pass",
        "48h iteration cycle",
        "Loom walkthrough",
      ],
      cta: "Talk to a human",
      href: "#talk",
      featured: false,
    },
  ];
  return (
    <section id="pricing" className="border-b-2 border-ink">
      <div className="mx-auto max-w-content px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid items-end gap-6 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
              [ PRICING ]
            </p>
            <h2 className="mt-4 font-display uppercase text-ink display-large">
              Floor &amp; ceiling.<br />
              No middle tier of <span className="text-accent">vapour</span>.
            </h2>
          </div>
          <div className="md:col-span-5">
            <p className="text-[15px] leading-[1.6] text-ink/85">
              Pricing is on the page. There is no &lsquo;contact sales&rsquo;
              tier. The concierge fee covers a real human on a real call.
            </p>
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-ink/65">
              <span className="text-accent">{">>"}</span> Paid plans check out
              in USDT/USDC via NOWPayments hosted invoice. No card on file.
            </p>
          </div>
        </div>

        <div className="mt-12 grid gap-px border-2 border-ink bg-ink sm:grid-cols-2 lg:grid-cols-4">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={
                "relative flex flex-col bg-paper p-7 " +
                (t.featured ? "ring-4 ring-inset ring-accent" : "")
              }
            >
              {t.featured ? (
                <span className="absolute right-3 top-3 z-10 bg-accent px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-paper">
                  Recommended
                </span>
              ) : null}

              <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-mute">
                {t.tag}
              </div>

              <div className="mt-3 font-display text-[28px] uppercase leading-[0.95] tracking-tighter2 text-ink">
                {t.name}
              </div>

              <div className="mt-5 flex items-baseline gap-2 border-t-2 border-ink pt-5">
                <span className="font-display text-[44px] uppercase leading-none tracking-tighter2 text-ink">
                  {t.price}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-mute">
                  {t.sub}
                </span>
              </div>

              <ul className="mt-6 flex-1 space-y-3 text-[14px] leading-[1.55] text-ink/85">
                {t.lines.map((line) => (
                  <li key={line} className="relative pl-5">
                    <span
                      aria-hidden
                      className="absolute left-0 top-[8px] inline-block h-[2px] w-3 bg-accent"
                    />
                    {line}
                  </li>
                ))}
              </ul>

              <div className="mt-7">
                <PricingCta
                  plan={t.plan}
                  fallbackHref={t.href}
                  featured={t.featured}
                  label={t.cta}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Concierge                                                           */
/* ------------------------------------------------------------------ */

function Concierge() {
  return (
    <section id="talk" className="border-b-2 border-ink bg-bone">
      <div className="mx-auto max-w-content px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
              [ CONCIERGE ]
            </p>
            <h2 className="mt-4 font-display uppercase text-ink display-large">
              You explain.<br />
              We type.<br />
              Live before <br className="hidden md:inline" />
              the call ends.
            </h2>
          </div>
          <div className="lg:col-span-7">
            <ol className="grid gap-px border-2 border-ink bg-ink sm:grid-cols-3">
              <Step
                n="01"
                t="Book the call"
                b="20-minute Zoom. We send a Loom warm-up the day before so you arrive with talking points."
              />
              <Step
                n="02"
                t="We fill the brief on screen"
                b="You watch the form fill in real time. Push back; we edit. The brief is finalised in the call."
              />
              <Step
                n="03"
                t="The page goes live"
                b="The status panel renders inside the Zoom share. Most pages are live before the 20 minutes are up."
              />
            </ol>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="https://cal.com/prin7r/render-concierge"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 bg-ink px-6 py-3 font-display text-[14px] uppercase tracking-wider2 text-paper hover:bg-accent"
              >
                Book a concierge slot
                <span aria-hidden className="font-mono text-[12px]">↗</span>
              </a>
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink/70">
                $1,200 SETUP · $99 / MO RETAINER
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Step({ n, t, b }: { n: string; t: string; b: string }) {
  return (
    <li className="bg-paper p-7">
      <div className="font-display text-[36px] uppercase leading-none tracking-tighter2 text-accent">
        {n}
      </div>
      <h3 className="mt-4 border-t-2 border-ink pt-3 font-display text-[18px] uppercase leading-[1.1] tracking-tighter2 text-ink">
        {t}
      </h3>
      <p className="mt-3 text-[14px] leading-[1.6] text-ink/85">{b}</p>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Send — brief intake                                                 */
/* ------------------------------------------------------------------ */

function Send() {
  return (
    <section id="send" className="border-b-2 border-ink">
      <div className="mx-auto grid max-w-content gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
            [ SEND A BRIEF ]
          </p>
          <h2 className="mt-4 font-display uppercase text-ink display-large">
            One brief.<br />
            One live URL.<br />
            <span className="text-accent">Today.</span>
          </h2>
          <p className="mt-6 max-w-prose text-[16px] leading-[1.6] text-ink/85">
            We&rsquo;ll have a preview URL in your inbox within the hour during
            early access. You won&rsquo;t need to put a card on file until you map
            a custom domain.
          </p>
          <ul className="mt-8 space-y-3 border-t-2 border-ink pt-6 font-mono text-[12px] uppercase leading-[1.6] tracking-[0.14em] text-ink">
            <li className="relative pl-5">
              <span aria-hidden className="absolute left-0 top-[10px] inline-block h-[2px] w-3 bg-accent" />
              Real Next.js repo on your GitHub
            </li>
            <li className="relative pl-5">
              <span aria-hidden className="absolute left-0 top-[10px] inline-block h-[2px] w-3 bg-accent" />
              Real Lighthouse score · real Let&rsquo;s Encrypt cert
            </li>
            <li className="relative pl-5">
              <span aria-hidden className="absolute left-0 top-[10px] inline-block h-[2px] w-3 bg-accent" />
              No upsell sequence. Ever.
            </li>
          </ul>
        </div>

        <div className="lg:col-span-7">
          <BriefForm />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */

function Footer() {
  return (
    <footer className="overflow-hidden bg-ink text-paper">
      <div className="mx-auto max-w-content px-5 py-16 sm:px-8 sm:py-20">
        {/* Massive viewport-bleeding wordmark — anchored & clipped to its
            container so the trailing dot kisses the right rule cleanly. */}
        <div
          className="whitespace-nowrap font-display uppercase leading-[0.85] tracking-tighter2 text-paper"
          style={{ fontSize: "clamp(4rem, 17vw, 16rem)" }}
        >
          RENDER<span className="text-accent">.</span>
        </div>

        <div className="mt-10 grid gap-8 border-t-2 border-paper pt-8 md:grid-cols-12">
          <div className="md:col-span-6">
            <p className="max-w-[34rem] text-[14px] leading-[1.6] text-paper/85">
              A productized landing studio from the prin7r-projects portfolio.
              Single-page work only &mdash; for multi-page corporate sites we
              refer to a partner agency.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.22em] text-paper md:col-span-6 md:justify-end">
            <a href="#proof" className="hover:text-accent">Portfolio</a>
            <a href="#features" className="hover:text-accent">How</a>
            <a href="#pricing" className="hover:text-accent">Pricing</a>
            <a href="#talk" className="hover:text-accent">Concierge</a>
            <a
              href="https://github.com/prin7r-projects/landing-pages-on-demand"
              className="hover:text-accent"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </nav>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-paper/30 pt-6">
          <p className="max-w-[40rem] font-mono text-[10.5px] uppercase tracking-[0.22em] text-paper/65">
            This site, plus 19 others in the prin7r-projects portfolio, was
            generated by the very pipeline this product packages.
          </p>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-paper/65">
            © {new Date().getFullYear()} prin7r-projects · MIT · UNIT 01 / D-08
          </p>
        </div>
      </div>
    </footer>
  );
}
