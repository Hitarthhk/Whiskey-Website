/** Conceptual brand mark — placeholder until the official logo files are supplied. */
export function MountainMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 40" fill="none" className={className} aria-hidden="true">
      <path d="M2 38 L22 10 L30 20 L40 4 L62 38" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M36 10 L40 4 L44 10 L41 9 L40 11 L38.5 9 Z" fill="currentColor" />
      <path d="M12 38 L22 24 L28 31" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
    </svg>
  );
}
