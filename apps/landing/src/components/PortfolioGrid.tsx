"use client";

import { portfolio } from "@/data/portfolio";

export function PortfolioGrid() {
  return (
    <div className="grid grid-cols-2 gap-px bg-ink/10 sm:grid-cols-4 lg:grid-cols-5">
      {portfolio.map((p) => (
        <a
          key={p.slug}
          href={`https://${p.slug}.prin7r.com`}
          target="_blank"
          rel="noreferrer"
          className="group relative block aspect-[4/3] overflow-hidden bg-paper transition-colors hover:bg-bone"
        >
          <div className="absolute inset-0 flex flex-col justify-between p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-mute">
              {String(p.idx).padStart(2, "0")} / 20
            </div>
            <div>
              <div className="font-display text-[15px] font-semibold leading-[1.15] text-ink">
                {p.title}
              </div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-mute">
                {p.minutes} min · live
              </div>
            </div>
          </div>
          <div
            className="absolute right-0 top-0 h-1 w-1 -translate-x-3 translate-y-3 rounded-full bg-accent opacity-0 transition-opacity group-hover:opacity-100"
            aria-hidden
          />
        </a>
      ))}
    </div>
  );
}
