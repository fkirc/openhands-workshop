export function ArrowUpRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

/** A stemmed spritzer glass with a splash of bubbles. */
export function SpritzweinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M7 3h10l-2.2 8.1a3 3 0 0 1-5.6 0L7 3Z" />
      <path d="M12 13.6V20" />
      <path d="M8.5 20.5h7" />
      <path d="M8.1 7.6h7.8" opacity={0.85} />
      <circle cx="10.4" cy="9.7" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="13.3" cy="11" r="0.5" fill="currentColor" stroke="none" />
      <circle cx="11.7" cy="8.5" r="0.4" fill="currentColor" stroke="none" />
    </svg>
  );
}
