/**
 * WireframeMock — an inline SVG sketch of a page-being-rendered.
 * Pure SVG, no images. Animated via the parent's render-bar.
 */
export function WireframeMock() {
  return (
    <div className="relative w-full overflow-hidden rounded border border-bone bg-paper">
      <svg viewBox="0 0 800 540" className="block h-auto w-full">
        {/* browser chrome */}
        <rect x="0" y="0" width="800" height="36" fill="#EDE7DD" />
        <circle cx="18" cy="18" r="4" fill="#0E1116" opacity="0.18" />
        <circle cx="32" cy="18" r="4" fill="#0E1116" opacity="0.18" />
        <circle cx="46" cy="18" r="4" fill="#0E1116" opacity="0.18" />
        <rect x="74" y="10" width="640" height="16" rx="2" fill="#FAF7F2" />
        <text
          x="86"
          y="22"
          fontFamily="JetBrains Mono, monospace"
          fontSize="11"
          fill="#8A8579"
        >
          https://acme.com
        </text>

        {/* page body */}
        <g transform="translate(40, 70)">
          {/* nav */}
          <rect x="0" y="0" width="80" height="14" fill="#0E1116" />
          <rect x="540" y="0" width="36" height="14" fill="#0E1116" opacity="0.6" />
          <rect x="586" y="0" width="36" height="14" fill="#0E1116" opacity="0.6" />
          <rect x="632" y="0" width="36" height="14" fill="#0E1116" opacity="0.6" />
          <rect x="678" y="0" width="42" height="14" fill="#E8554E" />

          {/* hero */}
          <rect x="0" y="60" width="540" height="22" fill="#0E1116" />
          <rect x="0" y="92" width="460" height="22" fill="#0E1116" />
          <rect x="0" y="124" width="380" height="22" fill="#0E1116" />
          <rect x="0" y="170" width="320" height="10" fill="#0E1116" opacity="0.5" />
          <rect x="0" y="186" width="280" height="10" fill="#0E1116" opacity="0.5" />
          <rect x="0" y="202" width="240" height="10" fill="#0E1116" opacity="0.5" />

          <rect x="0" y="240" width="120" height="32" fill="#E8554E" />
          <rect x="132" y="240" width="120" height="32" fill="none" stroke="#0E1116" strokeWidth="1" />

          {/* feature triad */}
          <rect x="0" y="320" width="220" height="120" fill="none" stroke="#0E1116" opacity="0.18" />
          <rect x="20" y="340" width="80" height="8" fill="#E8554E" />
          <rect x="20" y="356" width="180" height="6" fill="#0E1116" opacity="0.4" />
          <rect x="20" y="368" width="140" height="6" fill="#0E1116" opacity="0.4" />
          <rect x="20" y="380" width="160" height="6" fill="#0E1116" opacity="0.4" />

          <rect x="240" y="320" width="220" height="120" fill="none" stroke="#0E1116" opacity="0.18" />
          <rect x="260" y="340" width="80" height="8" fill="#E8554E" />
          <rect x="260" y="356" width="180" height="6" fill="#0E1116" opacity="0.4" />
          <rect x="260" y="368" width="140" height="6" fill="#0E1116" opacity="0.4" />
          <rect x="260" y="380" width="160" height="6" fill="#0E1116" opacity="0.4" />

          <rect x="480" y="320" width="220" height="120" fill="none" stroke="#0E1116" opacity="0.18" />
          <rect x="500" y="340" width="80" height="8" fill="#E8554E" />
          <rect x="500" y="356" width="180" height="6" fill="#0E1116" opacity="0.4" />
          <rect x="500" y="368" width="140" height="6" fill="#0E1116" opacity="0.4" />
          <rect x="500" y="380" width="160" height="6" fill="#0E1116" opacity="0.4" />
        </g>
      </svg>

      {/* render bar */}
      <div className="render-bar" aria-hidden />
    </div>
  );
}
