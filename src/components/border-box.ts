import type { Component } from "@mariozechner/pi-tui";
import { visibleWidth } from "@mariozechner/pi-tui";
import { truncate } from "../core/truncate";

export type BorderStyle = "single" | "singleRounded" | "double" | "heavy";
export type TitleAlign = "left" | "right" | "center";

export interface TitleDef {
  text: string;
  align: TitleAlign;
}

export interface Padding {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
}

export interface BorderBoxOptions {
  borderStyle?: BorderStyle;
  borderColor?: (text: string) => string;
  titles?: TitleDef[];
  footers?: TitleDef[];
  padding?: Padding;
}

const BORDER_CHARS: Record<
  BorderStyle,
  { tl: string; tr: string; bl: string; br: string; h: string; v: string }
> = {
  single: { tl: "┌", tr: "┐", bl: "└", br: "┘", h: "─", v: "│" },
  singleRounded: { tl: "╭", tr: "╮", bl: "╰", br: "╯", h: "─", v: "│" },
  double: { tl: "╔", tr: "╗", bl: "╚", br: "╝", h: "═", v: "║" },
  heavy: { tl: "┏", tr: "┓", bl: "┗", br: "┛", h: "━", v: "┃" },
};

function padLine(line: string, targetWidth: number): string {
  const padNeeded = Math.max(0, targetWidth - visibleWidth(line));
  return line + " ".repeat(padNeeded);
}

function validateTitles(titles: TitleDef[]): void {
  if (titles.length > 2) throw new Error("BorderBox: max 2 titles");
  if (titles.length === 2) {
    if (titles[0]!.align !== "left" || titles[1]!.align !== "right") {
      throw new Error("BorderBox: two titles must be left + right");
    }
  }
  if (titles.length === 1) {
    const a = titles[0]!.align;
    if (a !== "left" && a !== "right" && a !== "center") {
      throw new Error(`BorderBox: invalid title align "${a}"`);
    }
  }
}

interface BorderLineOptions {
  leftCorner: string;
  rightCorner: string;
  innerWidth: number;
  totalWidth: number;
  hChar: string;
  color?: (s: string) => string;
  defs?: TitleDef[];
}

function buildBorderLine(opts: BorderLineOptions): string {
  const { leftCorner, rightCorner, innerWidth, totalWidth, hChar, color, defs } = opts;
  const h = color ? color(hChar) : hChar;
  const l = color ? color(leftCorner) : leftCorner;
  const r = color ? color(rightCorner) : rightCorner;

  if (!defs || defs.length === 0) {
    return padLine(`${l}${h.repeat(innerWidth)}${r}`, totalWidth);
  }

  if (defs.length === 1) {
    const d = defs[0]!;
    // First pass: try with original text
    const decor = `${h} ${d.text} ${h}`;
    const decorW = visibleWidth(decor);
    let fill = Math.max(0, innerWidth - decorW);

    // If decor overflows, truncate title and retry
    let finalDecor: string;
    if (fill === 0) {
      const maxText = Math.max(1, innerWidth - 4);
      const truncated = truncate(d.text, maxText);
      // If still overflows, drop spaces around title
      if (innerWidth < 4) {
        finalDecor = `${h}${truncate(d.text, Math.max(1, innerWidth - 2))}${h}`;
      } else {
        finalDecor = `${h} ${truncated} ${h}`;
      }
    } else {
      finalDecor = decor;
    }
    const finalDecorW = visibleWidth(finalDecor);
    const finalFill = Math.max(0, innerWidth - finalDecorW);

    if (d.align === "left") {
      return padLine(`${l}${finalDecor}${h.repeat(finalFill)}${r}`, totalWidth);
    }
    if (d.align === "right") {
      return padLine(`${l}${h.repeat(finalFill)}${finalDecor}${r}`, totalWidth);
    }
    if (d.align === "center") {
      const halfFill = Math.floor(finalFill / 2);
      const rem = finalFill - halfFill;
      return padLine(`${l}${h.repeat(halfFill)}${finalDecor}${h.repeat(rem)}${r}`, totalWidth);
    }
  }

  // length === 2: left + right
  const leftDef = defs[0]!;
  const rightDef = defs[1]!;
  const leftText = truncate(leftDef.text, Math.max(1, innerWidth - 6));
  const rightText = truncate(
    rightDef.text,
    Math.max(1, innerWidth - visibleWidth(`─ ${leftText} ─`) - 4),
  );
  const leftDecor = `${h} ${leftText} ${h}`;
  const rightDecor = `${h} ${rightText} ${h}`;
  const midFill = Math.max(0, innerWidth - visibleWidth(leftDecor) - visibleWidth(rightDecor));
  return padLine(`${l}${leftDecor}${h.repeat(midFill)}${rightDecor}${r}`, totalWidth);
}

