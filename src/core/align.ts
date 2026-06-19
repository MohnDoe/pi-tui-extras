import { visibleWidth } from "@mariozechner/pi-tui";

export type Align = "left" | "right" | "center";

/**
 * Position content within a fixed width, filling remaining space with `fill`.
 * @param content - The text to position
 * @param width - Total width to fill
 * @param align - Which side to align to
 * @param fill - Fill character (default: space)
 */
export function alignInWidth(
  content: string,
  width: number,
  align: Align,
  fill: string = " ",
): string {
  const cw = visibleWidth(content);
  const fillNeeded = Math.max(0, width - cw);

  if (align === "left") {
    return content + fill.repeat(fillNeeded);
  }
  if (align === "right") {
    return fill.repeat(fillNeeded) + content;
  }
  // center
  const half = Math.floor(fillNeeded / 2);
  const rem = fillNeeded - half;
  return fill.repeat(half) + content + fill.repeat(rem);
}

/**
 * Position two content strings at opposite ends within a fixed width.
 * @param left - Content to position on the left
 * @param right - Content to position on the right
 * @param width - Total width to fill
 * @param fill - Fill character (default: space)
 */
export function alignInWidthLR(
  left: string,
  right: string,
  width: number,
  fill: string = " ",
): string {
  const lw = visibleWidth(left);
  const rw = visibleWidth(right);
  const midFill = Math.max(0, width - lw - rw);
  return left + fill.repeat(midFill) + right;
}
