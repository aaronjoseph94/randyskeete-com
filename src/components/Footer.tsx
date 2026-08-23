import { useState, type FormEvent } from "react";
import { updateLocation } from "../api/preaching";
import { messageFromUnknown } from "../lib/format";
import type { PreachingRecord } from "../lib/types";

type Props = {
  /** Prefills the editor with the current public location. */
  location: string;
  /** Called after a successful save so the header can refresh. */
  onUpdated: (record: PreachingRecord) => void;
};

/**
 * Site footer: disclaimer, EGW link, contact, and a tiny password-gated location editor.
 * The password is submitted once per save and never stored in sessionStorage/localStorage.
 */
export function Footer({ location, onUpdated }: Props) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [draft, setDraft] = useState(location);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  function toggleEditor() {
    setOpen((value) => {
      const next = !value;
      if (next) {
        setDraft(location);
        setPassword("");
        setError("");
        setSaved(false);
      }
      return next;
    });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      const record = await updateLocation(password, draft);
      onUpdated(record);
      setDraft(record.text);
      setPassword("");
      setSaved(true);
    } catch (err: unknown) {
      setError(messageFromUnknown(err, "Unable to update location."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-col">
          <h3>Contact</h3>
          <a className="footer-link" href="mailto:truth.garment504@passinbox.com">
            truth.garment504@passinbox.com
          </a>
        </div>
        <div className="footer-col">
          <h3>Resources</h3>
          <a
            className="footer-link"
            href="https://egwwritings.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ellen G. White Writings
          </a>
        </div>
        <div className="footer-col">
          <h3>About</h3>
          <p className="disclaimer">
            This website is not owned or maintained by Elder Randy Skeete. It is
            created by people who follow him and listen to his messages. It is
            not endorsed by Elder Skeete.
          </p>
        </div>
      </div>

      <div className="footer-meta">
        <p className="footer-note">
          Videos are embedded from YouTube and credited to the channels that posted them.
        </p>
        <button type="button" className="footer-update" onClick={toggleEditor}>
          {open ? "Close" : "Update location"}
        </button>
      </div>

      {open ? (
        <form className="location-editor" onSubmit={handleSubmit}>
          <label>
            <span className="sr-only">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              required
            />
          </label>
          <label>
            <span className="sr-only">Location</span>
            <input
              type="text"
              value={draft}
              maxLength={2000}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Church, city, or meeting place"
              required
            />
          </label>
          <button type="submit" disabled={saving || !password || !draft.trim()}>
            {saving ? "Saving…" : "Save"}
          </button>
          {saved ? <p className="saved">Saved.</p> : null}
          {error ? <p className="status error">{error}</p> : null}
        </form>
      ) : null}
    </footer>
  );
}
