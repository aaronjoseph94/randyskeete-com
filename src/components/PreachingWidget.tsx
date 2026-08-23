import { useEffect, useState, type FormEvent } from "react";
import {
  confirmEditorSession,
  getPreaching,
  loginEditor,
  logoutEditor,
  savePreaching,
} from "../api/preaching";
import { messageFromUnknown } from "../lib/format";
import type { PreachingRecord } from "../lib/types";

const UNLOCKED_KEY = "preaching-unlocked";

export function PreachingWidget() {
  const [record, setRecord] = useState<PreachingRecord | null>(null);
  const [error, setError] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    getPreaching(controller.signal)
      .then((data) => {
        setRecord(data);
        setDraft(data.text);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(messageFromUnknown(err, "Unable to load this week’s location."));
      });

    if (sessionStorage.getItem(UNLOCKED_KEY) === "1") {
      confirmEditorSession()
        .then((ok) => {
          if (ok) setUnlocked(true);
          else sessionStorage.removeItem(UNLOCKED_KEY);
        })
        .catch(() => sessionStorage.removeItem(UNLOCKED_KEY));
    }

    return () => controller.abort();
  }, []);

  function markUnlocked() {
    setUnlocked(true);
    setShowLogin(false);
    setPassword("");
    sessionStorage.setItem(UNLOCKED_KEY, "1");
  }

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      await loginEditor(password);
      markUnlocked();
    } catch (err: unknown) {
      setError(messageFromUnknown(err, "Incorrect password."));
    } finally {
      setSaving(false);
    }
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      const data = await savePreaching(draft);
      setRecord(data);
      setDraft(data.text);
      setSaved(true);
    } catch (err: unknown) {
      const message = messageFromUnknown(err, "Unable to save.");
      setError(message);
      if (message.includes("log in")) {
        setUnlocked(false);
        setShowLogin(true);
        sessionStorage.removeItem(UNLOCKED_KEY);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDone() {
    await logoutEditor();
    setUnlocked(false);
    setShowLogin(false);
    setSaved(false);
    sessionStorage.removeItem(UNLOCKED_KEY);
  }

  return (
    <aside id="this-week" className="widget">
      <div className="widget-top">
        <h2 className="widget-title">
          <span className="live-dot" aria-hidden="true" />
          <span className="sr-only">Live. </span>
          <span className="widget-title-text">
            Where is Elder Randy Skeete preaching this week?
          </span>
        </h2>
        {!unlocked ? (
          <button
            type="button"
            className="login-btn"
            onClick={() => setShowLogin((open) => !open)}
          >
            Login
          </button>
        ) : (
          <button type="button" className="login-btn secondary" onClick={handleDone}>
            Done
          </button>
        )}
      </div>

      {showLogin && !unlocked ? (
        <form className="login-form" onSubmit={handleLogin}>
          <label>
            <span className="sr-only">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
            />
          </label>
          <button type="submit" disabled={saving || !password}>
            {saving ? "Checking…" : "Unlock"}
          </button>
        </form>
      ) : null}

      {unlocked ? (
        <form className="edit-form" onSubmit={handleSave}>
          <label>
            <span className="sr-only">This week’s location</span>
            <textarea
              rows={4}
              value={draft}
              maxLength={2000}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Church, city, and meeting times"
            />
          </label>
          <button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
          {saved ? <p className="saved">Saved.</p> : null}
        </form>
      ) : (
        <p className="widget-body">{record?.text ?? "Loading…"}</p>
      )}

      {error ? <p className="status error">{error}</p> : null}
    </aside>
  );
}
