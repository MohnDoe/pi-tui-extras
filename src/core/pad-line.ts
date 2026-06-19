import { visibleWidth } from "@mariozechner/pi-tui";

/** Pad a string with spaces to reach targetWidth. If already >= targetWidth, return as-is. */
export function padLine(line: string, targetWidth: number): string {
  const padNeeded = Math.max(0, targetWidth - visibleWidth(line));
  return line + " ".repeat(padNeeded);
}
