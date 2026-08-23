/** Constant-time string compare so password length is not leaked via early return. */
import { timingSafeEqual } from "node:crypto";

export function passwordMatches(provided: string, expected: string) {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  const size = Math.max(a.length, b.length, 1);
  const left = Buffer.alloc(size);
  const right = Buffer.alloc(size);
  a.copy(left);
  b.copy(right);
  return a.length === b.length && timingSafeEqual(left, right);
}