export class BorderBox implements Component {
  private cache: { lines: string[]; width: number } | null = null;
  private readonly child: Component;
  private readonly borderStyle: BorderStyle;
  private readonly borderColor?: (text: string) => string;
  private readonly titles?: TitleDef[];
  private readonly footers?: TitleDef[];
  private readonly padding: Padding;

  constructor(child: Component, options: BorderBoxOptions = {}) {
    if (options.titles) validateTitles(options.titles);
    if (options.footers) validateTitles(options.footers);

    this.child = child;
    this.borderStyle = options.borderStyle ?? "single";
    this.borderColor = options.borderColor;
    this.titles = options.titles;
    this.footers = options.footers;

    const rawPad = options.padding ?? {};
    this.padding = {
      left: Math.max(0, rawPad.left ?? 0),
      right: Math.max(0, rawPad.right ?? 0),
      top: Math.max(0, rawPad.top ?? 0),
      bottom: Math.max(0, rawPad.bottom ?? 0),
    };
  }

  render(width: number): string[] {
    if (this.cache && this.cache.width === width) return this.cache.lines;

    const bc = this.borderChars;
    const innerWidth = Math.max(1, width - 2);
    const padL = this.padding.left ?? 0;
    const padR = this.padding.right ?? 0;
    const padT = this.padding.top ?? 0;
    const padB = this.padding.bottom ?? 0;
    const childInnerWidth = Math.max(1, innerWidth - padL - padR);
    const childLines = this.child.render(childInnerWidth);
    const color = this.borderColor;

    const lines: string[] = [];

    // Top border
    lines.push(
      buildBorderLine({
        leftCorner: bc.tl,
        rightCorner: bc.tr,
        innerWidth,
        totalWidth: width,
        hChar: bc.h,
        color,
        defs: this.titles,
      }),
    );

    // PaddingY top
    for (let i = 0; i < padT; i++) {
      lines.push(
        padLine(
          color
            ? color(bc.v) + " ".repeat(innerWidth) + color(bc.v)
            : bc.v + " ".repeat(innerWidth) + bc.v,
          width,
        ),
      );
    }

    // Content
    if (childLines.length === 0) {
      lines.push(
        padLine(
          color
            ? color(bc.v) + " ".repeat(innerWidth) + color(bc.v)
            : bc.v + " ".repeat(innerWidth) + bc.v,
          width,
        ),
      );
    } else {
      for (const line of childLines) {
        const childPad = Math.max(
          0,
          innerWidth - padL - padR - childInnerWidth + (childInnerWidth - visibleWidth(line)),
        );
        const padded = " ".repeat(padL) + line + " ".repeat(childPad + padR);
        lines.push(
          padLine(color ? color(bc.v) + padded + color(bc.v) : bc.v + padded + bc.v, width),
        );
      }
    }

    // PaddingY bottom
    for (let i = 0; i < padB; i++) {
      lines.push(
        padLine(
          color
            ? color(bc.v) + " ".repeat(innerWidth) + color(bc.v)
            : bc.v + " ".repeat(innerWidth) + bc.v,
          width,
        ),
      );
    }

    // Bottom border
    lines.push(
      buildBorderLine({
        leftCorner: bc.bl,
        rightCorner: bc.br,
        innerWidth,
        totalWidth: width,
        hChar: bc.h,
        color,
        defs: this.footers,
      }),
    );

    this.cache = { lines, width };
    return lines;
  }

  handleInput(data: string): void {
    this.child.handleInput?.(data);
    this.invalidate();
  }

  invalidate(): void {
    this.cache = null;
    this.child.invalidate();
  }

  private get borderChars() {
    return BORDER_CHARS[this.borderStyle];
  }
}
