import { Box, type Component, visibleWidth } from "@mariozechner/pi-tui";
import { truncate } from "../core/truncate";
import { padLine } from "../core/pad-line";
import { alignInWidth, alignInWidthLR } from "../core/align";

/** Supported box-drawing border styles. */
export type BorderStyle = "single" | "singleRounded" | "double" | "heavy";
/** Horizontal alignment for titles or footers within a border edge. */
export type TextAlign = "left" | "right" | "center";

/** A title or footer entry positioned along a border edge. */
export interface TextDef {
  /** Display text. Truncated with "…" {@link truncate} when it overflows the available width. */
  text: string;
  /** Horizontal alignment within the border edge. */
  align: TextAlign;
}

/** Optional inner padding around children. */
export interface Padding {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
}

/** Options for configuring a {@link BorderBox} instance. */
export interface BorderBoxOptions {
  /** Border character set (default: "single"). */
  borderStyle?: BorderStyle;
  /**
   * Apply ANSI or custom styling to every border character.
   * Receives the raw character and returns the styled version.
   *
   * @example `chalk.red`
   * @example `(s) => theme.fg("muted", s)`
   */
  borderFn?: (text: string) => string;
  /**
   * Apply ANSI or custom background styling to the inner content area
   * (between the border edges). Receives the full inner line (padded to
   * width) and returns the styled version.
   *
   * @example `chalk.bgBlue`
   */
  bgFn?: (text: string) => string;
  /** Titles drawn on the top border (max 2: left + right). */
  titles?: TextDef[];
  /** Footers drawn on the bottom border (max 2: left + right). */
  footers?: TextDef[];
  /** Padding between border edge and child content. */
  padding?: Padding;
}

/** Box-drawing character set for each border style. */
const BORDER_CHARS: Record<
  BorderStyle,
  { tl: string; tr: string; bl: string; br: string; h: string; v: string }
> = {
  single: { tl: "┌", tr: "┐", bl: "└", br: "┘", h: "─", v: "│" },
  singleRounded: { tl: "╭", tr: "╮", bl: "╰", br: "╯", h: "─", v: "│" },
  double: { tl: "╔", tr: "╗", bl: "╚", br: "╝", h: "═", v: "║" },
  heavy: { tl: "┏", tr: "┓", bl: "┗", br: "┛", h: "━", v: "┃" },
};

/**
 * Minimum visible width for a truncated title/footer (avoids empty border).
 * Smallest title/footer will render ellipsis
 * */
export const TITLE_MIN_WIDTH = 1;

/** Maximum titles or footers allowed per border edge (left + right). */
const MAX_TITLE_COUNT = 2;
/**
 * Decor "─ <title/footer> ─" overhead: h + space + space + h = 4 visible chars.
 * This accounts for the two flanking dashes and the two spaces around the text.
 */
const DECOR_OVERHEAD = 4;
/**
 * Tight decor "─<title/footer>─" overhead: h + h = 2 visible chars (no spaces).
 * Used when the available width is too narrow for spaced decoration.
 */
const DECOR_TIGHT_OVERHEAD = 2;
/**
 * Left-text room heuristic for LR title pair.
 * Accounts for left decor overhead (4) (L + border + border + space), right decor overhead (4), minus 2
 * because the two inner dashes merge into one gap dash, giving 4 + 4 - 2 = 6.
 */
const LR_LEFT_OVERHEAD = 6;

/**
 * Validate title/footer constraints before constructing the component.
 *
 * @param titles - Array of text definitions to validate
 * @throws If more than 2 {@link MAX_TITLE_COUNT} titles, or 2 titles not left+right, or invalid align for 1 title.
 */
function validateTitles(titles: TextDef[]): void {
  if (titles.length > MAX_TITLE_COUNT)
    throw new Error(`BorderBox: max ${MAX_TITLE_COUNT} text definitions per line`);
  if (titles.length === MAX_TITLE_COUNT) {
    if (
      titles[0]!.align === titles[1]!.align ||
      titles[0]!.align === "center" ||
      titles[1]!.align === "center"
    ) {
      throw new Error("BorderBox: two text definitions on the same line must be left + right");
    }
  }
}

