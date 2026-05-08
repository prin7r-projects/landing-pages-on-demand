// Swiss Industrial wordmark — heavy display sans, square accent block
// (no rounded radii anywhere in this brand).
export function Logo({
  className = "",
  ariaLabel = "DropHouse",
}: {
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <span
      className={`inline-flex items-baseline font-display uppercase tracking-tighter2 ${className}`}
      aria-label={ariaLabel}
    >
      <span>DropHouse</span>
      <span
        aria-hidden
        className="ml-[3px] inline-block h-[7px] w-[7px] translate-y-[-2px] bg-accent"
      />
    </span>
  );
}
