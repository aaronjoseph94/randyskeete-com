/** Display helpers. Dates are formatted in UTC to match YouTube timestamps. */
export function formatDate(iso: string) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function messageFromUnknown(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
