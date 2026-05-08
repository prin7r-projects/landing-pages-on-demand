"use client";

import { portfolio } from "@/data/portfolio";

// Swiss Industrial portfolio rack — 20 slugs in a rigid hairline grid with
// extreme scale variance. Hero cells are oversized blocks of monolithic type;
// supporting cells stay terse and tabular. No rounded corners, no shadows.
//
// Span pattern (12-col on lg) chosen so the rack is dense but rhythmic:
//   row 1: 6 + 3 + 3
//   row 2: 4 + 4 + 4
//   row 3: 6 + 6
//   row 4: 3 + 3 + 6
//   row 5: 4 + 4 + 4
//   row 6: 3 + 3 + 3 + 3
//   row 7: 6 + 6  (residual 2)
const SPANS: Array<{ col: number; row: number }> = [
  { col: 6, row: 2 }, { col: 3, row: 1 }, { col: 3, row: 1 },
  { col: 4, row: 1 }, { col: 4, row: 1 }, { col: 4, row: 1 },
  { col: 6, row: 1 }, { col: 6, row: 2 },
  { col: 3, row: 1 }, { col: 3, row: 1 }, { col: 6, row: 1 },
  { col: 4, row: 1 }, { col: 4, row: 1 }, { col: 4, row: 1 },
  { col: 3, row: 1 }, { col: 3, row: 1 }, { col: 3, row: 1 }, { col: 3, row: 1 },
  { col: 6, row: 1 }, { col: 6, row: 1 },
];

const colMap: Record<number, string> = {
  3: "lg:col-span-3",
  4: "lg:col-span-4",
  6: "lg:col-span-6",
  12: "lg:col-span-12",
};
const rowMap: Record<number, string> = {
  1: "lg:row-span-1",
  2: "lg:row-span-2",
};

export function PortfolioGrid() {
  return (
    <div className="grid grid-cols-2 gap-px border-2 border-ink bg-ink lg:auto-rows-[10rem] lg:grid-cols-12">
      {portfolio.map((p, i) => {
        const span = SPANS[i] ?? { col: 3, row: 1 };
        const isHero = span.col >= 6 && span.row >= 2;
        const isLarge = span.col >= 6 || span.row >= 2;

        return (
          <a
            key={p.slug}
            href={`https://${p.slug}.prin7r.com`}
            target="_blank"
            rel="noreferrer"
            className={`group relative block bg-paper p-4 transition-colors hover:bg-ink hover:text-paper sm:p-5 ${
              colMap[span.col] ?? "lg:col-span-3"
            } ${rowMap[span.row] ?? "lg:row-span-1"} ${
              isHero ? "min-h-[14rem]" : isLarge ? "min-h-[10rem]" : "min-h-[7.5rem]"
            }`}
          >
            <div className="flex h-full flex-col justify-between">
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-mute group-hover:text-paper/70">
                  {String(p.idx).padStart(2, "0")} / 20
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                  {p.minutes}m
                </span>
              </div>

              <div>
                <div
                  className={`font-display uppercase leading-[0.9] tracking-tighter2 ${
                    isHero
                      ? "text-[34px] sm:text-[44px] lg:text-[56px]"
                      : isLarge
                      ? "text-[24px] sm:text-[28px] lg:text-[34px]"
                      : "text-[16px] sm:text-[18px] lg:text-[20px]"
                  }`}
                >
                  {p.title}
                </div>
                <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-mute group-hover:text-paper/70">
                  {p.slug}.prin7r.com
                </div>
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
}
