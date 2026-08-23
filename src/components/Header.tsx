import portrait from "../assets/randy-skeete.jpg";

type Props = {
  /** Current preaching location text from /api/preaching. */
  location: string;
  loading?: boolean;
};

/**
 * Sticky top bar: brand on the left, live preaching location on the right (one line).
 * No primary nav — location is the header’s job.
 */
export function Header({ location, loading = false }: Props) {
  const place = loading ? "Loading…" : location || "TBA";

  return (
    <header className="site-header">
      <a className="brand" href="#top">
        <img className="brand-photo" src={portrait} alt="" width="40" height="40" />
        <span className="brand-text">
          <span className="brand-name">
            RandySkeete<span className="brand-tld">.com</span>
          </span>
        </span>
      </a>

      <p className="preaching-line" aria-live="polite">
        <span className="live-dot" aria-hidden="true" />
        <span className="sr-only">Live. </span>
        <span className="preaching-label">Elder Skeete is preaching at</span>{" "}
        <strong className="preaching-place">{place}</strong>
      </p>
    </header>
  );
}
