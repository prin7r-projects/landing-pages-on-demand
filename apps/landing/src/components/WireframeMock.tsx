/**
 * WireframeMock — an inline SVG sketch of a page-being-rendered.
 * Pure SVG, no images. Animated via the parent's render-bar.
 * Swiss Industrial palette: carbon ink #0A0A0A on newsprint #F8F8F6,
 * single aviation-red accent #E61919.
 */
export function WireframeMock() {
  return (
    <div className="relative w-full overflow-hidden border-2 border-ink bg-paper">
      <svg viewBox="0 0 800 540" className="block h-auto w-full">
        {/* browser chrome — flat, no radius */}
        <rect x="0" y="0" width="800" height="36" fill="#0A0A0A" />
        <rect x="14" y="14" width="8" height="8" fill="#F8F8F6" />
        <rect x="28" y="14" width="8" height="8" fill="#F8F8F6" />
        <rect x="42" y="14" width="8" height="8" fill="#F8F8F6" />
        <rect x="74" y="10" width="640" height="16" fill="#F8F8F6" />
        <text
          x="86"
          y="22"
          fontFamily="JetBrains Mono, monospace"
          fontSize="11"
          fill="#0A0A0A"
        >
          HTTPS://ACME.COM
        </text>

        {/* page body */}
        <g transform="translate(40, 70)">
          {/* nav rules */}
          <rect x="0" y="0" width="80" height="14" fill="#0A0A0A" />
          <rect x="540" y="0" width="36" height="14" fill="#0A0A0A" opacity="0.55" />
          <rect x="586" y="0" width="36" height="14" fill="#0A0A0A" opacity="0.55" />
          <rect x="632" y="0" width="36" height="14" fill="#0A0A0A" opacity="0.55" />
          <rect x="678" y="0" width="42" height="14" fill="#E61919" />

          {/* dividing rule */}
          <rect x="0" y="36" width="720" height="2" fill="#0A0A0A" />

          {/* hero — viewport-bleeding heavy bands */}
          <rect x="0" y="60" width="600" height="34" fill="#0A0A0A" />
          <rect x="0" y="100" width="520" height="34" fill="#0A0A0A" />
          <rect x="0" y="140" width="440" height="34" fill="#0A0A0A" />
          <rect x="0" y="200" width="320" height="10" fill="#0A0A0A" opacity="0.55" />
          <rect x="0" y="216" width="280" height="10" fill="#0A0A0A" opacity="0.55" />
          <rect x="0" y="232" width="240" height="10" fill="#0A0A0A" opacity="0.55" />

          <rect x="0" y="270" width="140" height="34" fill="#E61919" />
          <rect x="152" y="270" width="140" height="34" fill="none" stroke="#0A0A0A" strokeWidth="2" />

          {/* dividing rule */}
          <rect x="0" y="320" width="720" height="2" fill="#0A0A0A" />

          {/* feature triad — rigid 3-cell hairline grid */}
          <rect x="0" y="340" width="240" height="120" fill="none" stroke="#0A0A0A" strokeWidth="1" />
          <rect x="20" y="360" width="80" height="6" fill="#E61919" />
          <rect x="20" y="378" width="180" height="6" fill="#0A0A0A" opacity="0.45" />
          <rect x="20" y="392" width="140" height="6" fill="#0A0A0A" opacity="0.45" />
          <rect x="20" y="406" width="160" height="6" fill="#0A0A0A" opacity="0.45" />

          <rect x="240" y="340" width="240" height="120" fill="none" stroke="#0A0A0A" strokeWidth="1" />
          <rect x="260" y="360" width="80" height="6" fill="#E61919" />
          <rect x="260" y="378" width="180" height="6" fill="#0A0A0A" opacity="0.45" />
          <rect x="260" y="392" width="140" height="6" fill="#0A0A0A" opacity="0.45" />
          <rect x="260" y="406" width="160" height="6" fill="#0A0A0A" opacity="0.45" />

          <rect x="480" y="340" width="240" height="120" fill="none" stroke="#0A0A0A" strokeWidth="1" />
          <rect x="500" y="360" width="80" height="6" fill="#E61919" />
          <rect x="500" y="378" width="180" height="6" fill="#0A0A0A" opacity="0.45" />
          <rect x="500" y="392" width="140" height="6" fill="#0A0A0A" opacity="0.45" />
          <rect x="500" y="406" width="160" height="6" fill="#0A0A0A" opacity="0.45" />
        </g>
      </svg>

      {/* render bar */}
      <div className="render-bar" aria-hidden />
    </div>
  );
}
