export function Logo({
  className = "",
  ariaLabel = "Render",
}: {
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <span
      className={`inline-flex items-baseline font-display font-semibold tracking-tightish ${className}`}
      aria-label={ariaLabel}
    >
      <span>Render</span>
      <span
        aria-hidden
        className="ml-[2px] inline-block h-[6px] w-[6px] translate-y-[-2px] rounded-full bg-accent"
      />
    </span>
  );
}