/** Internal options for building a single border line (top or bottom). */
interface BorderLineOptions {
  /** Left corner character (e.g. "┌" for top, "└" for bottom). */
  leftCorner: string;
  /** Right corner character (e.g. "┐" for top, "┘" for bottom). */
  rightCorner: string;
  /** Width of the border interior (excludes 2 corner chars). */
  innerWidth: number;
  /** Total width of the full rendered line (inner + corners + potential pad). */
  totalWidth: number;
  /** Horizontal border character (e.g. "─"). */
  hChar: string;
  /** Optional styling function applied to every border character. */
  borderFn?: (s: string) => string;
  /** Title/footer definitions to embed in this border edge. */
  textDefs?: TextDef[];
}

function buildBorderLine(opts: BorderLineOptions): string {
  const { leftCorner, rightCorner, innerWidth, totalWidth, hChar, borderFn, textDefs } = opts;
  const h = borderFn ? borderFn(hChar) : hChar;
  const l = borderFn ? borderFn(leftCorner) : leftCorner;
  const r = borderFn ? borderFn(rightCorner) : rightCorner;

  // No titles — solid horizontal line
  if (!textDefs || textDefs.length === 0) {
    return padLine(`${l}${h.repeat(innerWidth)}${r}`, totalWidth);
  }

  // Single title — space-padded decor "─ text ─", falls back to tight "─…─"
  if (textDefs.length === 1) {
    const d = textDefs[0]!;
    // First pass: try with original text
    const decor = `${h} ${d.text} ${h}`;
    const decorW = visibleWidth(decor);
    let fill = Math.max(0, innerWidth - decorW);

    // If decor overflows, truncate title and retry
    let finalDecor: string;
    if (fill === 0) {
      const maxText = Math.max(TITLE_MIN_WIDTH, innerWidth - DECOR_OVERHEAD);
      const truncated = truncate(d.text, maxText);
      // If still overflows, drop spaces around title → tight decor
      if (innerWidth < DECOR_OVERHEAD) {
        finalDecor = `${h}${truncate(d.text, Math.max(TITLE_MIN_WIDTH, innerWidth - DECOR_TIGHT_OVERHEAD))}${h}`;
      } else {
        finalDecor = `${h} ${truncated} ${h}`;
      }
    } else {
      finalDecor = decor;
    }
    const positioned = alignInWidth(finalDecor, innerWidth, d.align, h);
    return padLine(`${l}${positioned}${r}`, totalWidth);
  }

  // Two titles: left-aligned + right-aligned pair
  const firstDef = textDefs[0]!;
  const secondDef = textDefs[1]!;
  const leftDef = firstDef.align === "left" ? firstDef : secondDef;
  const rightDef = firstDef.align === "right" ? firstDef : secondDef;

  const leftText = truncate(leftDef.text, Math.max(TITLE_MIN_WIDTH, innerWidth - LR_LEFT_OVERHEAD));
  const rightText = truncate(
    rightDef.text,
    Math.max(TITLE_MIN_WIDTH, innerWidth - visibleWidth(`${h} ${leftText} ${h}`) - DECOR_OVERHEAD),
  );
  const leftDecor = `${h} ${leftText} ${h}`;
  const rightDecor = `${h} ${rightText} ${h}`;
  const positioned = alignInWidthLR(leftDecor, rightDecor, innerWidth, h);
  return padLine(`${l}${positioned}${r}`, totalWidth);
}

/**
 * Renders children wrapped in a configurable box-drawing border.
 *
 * Supports four border styles (single, singleRounded, double, heavy),
 * optional borderFn for border styling, optional bgFn for inner content
 * background, up to two titles/footers per edge, and configurable inner
 * padding. Extends {@link Box} so `addChild`, `removeChild`, and `clear`
 * work as expected. Render output is cached per-width for performance and
 * invalidated on input.
 *
 * @example
 * ```ts
 * const box = new BorderBox({ borderStyle: "singleRounded", titles: [{ text: "Info", align: "left" }] });
 * box.addChild(new Text("Hello", 0, 0));
 * const lines = box.render(20);
 * ```
 */
export class BorderBox extends Box {
  /** Cached render output, keyed by width. Cleared on invalidate(). */
  private borderCache: { lines: string[]; width: number } | null = null;
  /** Selected box-drawing character set. */
  private readonly borderStyle: BorderStyle;
  /** Optional styling function for border characters. */
  private readonly borderFn?: (text: string) => string;
  /** Optional background function for the inner content area. */
  private readonly innerBg?: (text: string) => string;
  /** Optional title entries drawn on the top border edge. */
  private readonly titles?: TextDef[];
  /** Optional footer entries drawn on the bottom border edge. */
  private readonly footers?: TextDef[];
  /** Normalised padding (clamped ≥ 0) between border and children. */
  private readonly padding: Padding;

