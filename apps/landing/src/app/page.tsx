import { Logo } from "@/components/Logo";
import { WireframeMock } from "@/components/WireframeMock";
import { PortfolioGrid } from "@/components/PortfolioGrid";
import { BriefForm } from "@/components/BriefForm";
import { PricingCta } from "@/components/PricingCta";

export default function Home() {
  return (
    <main className="min-h-screen bg-paper text-ink">
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

function TopNav() {
  return (
    <header className="border-b border-ink/10">
      <div className="mx-auto flex max-w-content items-center justify-between px-5 py-5 sm:px-8">
        <Logo className="text-[20px]" />
        <nav className="hidden items-center gap-7 md:flex">
          <a href="#proof" className="text-[13px] text-ink/80 hover:text-ink">
            Proof
          </a>
          <a href="#features" className="text-[13px] text-ink/80 hover:text-ink">
            How it works
          </a>
          <a href="#pricing" className="text-[13px] text-ink/80 hover:text-ink">
            Pricing
          </a>
          <a
            href="#send"
            className="bg-ink px-3 py-2 text-[13px] font-medium text-paper hover:opacity-90"
          >
            Send a brief
          </a>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-ink/10">
      <div className="mx-auto grid max-w-content gap-16 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-12 lg:gap-12 lg:py-32">
        <div className="lg:col-span-7">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
            Render &middot; productized landing studio
          </p>
          <h1 className="mt-6 font-display text-[44px] font-semibold leading-[1.02] tracking-tightish text-ink sm:text-[56px] lg:text-[72px]">
            A landing page on your domain in{" "}
            <span className="relative inline-block">
              <span>30 minutes.</span>
              <span
                aria-hidden
                className="absolute bottom-2 left-0 right-0 h-[8px] bg-accent/25"
              />
            </span>
          </h1>
          <p className="mt-6 max-w-prose text-[18px] leading-[1.55] text-ink/85 sm:text-[19px]">
            Send the brief. We write the copy, pick the palette, and push the
            page live to your domain &mdash; with a real Next.js repo, real
            analytics, and a real Let&rsquo;s Encrypt certificate.
          </p>
          <p className="mt-4 max-w-prose font-mono text-[13px] leading-[1.55] text-mute">
            <span className="text-accent">→</span> The site you are reading was
            rendered in 27 minutes, alongside 19 sibling landings, by the very
            pipeline this product packages.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#send"
              className="inline-flex items-center gap-2 bg-ink px-5 py-3 font-medium text-paper hover:opacity-90"
            >
              Send a brief
              <span aria-hidden className="font-mono text-[12px] text-accent">
                →
              </span>
            </a>
            <a
              href="#talk"
              className="inline-flex items-center font-medium text-ink underline-offset-4 hover:underline"
            >
              Talk to a human
            </a>
          </div>

          <dl className="mt-12 grid grid-cols-3 gap-4 border-t border-ink/10 pt-8">
            <Stat k="27 min" v="median brief → live" />
            <Stat k="20 / 20" v="sibling landings shipped" />
            <Stat k="real" v="repo · domain · cert" />
          </dl>
        </div>

        <aside className="lg:col-span-5">
          <div className="sticky top-12">
            <WireframeMock />
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-mute">
              Live preview &middot; render scan in progress
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="font-display text-[24px] font-semibold leading-none text-ink">
        {k}
      </dt>
      <dd className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-mute">
        {v}
      </dd>
    </div>
  );
}

function Marquee() {
  const items = [
    "27 min p95",
    "Real Next.js repo",
    "Custom domain",
    "Lighthouse ≥ 95",
    "Lets Encrypt cert",
    "Edit via PR",
    "Re-brief, don't redesign",
    "20 sibling landings live",
  ];
  return (
    <div className="border-b border-ink/10 bg-bone/60 py-3">
      <div className="mx-auto flex max-w-content flex-wrap items-center justify-center gap-x-6 gap-y-2 px-5 font-mono text-[11px] uppercase tracking-[0.14em] text-mute sm:px-8">
        {items.map((it, i) => (
          <span key={it} className="flex items-center gap-3">
            {i > 0 ? <span className="text-accent">·</span> : null}
            <span>{it}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Proof() {
  return (
    <section id="proof" className="border-b border-ink/10">
      <div className="mx-auto max-w-content px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
              The proof
            </p>
            <h2 className="mt-4 font-display text-[36px] font-semibold leading-[1.05] tracking-tightish text-ink sm:text-[44px]">
              20 distinct landings.<br />
              One afternoon.<br />
              One pipeline.
            </h2>
            <p className="mt-5 max-w-prose text-[16px] leading-[1.6] text-ink/80">
              Below is the full prin7r-projects Wave 2 portfolio. Each thumbnail
              links to a different brand, palette, and voice &mdash; all generated
              by the same Render pipeline that built the page you are reading.
              Click any. Inspect the source. Compare to other AI page generators
              without leaving the tab.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="https://github.com/prin7r-projects"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 border border-ink px-4 py-2 text-[13px] font-medium text-ink hover:bg-ink hover:text-paper"
              >
                See the GitHub org
                <span aria-hidden className="font-mono text-[11px]">↗</span>
              </a>
              <a
                href="#features"
                className="text-[13px] font-medium text-ink underline-offset-4 hover:underline"
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
    <section id="features" className="border-b border-ink/10">
      <div className="mx-auto max-w-content px-5 py-20 sm:px-8 sm:py-28">
        <div className="max-w-prose">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
            How it works
          </p>
          <h2 className="mt-4 font-display text-[36px] font-semibold leading-[1.05] tracking-tightish text-ink sm:text-[44px]">
            Three decisions Render makes for you,<br />
            and one you keep.
          </h2>
          <p className="mt-5 text-[16px] leading-[1.6] text-ink/80">
            The decision you keep is &lsquo;is this the right business to
            pitch?&rsquo; Everything else &mdash; copy, palette, typography,
            deploy &mdash; is on us.
          </p>
        </div>

        <ol className="mt-14 grid gap-px border-t border-ink/10 bg-ink/10 sm:grid-cols-3">
          {items.map((it) => (
            <li key={it.tag} className="bg-paper p-8 sm:p-10">
              <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-mute">
                {it.tag}
              </div>
              <h3 className="mt-3 font-display text-[24px] font-semibold leading-[1.15] text-ink">
                {it.t}
              </h3>
              <p className="mt-3 text-[15px] leading-[1.6] text-ink/80">{it.b}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function FromTheCode() {
  return (
    <section className="border-b border-ink/10 bg-ink text-paper">
      <div className="mx-auto max-w-content px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
              From the codebase
            </p>
            <h2 className="mt-4 font-display text-[36px] font-semibold leading-[1.05] tracking-tightish sm:text-[44px]">
              Four passes. One brief.<br />
              One live URL.
            </h2>
            <p className="mt-5 max-w-prose text-[16px] leading-[1.6] text-paper/80">
              The orchestrator runs the same four passes for every brief.
              Brand → Copy → Render → Deploy. The output is a per-tenant
              repo and a per-tenant container. Nothing multi-tenant, nothing
              clever, no surprises in production.
            </p>
            <a
              href="https://github.com/prin7r-projects/landing-pages-on-demand/blob/main/docs/02-architecture.md"
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-flex items-center gap-2 border border-paper/40 px-4 py-2 text-[13px] font-medium hover:bg-paper hover:text-ink"
            >
              Read the architecture doc
              <span aria-hidden className="font-mono text-[11px]">↗</span>
            </a>
          </div>

          <div className="lg:col-span-7">
            <pre className="overflow-x-auto rounded border border-paper/15 bg-ink p-6 font-mono text-[12.5px] leading-[1.7] text-paper/95 sm:p-7">
{`# brief in
$ render brief acme.json

[01/04] brand    fraunces + inter,  ink + paper + accent
[02/04] copy     hero + triad + cta + footer
[03/04] render   apps/landing → standalone
[04/04] deploy   gh repo create + ssh up

→ live at https://acme.com  in 27m12s
   lighthouse  perf 99  a11y 100  best 100  seo 100
   real cert   issued by Lets Encrypt
   real repo   github.com/acme/acme-landing`}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const tiers = [
    {
      name: "Free",
      plan: "free" as const,
      price: "$0",
      tag: "Try it",
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
      price: "$29 / mo",
      tag: "Most operators",
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
      price: "$99 / mo",
      tag: "Agencies & fractional CMOs",
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
      price: "$1,200 + $99 / mo",
      tag: "Done for you",
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
    <section id="pricing" className="border-b border-ink/10">
      <div className="mx-auto max-w-content px-5 py-20 sm:px-8 sm:py-28">
        <div className="max-w-prose">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
            Pricing
          </p>
          <h2 className="mt-4 font-display text-[36px] font-semibold leading-[1.05] tracking-tightish text-ink sm:text-[44px]">
            Self-serve floor.<br />
            Concierge ceiling.
          </h2>
          <p className="mt-5 text-[16px] leading-[1.6] text-ink/80">
            Pricing is on the page. There is no &lsquo;contact sales&rsquo;
            tier. The concierge fee covers a real human on a real call.
          </p>
          <p className="mt-4 max-w-prose font-mono text-[12px] leading-[1.55] text-mute">
            <span className="text-accent">→</span> Paid plans check out in
            USDT/USDC via NOWPayments hosted invoice. No card on file. No
            credit-bureau hit.
          </p>
        </div>

        <div className="mt-12 grid gap-px border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:grid-cols-4">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={
                "flex flex-col bg-paper p-7 " +
                (t.featured ? "ring-1 ring-inset ring-accent" : "")
              }
            >
              <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-mute">
                {t.tag}
              </div>
              <div className="mt-2 font-display text-[24px] font-semibold leading-tight text-ink">
                {t.name}
              </div>
              <div className="mt-1 font-mono text-[14px] text-ink">
                {t.price}
              </div>
              <ul className="mt-5 space-y-2 text-[14px] leading-[1.55] text-ink/80">
                {t.lines.map((line) => (
                  <li key={line} className="relative pl-5">
                    <span
                      aria-hidden
                      className="absolute left-0 top-[10px] inline-block h-px w-3 bg-accent"
                    />
                    {line}
                  </li>
                ))}
              </ul>
              <PricingCta
                plan={t.plan}
                fallbackHref={t.href}
                featured={t.featured}
                label={t.cta}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Concierge() {
  return (
    <section id="talk" className="border-b border-ink/10 bg-bone/40">
      <div className="mx-auto max-w-content px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
              Concierge
            </p>
            <h2 className="mt-4 font-display text-[36px] font-semibold leading-[1.05] tracking-tightish text-ink sm:text-[44px]">
              You explain.<br />
              We type.<br />
              The page is live before the call ends.
            </h2>
          </div>
          <div className="lg:col-span-7">
            <ol className="grid gap-px border border-ink/10 bg-ink/10 sm:grid-cols-3">
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
                className="inline-flex items-center gap-2 bg-ink px-5 py-3 font-medium text-paper hover:opacity-90"
              >
                Book a concierge slot
                <span aria-hidden className="font-mono text-[12px] text-accent">
                  ↗
                </span>
              </a>
              <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-mute">
                $1,200 setup &middot; $99 / mo retainer
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
      <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-mute">
        {n}
      </div>
      <h3 className="mt-3 font-display text-[20px] font-semibold leading-[1.2] text-ink">
        {t}
      </h3>
      <p className="mt-3 text-[14.5px] leading-[1.6] text-ink/80">{b}</p>
    </li>
  );
}

function Send() {
  return (
    <section id="send" className="border-b border-ink/10">
      <div className="mx-auto grid max-w-content gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
            Send a brief
          </p>
          <h2 className="mt-4 font-display text-[36px] font-semibold leading-[1.05] tracking-tightish text-ink sm:text-[44px]">
            One brief.<br />
            One live URL.<br />
            Today.
          </h2>
          <p className="mt-5 max-w-prose text-[16px] leading-[1.6] text-ink/80">
            We&rsquo;ll have a preview URL in your inbox within the hour during
            early access. You won&rsquo;t need to put a card on file until you map
            a custom domain.
          </p>
          <ul className="mt-8 space-y-3 text-[14.5px] leading-[1.55] text-ink/80">
            <li className="relative pl-5">
              <span aria-hidden className="absolute left-0 top-[10px] inline-block h-px w-3 bg-accent" />
              Real Next.js repo on your GitHub
            </li>
            <li className="relative pl-5">
              <span aria-hidden className="absolute left-0 top-[10px] inline-block h-px w-3 bg-accent" />
              Real Lighthouse score, real Let&rsquo;s Encrypt cert
            </li>
            <li className="relative pl-5">
              <span aria-hidden className="absolute left-0 top-[10px] inline-block h-px w-3 bg-accent" />
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

function Footer() {
  return (
    <footer className="bg-paper">
      <div className="mx-auto max-w-content px-5 py-12 sm:px-8 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-8 border-b border-ink/10 pb-8">
          <div>
            <Logo className="text-[26px]" />
            <p className="mt-3 max-w-[28rem] text-[14px] leading-[1.55] text-ink/80">
              A productized landing studio from the prin7r-projects portfolio.
              Single-page work only &mdash; for multi-page corporate sites we
              refer to a partner agency.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-7 gap-y-2 text-[13px] text-ink/85">
            <a href="#proof" className="hover:text-ink">Portfolio</a>
            <a href="#features" className="hover:text-ink">How it works</a>
            <a href="#pricing" className="hover:text-ink">Pricing</a>
            <a href="#talk" className="hover:text-ink">Concierge</a>
            <a
              href="https://github.com/prin7r-projects/landing-pages-on-demand"
              className="hover:text-ink"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </nav>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-mute">
            This site, plus 19 others in the prin7r-projects portfolio, was
            generated by the very pipeline this product packages.
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-mute">
            © {new Date().getFullYear()} prin7r-projects · MIT
          </p>
        </div>
      </div>
    </footer>
  );
}
