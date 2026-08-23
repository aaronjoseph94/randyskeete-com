import { useEffect, useState, type FormEvent } from "react";

type Record = {
  text: string;
  updatedAt: string | null;
};

const UNLOCKED_KEY = "preaching-unlocked";
const PASSWORD_KEY = "preaching-password";

export function PreachingWidget() {
  const [record, setRecord] = useState<Record | null>(null);
  const [error, setError] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const storedPassword = sessionStorage.getItem(PASSWORD_KEY) ?? "";
    if (sessionStorage.getItem(UNLOCKED_KEY) === "1" && storedPassword) {
      setUnlocked(true);
      setPassword(storedPassword);
    }

    fetch("/api/preaching")
      .then(async (response) => {
        const data = (await response.json()) as Record & { error?: string };
        if (!response.ok) throw new Error(data.error || "Unable to load this week’s location.");
        setRecord(data);
        setDraft(data.text);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Unable to load this week’s location.");
      });
  }, []);

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const response = await fetch("/api/preaching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Incorrect password.");
      setUnlocked(true);
      setShowLogin(false);
      sessionStorage.setItem(UNLOCKED_KEY, "1");
      sessionStorage.setItem(PASSWORD_KEY, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Incorrect password.");
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
      const response = await fetch("/api/preaching", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, text: draft }),
      });
      const data = (await response.json()) as Record & { error?: string };
      if (!response.ok) throw new Error(data.error || "Unable to save.");
      setRecord(data);
      setDraft(data.text);
      setSaved(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <aside id="this-week" className="widget">
      <div className="widget-top">
        <div>
          <p className="eyebrow">This week</p>
          <h2>Where is Elder Randy Skeete preaching this week?</h2>
        </div>
        {!unlocked ? (
          <button
            type="button"
            className="login-btn"
            onClick={() => setShowLogin((open) => !open)}
          >
            Login
          </button>
        ) : (
          <span className="editing-badge">Editing</span>
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
          <button type="submit" disabled={saving}>
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
