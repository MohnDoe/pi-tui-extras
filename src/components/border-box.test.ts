import { describe, expect, it } from "vitest";
import { Text } from "@mariozechner/pi-tui";
import { BorderBox } from "./border-box";

describe("BorderBox", () => {
  it("renders a single border around child text", () => {
    const child = new Text("Hello", 0, 0);
    const box = new BorderBox(child);

    const lines = box.render(7); // "Hello" = 5 chars + 2 for borders

    expect(lines).toEqual(["┌─────┐", "│Hello│", "└─────┘"]);
  });

  it("renders rounded border", () => {
    const child = new Text("Hi", 0, 0);
    const box = new BorderBox(child, { borderStyle: "singleRounded" });

    const lines = box.render(4);

    expect(lines).toEqual(["╭──╮", "│Hi│", "╰──╯"]);
  });

  it("renders double border", () => {
    const child = new Text("A", 0, 0);
    const box = new BorderBox(child, { borderStyle: "double" });

    const lines = box.render(3);

    expect(lines).toEqual(["╔═╗", "║A║", "╚═╝"]);
  });

  it("renders heavy border", () => {
    const child = new Text("X", 0, 0);
    const box = new BorderBox(child, { borderStyle: "heavy" });

    const lines = box.render(3);

    expect(lines).toEqual(["┏━┓", "┃X┃", "┗━┛"]);
  });

  it("renders left-aligned title", () => {
    const child = new Text("Hello", 0, 0);
    const box = new BorderBox(child, { titles: [{ text: "Title", align: "left" }] });

    const lines = box.render(13); // "Hello"=5 + "─ Title ─"=9 + 2 borders = 13

    expect(lines[0]).toBe("┌─ Title ───┐");
  });

  it("renders right-aligned title", () => {
    const child = new Text("Hello", 0, 0);
    const box = new BorderBox(child, { titles: [{ text: "Title", align: "right" }] });

    const lines = box.render(13);

    expect(lines[0]).toBe("┌─── Title ─┐");
  });

  it("renders centered title", () => {
    const child = new Text("Hello", 0, 0);
    const box = new BorderBox(child, { titles: [{ text: "Title", align: "center" }] });

    const lines = box.render(13);

    expect(lines[0]).toBe("┌── Title ──┐");
  });

  it("renders left + right title pair", () => {
    const child = new Text("Hello", 0, 0);
    const box = new BorderBox(child, {
      titles: [
        { text: "Left", align: "left" },
        { text: "Right", align: "right" },
      ],
    });

    const lines = box.render(20);

    // leftDecor ends with ─, midFill=1 ─, rightDecor starts with ─ → 3 dashes visible
    expect(lines[0]).toBe("┌─ Left ─── Right ─┐");
  });

  it("throws on invalid title combos", () => {
    const child = new Text("x", 0, 0);

    expect(
      () =>
        new BorderBox(child, {
          titles: [
            { text: "a", align: "left" },
            { text: "b", align: "right" },
            { text: "c", align: "center" },
          ],
        }),
    ).toThrow("BorderBox: max 2 titles");

    expect(
      () =>
        new BorderBox(child, {
          titles: [
            { text: "a", align: "center" },
            { text: "b", align: "center" },
          ],
        }),
    ).toThrow("BorderBox: two titles must be left + right");

    expect(
      () =>
        new BorderBox(child, {
          titles: [
            { text: "a", align: "right" },
            { text: "b", align: "left" },
          ],
        }),
    ).toThrow("BorderBox: two titles must be left + right");
  });

  it("renders footer on bottom border", () => {
    const child = new Text("A", 0, 0);
    const box = new BorderBox(child, { footers: [{ text: "Foot", align: "left" }] });

    const lines = box.render(10);

    expect(lines[2]).toBe("└─ Foot ─┘");
  });

  it("applies custom padding", () => {
    const child = new Text("Hi", 0, 0);
    const box = new BorderBox(child, {
      padding: { left: 2, right: 1, top: 1, bottom: 0 },
    });

    const lines = box.render(7);

    // innerWidth=5, childInnerWidth=5-2-1=2, "Hi" at width 2 fits
    // top padding = 1 blank line
    expect(lines).toHaveLength(4); // top border + padTop + content + bottom
    expect(lines[1]).toBe("│     │");
  });

  it("colors border lines when borderColor is set", () => {
    const child = new Text("X", 0, 0);
    const color = (s: string) => `<${s}>`;
    const box = new BorderBox(child, { borderColor: color });

    const lines = box.render(3);

    expect(lines[0]).toBe("<┌><─><┐>");
    expect(lines[1]).toBe("<│>X<│>");
    expect(lines[2]).toBe("<└><─><┘>");
  });

  it("caches render output for same width", () => {
    const child = new Text("Hi", 0, 0);
    const box = new BorderBox(child);

    const first = box.render(10);
    const second = box.render(10);

    expect(first).toBe(second); // same array reference = cached
  });

  it("invalidates cache on invalidate()", () => {
    const child = new Text("Hi", 0, 0);
    const box = new BorderBox(child);

    const first = box.render(10);
    box.invalidate();
    const second = box.render(10);

    expect(first).not.toBe(second);
  });

  it("truncates long titles to fit", () => {
    const child = new Text("X", 0, 0);
    const box = new BorderBox(child, {
      titles: [{ text: "VeryLongTitle", align: "left" }],
    });

    const lines = box.render(5);

    // innerWidth=3, decor needs 4 chars for "─ T ─", text truncated to fit
    expect(lines[0]).toBe("┌─…─┐");
  });

  it("handles empty child", () => {
    const child = new Text("", 0, 0);
    const box = new BorderBox(child);

    const lines = box.render(3);

    expect(lines).toEqual(["┌─┐", "│ │", "└─┘"]);
  });

  it("clamps negative padding to 0", () => {
    const child = new Text("Hi", 0, 0);
    const box = new BorderBox(child, {
      padding: { left: -5, right: -5, top: -1, bottom: -1 },
    });

    // All clamped to 0 → same as no padding
    const lines = box.render(4);

    expect(lines).toEqual(["┌──┐", "│Hi│", "└──┘"]);
  });
});
