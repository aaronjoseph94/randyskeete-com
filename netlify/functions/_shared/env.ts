import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

let loaded = false;

function loadLocalEnv() {
  if (loaded) return;
  loaded = true;

  const envPath = path.join(process.cwd(), ".env");
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

export function env(name: string): string | undefined {
  try {
    const value = Netlify.env.get(name);
    if (value) return value;
  } catch {
    // Local Vite / Node fallback
  }

  if (process.env[name]) return process.env[name];

  loadLocalEnv();
  return process.env[name];
}
