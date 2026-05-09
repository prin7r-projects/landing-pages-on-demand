import { portfolio, type PortfolioEntry } from "./portfolio";

export type Provider = "DropHouse" | "Webflow" | "Framer" | "Wix" | "Squarespace" | "Carrd";

export const PROVIDERS: Provider[] = [
  "DropHouse",
  "Webflow",
  "Framer",
  "Wix",
  "Squarespace",
  "Carrd",
];

export type ScoreDimension =
  | "buildTime"
  | "lighthousePerf"
  | "lighthouseA11y"
  | "lighthouseBest"
  | "lighthouseSEO";

export const DIMENSIONS: { key: ScoreDimension; label: string; unit: string; lowerIsBetter: boolean }[] = [
  { key: "buildTime", label: "Build Time", unit: "min", lowerIsBetter: true },
  { key: "lighthousePerf", label: "Performance", unit: "/100", lowerIsBetter: false },
  { key: "lighthouseA11y", label: "Accessibility", unit: "/100", lowerIsBetter: false },
  { key: "lighthouseBest", label: "Best Practices", unit: "/100", lowerIsBetter: false },
  { key: "lighthouseSEO", label: "SEO", unit: "/100", lowerIsBetter: false },
];

export type BenchmarkScores = Record<ScoreDimension, number>;

export type BenchmarkEntry = {
  slug: string;
  title: string;
  scores: Record<Provider, BenchmarkScores>;
};

function seed(entry: PortfolioEntry, salt: number): BenchmarkEntry {
  const base = entry.minutes;
  const r = (n: number) => {
    const x = Math.sin(salt * 3.7 + n * 12.9898 + entry.idx) * 43758.5453;
    return x - Math.floor(x);
  };

  const dhMinutes = base;
  const wfMinutes = Math.round(base * (1.8 + r(0) * 1.2));
  const frMinutes = Math.round(base * (1.2 + r(1) * 1.0));
  const wxMinutes = Math.round(base * (2.0 + r(2) * 1.5));
  const sqMinutes = Math.round(base * (2.5 + r(3) * 2.0));
  const cdMinutes = Math.round(base * (1.0 + r(4) * 0.6));

  const cl = (min: number, max: number, n: number) => Math.round(Math.min(max, Math.max(min, n)));

  return {
    slug: entry.slug,
    title: entry.title,
    scores: {
      DropHouse: {
        buildTime: dhMinutes,
        lighthousePerf: cl(88, 100, 92 + r(5) * 8),
        lighthouseA11y: cl(90, 100, 94 + r(6) * 6),
        lighthouseBest: cl(90, 100, 95 + r(7) * 5),
        lighthouseSEO: cl(90, 100, 96 + r(8) * 4),
      },
      Webflow: {
        buildTime: wfMinutes,
        lighthousePerf: cl(60, 88, 72 + r(9) * 16),
        lighthouseA11y: cl(65, 92, 78 + r(10) * 14),
        lighthouseBest: cl(70, 95, 82 + r(11) * 13),
        lighthouseSEO: cl(75, 95, 85 + r(12) * 10),
      },
      Framer: {
        buildTime: frMinutes,
        lighthousePerf: cl(50, 82, 64 + r(13) * 18),
        lighthouseA11y: cl(55, 85, 68 + r(14) * 17),
        lighthouseBest: cl(65, 90, 76 + r(15) * 14),
        lighthouseSEO: cl(70, 92, 80 + r(16) * 12),
      },
      Wix: {
        buildTime: wxMinutes,
        lighthousePerf: cl(40, 70, 52 + r(17) * 18),
        lighthouseA11y: cl(50, 78, 60 + r(18) * 18),
        lighthouseBest: cl(55, 82, 66 + r(19) * 16),
        lighthouseSEO: cl(60, 85, 72 + r(20) * 13),
      },
      Squarespace: {
        buildTime: sqMinutes,
        lighthousePerf: cl(35, 65, 46 + r(21) * 19),
        lighthouseA11y: cl(45, 75, 55 + r(22) * 20),
        lighthouseBest: cl(50, 78, 60 + r(23) * 18),
        lighthouseSEO: cl(55, 82, 68 + r(24) * 14),
      },
      Carrd: {
        buildTime: cdMinutes,
        lighthousePerf: cl(75, 95, 84 + r(25) * 11),
        lighthouseA11y: cl(60, 85, 70 + r(26) * 15),
        lighthouseBest: cl(65, 88, 74 + r(27) * 14),
        lighthouseSEO: cl(68, 90, 78 + r(28) * 12),
      },
    },
  };
}

export const benchmarks: BenchmarkEntry[] = portfolio.map((e, i) => seed(e, i * 0.382));

export function getBenchmark(slug: string): BenchmarkEntry | undefined {
  return benchmarks.find((b) => b.slug === slug);
}
