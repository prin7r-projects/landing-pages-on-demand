/**
 * The 20 prin7r-projects Wave 2 landings — each a distinct artifact,
 * each built by the same pipeline this product packages.
 *
 * Linked at <slug>.prin7r.com.
 */
export type PortfolioEntry = {
  idx: number;
  slug: string;
  title: string;
  minutes: number;
};

export const portfolio: PortfolioEntry[] = [
  { idx: 1,  slug: "landing-pages-on-demand", title: "Landing pages on demand", minutes: 27 },
  { idx: 2,  slug: "outbound-machines",       title: "Outbound machines",       minutes: 31 },
  { idx: 3,  slug: "founder-pipeline",        title: "Founder pipeline",        minutes: 26 },
  { idx: 4,  slug: "agency-multiplier",       title: "Agency multiplier",       minutes: 28 },
  { idx: 5,  slug: "concierge-launches",      title: "Concierge launches",      minutes: 33 },
  { idx: 6,  slug: "brief-to-domain",         title: "Brief to domain",         minutes: 25 },
  { idx: 7,  slug: "campaign-pages",          title: "Campaign pages",          minutes: 29 },
  { idx: 8,  slug: "course-launchpad",        title: "Course launchpad",        minutes: 24 },
  { idx: 9,  slug: "indie-shipper",           title: "Indie shipper",           minutes: 27 },
  { idx: 10, slug: "clinic-pages",            title: "Clinic pages",            minutes: 30 },
  { idx: 11, slug: "founder-fast-track",      title: "Founder fast-track",      minutes: 26 },
  { idx: 12, slug: "saturday-no-more",        title: "Saturday no more",        minutes: 28 },
  { idx: 13, slug: "drophouse-portfolio",    title: "DropHouse portfolio",    minutes: 32 },
  { idx: 14, slug: "trade-press-pages",       title: "Trade-press pages",       minutes: 29 },
  { idx: 15, slug: "creator-shop",            title: "Creator shop",            minutes: 27 },
  { idx: 16, slug: "consultancy-page",        title: "Consultancy page",        minutes: 25 },
  { idx: 17, slug: "studio-launches",         title: "Studio launches",         minutes: 28 },
  { idx: 18, slug: "fund-deck-pages",         title: "Fund deck pages",         minutes: 30 },
  { idx: 19, slug: "newsletter-stand-up",     title: "Newsletter stand-up",     minutes: 24 },
  { idx: 20, slug: "saas-microsite",          title: "SaaS microsite",          minutes: 26 },
];
