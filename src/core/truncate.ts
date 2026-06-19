import { visibleWidth } from "@mariozechner/pi-tui";

/** Truncate a string to fit maxLen visible chars, appending "…" if needed. */
export function truncate(s: string, maxLen: number): string {
  if (maxLen === 0) return "";
  if (visibleWidth(s) <= maxLen) return s;
  let result = s;
  while (visibleWidth(result + "…") > maxLen && result.length > 0) {
    result = result.slice(0, -1);
  }
  return result + "…";
}
