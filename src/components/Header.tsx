import portrait from "../assets/randy-skeete.jpg";

const NAV = [
  { href: "#this-week", label: "This Week" },
  { href: "#watch", label: "Watch" },
  { href: "#sermons", label: "Sermons" },
  {
    href: "https://egwwritings.org/",
    label: "EGW Writings",
    external: true,
  },
] as const;

/** Site logo (circular portrait + wordmark) and primary navigation. */
export function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="#top">
        <img className="brand-photo" src={portrait} alt="" width="44" height="44" />
        <span className="brand-text">
          <span className="brand-name">
            RandySkeete<span className="brand-tld">.com</span>
          </span>
          <span className="brand-tag">Sermon Library</span>
        </span>
      </a>
      <nav className="nav" aria-label="Primary">
        {NAV.map((item) =>
          "external" in item && item.external ? (
            <a
              key={item.href}
              className="nav-link"
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.label}
            </a>
          ) : (
            <a key={item.href} className="nav-link" href={item.href}>
              {item.label}
            </a>
          ),
        )}
      </nav>
    </header>
  );
}
