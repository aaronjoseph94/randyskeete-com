import logoMark from "../assets/logo-mark.png";

type Props = {
  /** Current preaching location text from /api/preaching. */
  location: string;
  loading?: boolean;
};

/**
 * Sticky menu bar: portrait logo lockup on the left, live preaching status on the right.
 * The wordmark is real text so it stays crisp and readable at every size.
 */
export function Header({ location, loading = false }: Props) {
  const place = loading ? "Loading…" : location || "TBA";

  return (
    <header className="site-header">
      <div className="menu-bar">
        <a className="brand" href="#top" aria-label="RandySkeete.com home">
          <img className="brand-mark" src={logoMark} alt="" width="128" height="128" />
          <span className="brand-word" aria-hidden="true">
            RandySkeete<span className="brand-tld">.com</span>
          </span>
        </a>

        <p className="status-chip" aria-live="polite">
          <span className="live-dot" aria-hidden="true" />
          <span className="status-label">Preaching at</span>
          <span className="status-place">{place}</span>
        </p>
      </div>
    </header>
  );
}
