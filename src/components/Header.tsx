/** Site wordmark and in-page navigation. No personal names or YouTube handles. */
export function Header() {
  return (
    <header className="site-header">
      <a className="wordmark" href="#top">
        RandySkeete.com
      </a>
      <nav className="nav" aria-label="Primary">
        <a href="#this-week">This Week</a>
        <a href="#sermons">Sermons</a>
      </nav>
    </header>
  );
}
