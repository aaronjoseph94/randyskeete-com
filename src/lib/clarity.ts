/** Microsoft Clarity project ID (dashboard: clarity.microsoft.com). */
const CLARITY_PROJECT_ID = "y8riqs78i5";

type ClarityFn = ((...args: unknown[]) => void) & { q?: unknown[][] };

/** Load Clarity asynchronously after the app mounts (CSP-friendly: no inline script). */
export function initClarity() {
  if (!CLARITY_PROJECT_ID || typeof document === "undefined") return;

  const w = window as Window & { clarity?: ClarityFn };
  if (w.clarity) return;

  w.clarity = function (...args: unknown[]) {
    (w.clarity!.q = w.clarity!.q ?? []).push(args);
  };
  w.clarity.q = [];

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${CLARITY_PROJECT_ID}`;
  document.head.appendChild(script);
}
