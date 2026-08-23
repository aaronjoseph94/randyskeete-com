import logo from "../assets/logo.png";

type Props = {
  /** Current preaching location text from /api/preaching. */
  location: string;
  loading?: boolean;
};

/**
 * Sticky header: new photo logo + a thin live-status bar (the site “menu”).
 */
export function Header({ location, loading = false }: Props) {
  const place = loading ? "Loading…" : location || "TBA";

  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="RandySkeete.com home">
        <img className="brand-logo" src={logo} alt="RandySkeete.com" width="160" height="160" />
      </a>

      <nav className="status-nav" aria-label="Preaching status">
        <p className="preaching-line" aria-live="polite">
          <span className="live-dot" aria-hidden="true" />
          <span className="sr-only">Live. </span>
          <span className="preaching-copy">
            Elder Skeete is preaching at <strong>{place}</strong>
          </span>
        </p>
      </nav>
    </header>
  );
}
