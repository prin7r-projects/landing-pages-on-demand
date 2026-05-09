import theme from '../theme.generated.json';

const { palette, fontPair, logoSvg, copy } = theme as ThemeData;

/* ── Types ── */
interface ThemeData {
  palette: { primary: string; secondary: string; accent?: string };
  fontPair: string;
  logoSvg: string;
  copy: {
    hero: { headline: string; subhead: string };
    features: { title: string; description: string }[];
    socialProof: { quote: string; author: string; role?: string };
    cta: { text: string; url: string };
    footer: { copyright: string };
  };
}

/* ── Inline theme CSS variables ── */
const themeVars = {
  '--color-primary': palette.primary,
  '--color-primary-foreground': '#ffffff',
  '--color-secondary': palette.secondary,
  '--color-secondary-foreground': '#ffffff',
  '--color-accent': palette.accent || palette.primary,
  '--color-background': '#ffffff',
  '--color-foreground': '#0f172a',
  '--color-muted': '#f8fafc',
  '--color-muted-foreground': '#64748b',
  '--color-card': '#ffffff',
  '--color-card-foreground': '#0f172a',
  '--color-border': '#e2e8f0',
} as React.CSSProperties;

/* ── Page ── */
export default function LandingPage() {
  return (
    <main style={themeVars}>
      <Hero />
      <Features />
      <SocialProof />
      <CTA />
      <Footer />
    </main>
  );
}

/* ── Hero ── */
function Hero() {
  return (
    <section className="relative px-5 sm:px-8 py-20 sm:py-28 max-w-5xl mx-auto text-center">
      {/* Logo */}
      {logoSvg && (
        <div
          className="inline-block mb-8"
          dangerouslySetInnerHTML={{ __html: logoSvg }}
          aria-label="Logo"
        />
      )}

      {/* Font-pair badge */}
      {fontPair && (
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-6">
          [{fontPair}]
        </p>
      )}

      <h1 className="font-display text-[clamp(2.5rem,8vw,5rem)] leading-[0.95] tracking-tight text-foreground mb-6">
        {copy.hero.headline}
      </h1>

      <p className="max-w-2xl mx-auto text-lg sm:text-xl text-foreground/80 leading-relaxed mb-10">
        {copy.hero.subhead}
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <a
          href={copy.cta.url}
          className="inline-flex items-center justify-center h-12 px-8 rounded-sm font-semibold text-sm uppercase tracking-wider text-primary-foreground bg-primary hover:opacity-90 transition-opacity"
          style={{ background: palette.primary }}
        >
          {copy.cta.text}
        </a>
        <a
          href="#features"
          className="inline-flex items-center justify-center h-12 px-8 rounded-sm font-semibold text-sm uppercase tracking-wider border border-border text-foreground hover:bg-muted transition-colors"
        >
          Learn More
        </a>
      </div>
    </section>
  );
}

/* ── Features ── */
function Features() {
  return (
    <section id="features" className="px-5 sm:px-8 py-20 sm:py-28 bg-muted">
      <div className="max-w-5xl mx-auto">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent mb-4 text-center">
          [What We Offer]
        </p>
        <div className="grid gap-8 md:grid-cols-3">
          {copy.features.map((f, i) => (
            <div
              key={i}
              className="bg-card text-card-foreground rounded-sm border border-border p-8"
            >
              <div
                className="w-10 h-10 rounded-sm mb-4 flex items-center justify-center text-white text-sm font-bold"
                style={{ background: palette.primary }}
              >
                {i + 1}
              </div>
              <h3 className="font-display text-lg uppercase tracking-tight mb-3">
                {f.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-[15px]">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Social Proof ── */
function SocialProof() {
  return (
    <section className="px-5 sm:px-8 py-20 sm:py-28">
      <div className="max-w-3xl mx-auto text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent mb-6">
          [Testimonial]
        </p>
        <blockquote className="text-2xl sm:text-3xl font-display leading-snug text-foreground mb-6">
          &ldquo;{copy.socialProof.quote}&rdquo;
        </blockquote>
        <p className="text-foreground font-semibold">{copy.socialProof.author}</p>
        {copy.socialProof.role && (
          <p className="text-muted-foreground text-sm mt-1">{copy.socialProof.role}</p>
        )}
      </div>
    </section>
  );
}

/* ── CTA ── */
function CTA() {
  return (
    <section
      className="px-5 sm:px-8 py-20 sm:py-28 text-center"
      style={{ background: palette.secondary }}
    >
      <div className="max-w-2xl mx-auto">
        <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] uppercase leading-[0.95] tracking-tight text-secondary-foreground mb-6">
          Ready to start?
        </h2>
        <p className="text-secondary-foreground/80 text-lg mb-10">
          Join hundreds of customers who already trust us.
        </p>
        <a
          href={copy.cta.url}
          className="inline-flex items-center justify-center h-12 px-10 rounded-sm font-semibold text-sm uppercase tracking-wider bg-white text-foreground hover:opacity-90 transition-opacity"
        >
          {copy.cta.text}
        </a>
      </div>
    </section>
  );
}

/* ── Footer ── */
function Footer() {
  return (
    <footer className="px-5 sm:px-8 py-12 border-t border-border bg-muted">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Logo */}
        {logoSvg && (
          <div
            className="inline-block [&>svg]:h-6 [&>svg]:w-auto opacity-60"
            dangerouslySetInnerHTML={{ __html: logoSvg }}
            aria-label="Logo"
          />
        )}
        <p className="text-muted-foreground text-sm">{copy.footer.copyright}</p>
      </div>
    </footer>
  );
}