  /**
   * @param options - Border style, border/background styling, titles/footers, and padding.
   * @throws If titles/footers violate constraints (>2, or 2 not left+right).
   */
  constructor(options: BorderBoxOptions = {}) {
    // Box padding is unused — BorderBox applies its own via Padding.
    // Pass bgFn to Box for conceptual correctness (Box stores it privately).
    super(0, 0, options.bgFn);

    if (options.titles) validateTitles(options.titles);
    if (options.footers) validateTitles(options.footers);

    this.borderStyle = options.borderStyle ?? "single";
    this.borderFn = options.borderFn;
    this.innerBg = options.bgFn;
    this.titles = options.titles;
    this.footers = options.footers;

    // Clamp negative padding values to 0
    const rawPad = options.padding ?? {};
    this.padding = {
      left: Math.max(0, rawPad.left ?? 0),
      right: Math.max(0, rawPad.right ?? 0),
      top: Math.max(0, rawPad.top ?? 0),
      bottom: Math.max(0, rawPad.bottom ?? 0),
    };
  }

  override render(width: number): string[] {
    if (this.borderCache && this.borderCache.width === width) return this.borderCache.lines;

    const bc = this.borderChars;
    const innerWidth = Math.max(1, width - 2);
    const padL = this.padding.left ?? 0;
    const padR = this.padding.right ?? 0;
    const padT = this.padding.top ?? 0;
    const padB = this.padding.bottom ?? 0;
    const childInnerWidth = Math.max(1, innerWidth - padL - padR);
    const border = this.borderFn;
    const bg = this.innerBg;

    // Convenience: apply background to an inner-width string
    const applyBg = (s: string): string => (bg ? bg(s) : s);

    // Render all children stacked vertically inside the border
    const childLines: string[] = [];
    for (const child of this.children) {
      const lines = child.render(childInnerWidth);
      for (const line of lines) {
        const rem = Math.max(0, childInnerWidth - visibleWidth(line));
        childLines.push(applyBg(" ".repeat(padL) + line + " ".repeat(rem + padR)));
      }
    }

    const lines: string[] = [];

    // Top border
    lines.push(
      buildBorderLine({
        leftCorner: bc.tl,
        rightCorner: bc.tr,
        innerWidth,
        totalWidth: width,
        hChar: bc.h,
        borderFn: border,
        textDefs: this.titles,
      }),
    );

    // PaddingY top
    for (let i = 0; i < padT; i++) {
      const inner = applyBg(" ".repeat(innerWidth));
      lines.push(
        padLine(
          border
            ? border(bc.v) + inner + border(bc.v)
            : bc.v + inner + bc.v,
          width,
        ),
      );
    }

    // Content — empty shell when no children or all children return empty
    if (childLines.length === 0) {
      const inner = applyBg(" ".repeat(innerWidth));
      lines.push(
        padLine(
          border
            ? border(bc.v) + inner + border(bc.v)
            : bc.v + inner + bc.v,
          width,
        ),
      );
    } else {
      for (const line of childLines) {
        lines.push(
          padLine(
            border
              ? border(bc.v) + line + border(bc.v)
              : bc.v + line + bc.v,
            width,
          ),
        );
      }
    }

    // PaddingY bottom
    for (let i = 0; i < padB; i++) {
      const inner = applyBg(" ".repeat(innerWidth));
      lines.push(
        padLine(
          border
            ? border(bc.v) + inner + border(bc.v)
            : bc.v + inner + bc.v,
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
        borderFn: border,
        textDefs: this.footers,
      }),
    );

    this.borderCache = { lines, width };
    return lines;
  }

  /**
   * Forward input data to all children. Invalidates the render cache
   * so the next render() picks up child state changes.
   *
   * @param data - Input string forwarded to each child's handleInput, if defined.
   */
  handleInput(data: string): void {
    for (const child of this.children) {
      child.handleInput?.(data);
    }
    this.invalidate();
  }

  /**
   * Invalidate the render cache, forcing a full re-render on the next call.
   * Propagates invalidation to all children.
   */
  override invalidate(): void {
    this.borderCache = null;
    super.invalidate();
  }

  /** Convenience getter for the current border character set. */
  private get borderChars() {
    return BORDER_CHARS[this.borderStyle];
  }
}
