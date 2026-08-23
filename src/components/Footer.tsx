export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-col">
          <h3>Contact us</h3>
          <p>Questions about this site or this week’s location?</p>
          <a className="footer-link" href="mailto:truth.garment504@passinbox.com">
            truth.garment504@passinbox.com
          </a>
        </div>
        <div className="footer-col">
          <h3>About this site</h3>
          <p className="disclaimer">
            This website is not owned or maintained by Elder Randy Skeete. It is
            created by people who follow him and listen to his messages. It is
            not endorsed by Elder Skeete.
          </p>
        </div>
      </div>
      <p className="footer-note">
        All videos are embedded from YouTube and credited to the channels that
        posted them.
      </p>
    </footer>
  );
}
