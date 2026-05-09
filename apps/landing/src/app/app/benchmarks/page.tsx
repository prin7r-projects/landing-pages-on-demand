import Link from "next/link";
import { benchmarks, PROVIDERS } from "@/data/benchmarks";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Benchmarks",
  description: "Landing-page builder scores across providers — build time, performance, accessibility, best practices, SEO.",
};

const PROVIDER_COLORS: Record<string, string> = {
  DropHouse: "text-accent",
  Webflow: "text-ink",
  Framer: "text-ink",
  Wix: "text-ink",
  Squarespace: "text-ink",
  Carrd: "text-ink",
};

export default function BenchmarksPage() {
  return (
    <main className="min-h-screen bg-paper">
      <div className="mx-auto max-w-content px-5 sm:px-8 py-20">
        <div className="mb-16">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
            [ Benchmarks ]
          </p>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl uppercase tracking-tighter2 mt-4">
            Scoreboard
          </h1>
          <p className="mt-4 font-sans text-[16px] leading-[1.55] text-ink/85 max-w-prose">
            Head-to-head scores across six landing-page builders. Each row is a real DropHouse deploy benchmarked against the rest.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-ink">
                <th className="text-left font-mono text-[11px] uppercase tracking-[0.22em] text-mute py-3 pr-4">
                  Benchmark
                </th>
                {PROVIDERS.map((p) => (
                  <th
                    key={p}
                    className={`text-right font-mono text-[11px] uppercase tracking-[0.22em] py-3 px-3 ${
                      p === "DropHouse" ? "text-accent" : "text-mute"
                    }`}
                  >
                    {p}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {benchmarks.map((b, i) => {
                const topProvider = PROVIDERS.reduce((best, p) => {
                  const avg =
                    (b.scores[p].lighthousePerf +
                      b.scores[p].lighthouseA11y +
                      b.scores[p].lighthouseBest +
                      b.scores[p].lighthouseSEO) /
                    4;
                  const bestAvg =
                    (b.scores[best].lighthousePerf +
                      b.scores[best].lighthouseA11y +
                      b.scores[best].lighthouseBest +
                      b.scores[best].lighthouseSEO) /
                    4;
                  return avg > bestAvg ? p : best;
                }, PROVIDERS[0]);

                return (
                  <tr
                    key={b.slug}
                    className={`border-b border-ink/10 hover:bg-bone/50 transition-colors ${
                      i % 2 === 0 ? "" : ""
                    }`}
                  >
                    <td className="py-4 pr-4">
                      <Link
                        href={`/app/benchmarks/${b.slug}`}
                        className="group block"
                      >
                        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-mute">
                          #{String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="block font-display uppercase text-[20px] leading-[1.05] tracking-tighter2 group-hover:text-accent transition-colors">
                          {b.title}
                        </span>
                      </Link>
                    </td>
                    {PROVIDERS.map((p) => {
                      const avg = Math.round(
                        (b.scores[p].lighthousePerf +
                          b.scores[p].lighthouseA11y +
                          b.scores[p].lighthouseBest +
                          b.scores[p].lighthouseSEO) /
                          4
                      );
                      return (
                        <td
                          key={p}
                          className={`text-right font-mono text-[14px] py-4 px-3 ${
                            p === topProvider ? "text-accent" : "text-ink/85"
                          }`}
                        >
                          <span className="font-semibold">{avg}</span>
                          <span className="text-[10px] text-mute ml-0.5">/100</span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
