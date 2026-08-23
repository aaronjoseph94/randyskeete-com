import portrait from "../assets/randy-skeete.jpg";

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
        <a href="#this-week">This Week</a>
        <a href="#sermons">Sermons</a>
        <a href="https://egwwritings.org/" target="_blank" rel="noopener noreferrer">
          EGW Writings
        </a>
      </nav>
    </header>
  );
}
