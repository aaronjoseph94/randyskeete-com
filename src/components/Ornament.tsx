/**
 * Subtle decorative divider: a small cross flanked by hairlines.
 * Purely ornamental, hidden from assistive technology.
 */
export function Ornament() {
  return (
    <div className="ornament" aria-hidden="true">
      <span className="ornament-line" />
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M12 3v18M5.5 9h13" />
      </svg>
      <span className="ornament-line" />
    </div>
  );
}
