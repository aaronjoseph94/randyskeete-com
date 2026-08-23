/**
 * Signed editor session stored in an HttpOnly cookie — the password never
 * stays in the browser after login.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { COOKIE_NAME, SESSION_MS } from "./constants";

export function createSession(secret: string) {
  const exp = Date.now() + SESSION_MS;
  const hmac = sign(secret, exp);
  return `${exp}.${hmac}`;
}

export function verifySession(token: string | null, secret: string) {
  if (!token) return false;
  const dot = token.indexOf(".");
  if (dot < 1) return false;
  const exp = Number(token.slice(0, dot));
  const hmac = token.slice(dot + 1);
  if (!Number.isFinite(exp) || Date.now() > exp || !hmac) return false;
  const expected = sign(secret, exp);
  const a = Buffer.from(hmac);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function readCookie(req: Request, name = COOKIE_NAME) {
  const header = req.headers.get("cookie") ?? "";
  for (const part of header.split(";")) {
    const trimmed = part.trim();
    if (trimmed.startsWith(`${name}=`)) return decodeURIComponent(trimmed.slice(name.length + 1));
  }
  return null;
}

export function sessionSetCookie(value: string, req: Request) {
  return serializeCookie(value, req, SESSION_MS / 1000);
}

export function sessionClearCookie(req: Request) {
  return serializeCookie("", req, 0);
}

function sign(secret: string, exp: number) {
  return createHmac("sha256", secret).update(`editor.${exp}`).digest("base64url");
}

function serializeCookie(value: string, req: Request, maxAge: number) {
  const secure = new URL(req.url).protocol === "https:";
  const pieces = [
    `${COOKIE_NAME}=${encodeURIComponent(value)}`,
    "HttpOnly",
    "SameSite=Lax",
    "Path=/",
    `Max-Age=${Math.max(0, Math.floor(maxAge))}`,
  ];
  if (secure) pieces.push("Secure");
  return pieces.join("; ");
}
