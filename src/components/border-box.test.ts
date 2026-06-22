import { Text, Box, type Component } from "@mariozechner/pi-tui";
import { describe, expect, it, mock } from "bun:test";
import { BorderBox } from "./border-box";

describe("BorderBox", () => {
  describe("Box API", () => {
    it("supports addChild/removeChild/clear", () => {
      const box = new BorderBox();
      expect(box).toBeInstanceOf(Box);
      expect(typeof box.addChild).toBe("function");
      expect(typeof box.removeChild).toBe("function");
      expect(typeof box.clear).toBe("function");
    });

    it("renders empty border shell when no children added", () => {
      const box = new BorderBox();
      const lines = box.render(3);
      expect(lines).toEqual(["┌─┐", "│ │", "└─┘"]);
    });

    it("renders a border around one child added via addChild", () => {
      const child = new Text("Hello", 0, 0);
      const box = new BorderBox();
      box.addChild(child);
      const lines = box.render(7);
      expect(lines).toEqual(["┌─────┐", "│Hello│", "└─────┘"]);
    });

    it("stacks multiple children vertically inside the border", () => {
      const box = new BorderBox();
      box.addChild(new Text("A", 0, 0));
      box.addChild(new Text("B", 0, 0));
      const lines = box.render(4);
      expect(lines).toEqual(["┌──┐", "│A │", "│B │", "└──┘"]);
    });

    it("can removes a child child from rendering", () => {
      const childA = new Text("A", 0, 0);
      const childB = new Text("B", 0, 0);
      const box = new BorderBox();
      box.addChild(childA);
      box.addChild(childB);
      box.removeChild(childA);
      const lines = box.render(4);
      expect(lines).toEqual(["┌──┐", "│B │", "└──┘"]);
    });

    it("clears all children", () => {
      const box = new BorderBox();
      box.addChild(new Text("A", 0, 0));
      box.addChild(new Text("B", 0, 0));
      box.clear();
      const lines = box.render(3);
      expect(lines).toEqual(["┌─┐", "│ │", "└─┘"]);
    });
  });

  describe("border renderer", () => {
    it("renders a single border around child text", () => {
      const box = new BorderBox();
      box.addChild(new Text("Hello", 0, 0));

      const lines = box.render(7); // "Hello" = 5 chars + 2 for borders

      expect(lines).toEqual(["┌─────┐", "│Hello│", "└─────┘"]);
    });

    it("renders rounded border", () => {
      const box = new BorderBox({ borderStyle: "singleRounded" });
      box.addChild(new Text("Hi", 0, 0));

      const lines = box.render(4);

      expect(lines).toEqual(["╭──╮", "│Hi│", "╰──╯"]);
    });

    it("renders double border", () => {
      const box = new BorderBox({ borderStyle: "double" });
      box.addChild(new Text("A", 0, 0));

      const lines = box.render(3);

      expect(lines).toEqual(["╔═╗", "║A║", "╚═╝"]);
    });

    it("renders heavy border", () => {
      const box = new BorderBox({ borderStyle: "heavy" });
      box.addChild(new Text("X", 0, 0));

      const lines = box.render(3);

      expect(lines).toEqual(["┏━┓", "┃X┃", "┗━┛"]);
    });

    it("styles border lines when borderFn is set", () => {
      const color = (s: string) => `<${s}>`;
      const box = new BorderBox({ borderFn: color });
      box.addChild(new Text("X", 0, 0));

      const lines = box.render(3);

      expect(lines[0]).toBe("<┌><─><┐>");
      expect(lines[1]).toBe("<│>X<│>");
      expect(lines[2]).toBe("<└><─><┘>");
    });
  });

  describe("title(s) renderer", () => {
    it("renders left-aligned title", () => {
      const box = new BorderBox({ titles: [{ text: "Title", align: "left" }] });
      box.addChild(new Text("Hello", 0, 0));

      const lines = box.render(13); // "Hello"=5 + "─ Title ─"=9 + 2 borders = 13

      expect(lines[0]).toBe("┌─ Title ───┐");
    });

    it("renders right-aligned title", () => {
      const box = new BorderBox({ titles: [{ text: "Title", align: "right" }] });
      box.addChild(new Text("Hello", 0, 0));

      const lines = box.render(13);

      expect(lines[0]).toBe("┌─── Title ─┐");
    });

    it("renders centered title", () => {
      const box = new BorderBox({ titles: [{ text: "Title", align: "center" }] });
      box.addChild(new Text("Hello", 0, 0));

      const lines = box.render(13);

      expect(lines[0]).toBe("┌── Title ──┐");
    });

    it("renders left + right title pair", () => {
      const box = new BorderBox({
        titles: [
          { text: "Left", align: "left" },
          { text: "Right", align: "right" },
        ],
      });
      box.addChild(new Text("Hello", 0, 0));

      const lines = box.render(20);

      expect(lines[0]).toBe("┌─ Left ─── Right ─┐");
    });

    it("renders left + right title pair : no matter the order of the params", () => {
      const box = new BorderBox({
        titles: [
          { text: "Right", align: "right" },
          { text: "Left", align: "left" },
        ],
      });
      box.addChild(new Text("Hello", 0, 0));

      const lines = box.render(20);

      expect(lines[0]).toBe("┌─ Left ─── Right ─┐");
    });

    it("throws on invalid title combos", () => {
      expect(
        () =>
          new BorderBox({
            titles: [
              { text: "a", align: "left" },
              { text: "b", align: "right" },
              { text: "c", align: "center" },
            ],
          }),
      ).toThrow("BorderBox: max 2 text definitions per line");

      expect(
        () =>
          new BorderBox({
            titles: [
              { text: "a", align: "center" },
              { text: "b", align: "center" },
            ],
          }),
      ).toThrow("BorderBox: two text definitions on the same line must be left + right");

      expect(
        () =>
          new BorderBox({
            titles: [
              { text: "a", align: "left" },
              { text: "b", align: "left" },
            ],
          }),
      ).toThrow("BorderBox: two text definitions on the same line must be left + right");

      expect(
        () =>
          new BorderBox({
            titles: [
              { text: "a", align: "right" },
              { text: "b", align: "right" },
            ],
          }),
      ).toThrow("BorderBox: two text definitions on the same line must be left + right");
    });

    it("truncates long titles to fit", () => {
      const box = new BorderBox({
        titles: [{ text: "VeryLongTitle", align: "left" }],
      });
      box.addChild(new Text("X", 0, 0));

      const lines = box.render(5);

      // innerWidth=3, decor needs 4 chars for "─ T ─", text truncated to fit
      expect(lines[0]).toBe("┌─…─┐");
    });
  });

  describe("footer(s) renderer", () => {
    it("renders footer on bottom border", () => {
      const box = new BorderBox({ footers: [{ text: "Foot", align: "left" }] });
      box.addChild(new Text("A", 0, 0));

      const lines = box.render(10);

      expect(lines[2]).toBe("└─ Foot ─┘");
    });

    it("renders left-aligned footer", () => {
      const box = new BorderBox({ footers: [{ text: "Footer", align: "left" }] });
      box.addChild(new Text("Hello", 0, 0));

      const lines = box.render(20);
      expect(lines[lines.length - 1]).toBe("└─ Footer ─────────┘");
    });

    it("renders right-aligned footer", () => {
      const box = new BorderBox({ footers: [{ text: "Footer", align: "right" }] });
      box.addChild(new Text("Hello", 0, 0));

      const lines = box.render(20);

      expect(lines[lines.length - 1]).toBe("└───────── Footer ─┘");
    });

    it("renders centered footer", () => {
      const box = new BorderBox({ footers: [{ text: "Footer", align: "center" }] });
      box.addChild(new Text("Hello", 0, 0));

      const lines = box.render(16);

      expect(lines[lines.length - 1]).toBe("└─── Footer ───┘");
    });

    it("renders left + right footer pair", () => {
      const box = new BorderBox({
        footers: [
          { text: "Left", align: "left" },
          { text: "Right", align: "right" },
        ],
      });
      box.addChild(new Text("Hello", 0, 0));

      const lines = box.render(20);

      expect(lines[lines.length - 1]).toBe("└─ Left ─── Right ─┘");
    });

    it("renders left + right footer pair : no matter the order of the params", () => {
      const box = new BorderBox({
        footers: [
          { text: "Right", align: "right" },
          { text: "Left", align: "left" },
        ],
      });
      box.addChild(new Text("Hello", 0, 0));

      const lines = box.render(20);

      expect(lines[lines.length - 1]).toBe("└─ Left ─── Right ─┘");
    });

    it("throws on invalid footer combos", () => {
      expect(
        () =>
          new BorderBox({
            footers: [
              { text: "a", align: "left" },
              { text: "b", align: "right" },
              { text: "c", align: "center" },
            ],
          }),
      ).toThrow("BorderBox: max 2 text definitions per line");

      expect(
        () =>
          new BorderBox({
            footers: [
              { text: "a", align: "center" },
              { text: "b", align: "center" },
            ],
          }),
      ).toThrow("BorderBox: two text definitions on the same line must be left + right");

      expect(
        () =>
          new BorderBox({
            footers: [
              { text: "a", align: "left" },
              { text: "b", align: "left" },
            ],
          }),
      ).toThrow("BorderBox: two text definitions on the same line must be left + right");

      expect(
        () =>
          new BorderBox({
            footers: [
              { text: "a", align: "right" },
              { text: "b", align: "right" },
            ],
          }),
      ).toThrow("BorderBox: two text definitions on the same line must be left + right");
    });

    it("truncates long footers to fit", () => {
      const box = new BorderBox({
        footers: [{ text: "VeryLongFooter", align: "left" }],
      });
      box.addChild(new Text("X", 0, 0));

      const lines = box.render(5);

      // innerWidth=3, decor needs 4 chars for "─ T ─", text truncated to fit
      expect(lines[lines.length - 1]).toBe("└─…─┘");
    });
  });

  describe("styling options", () => {
    it("applies bgFn background to inner content area", () => {
      // ANSI-reset wrapper simulates zero-width styling
      const bg = (s: string) => `\x1b[44m${s}\x1b[49m`;
      const box = new BorderBox({ bgFn: bg });
      box.addChild(new Text("X", 0, 0));

      const lines = box.render(3);

      // Inner content "X" gets wrapped: "\x1b[44mX\x1b[49m"
      expect(lines[1]).toBe("│\x1b[44mX\x1b[49m│");
    });

    it("bgFn applies to empty inner area (no children)", () => {
      const bg = (s: string) => `[${s}]`;
      const box = new BorderBox({ bgFn: bg });

      const lines = box.render(3);

      // innerWidth=1, " " → "[ ]"
      expect(lines[1]).toBe("│[ ]│");
    });

    it("bgFn applies to padding lines", () => {
      const bg = (s: string) => `<${s}>`;
      const box = new BorderBox({ bgFn: bg, padding: { top: 1 } });
      box.addChild(new Text("X", 0, 0));

      const lines = box.render(3);

      // Top padding line: innerWidth=1, " " → "< >"
      expect(lines[1]).toBe("│< >│");
    });

    it("both borderFn and bgFn can be set together", () => {
      // Zero-width ANSI wrappers simulate real chalk usage
      const border = (s: string) => `\x1b[31m${s}\x1b[39m`;
      const bg = (s: string) => `\x1b[44m${s}\x1b[49m`;
      const box = new BorderBox({ borderFn: border, bgFn: bg });
      box.addChild(new Text("X", 0, 0));

      const lines = box.render(3);

      // │ (red) + X (blue bg) + │ (red)
      expect(lines[1]).toBe("\x1b[31m│\x1b[39m\x1b[44mX\x1b[49m\x1b[31m│\x1b[39m");
    });
  });

  describe("padding option", () => {
    it("clamps negative padding to 0", () => {
      const box = new BorderBox({
        padding: { left: -5, right: -5, top: -1, bottom: -1 },
      });
      box.addChild(new Text("Hi", 0, 0));

      // All clamped to 0 → same as no padding
      const lines = box.render(4);

      expect(lines).toEqual(["┌──┐", "│Hi│", "└──┘"]);
    });

    it("applies custom padding", () => {
      const box = new BorderBox({
        padding: { left: 2, right: 1, top: 1, bottom: 0 },
      });
      box.addChild(new Text("Hi", 0, 0));

      const lines = box.render(7);

      // innerWidth=5, childInnerWidth=5-2-1=2, "Hi" at width 2 fits
      // top padding = 1 blank line
      expect(lines).toHaveLength(4); // top border + padTop + content + bottom
      expect(lines[1]).toBe("│     │");
    });

    it("applies padding to multiple children", () => {
      const box = new BorderBox({
        padding: { left: 1, right: 1, top: 0, bottom: 0 },
      });
      box.addChild(new Text("A", 0, 0));
      box.addChild(new Text("B", 0, 0));

      const lines = box.render(6);

      // innerWidth=4, childInnerWidth=4-1-1=2
      expect(lines[1]).toBe("│ A  │");
      expect(lines[2]).toBe("│ B  │");
    });
  });

  describe("Component behaviors", () => {
    it("caches render output for same width", () => {
      const box = new BorderBox();
      box.addChild(new Text("Hi", 0, 0));

      const first = box.render(10);
      const second = box.render(10);

      expect(first).toBe(second); // same array reference = cached
    });

    it("invalidates cache on invalidate()", () => {
      const box = new BorderBox();
      box.addChild(new Text("Hi", 0, 0));

      const first = box.render(10);
      box.invalidate();
      const second = box.render(10);

      expect(first).not.toBe(second);
    });

    it("forwards input to all children and invalidates", () => {
      const childA: Component = {
        render: mock((_w) => [""]),
        invalidate: mock(() => {}),
        handleInput: mock(() => {}),
      };
      const childB: Component = {
        render: mock((_w) => [""]),
        invalidate: mock(() => {}),
        handleInput: mock(() => {}),
      };

      const borderBox = new BorderBox();
      borderBox.addChild(childA);
      borderBox.addChild(childB);

      borderBox.handleInput("a");

      expect(childA.handleInput).toHaveBeenCalledWith("a");
      expect(childB.handleInput).toHaveBeenCalledWith("a");

      expect(childA.invalidate).toHaveBeenCalledTimes(1);
      expect(childB.invalidate).toHaveBeenCalledTimes(1);
    });

    it("still invalidates when children have no handler", () => {
      const borderBox = new BorderBox();
      borderBox.addChild(new Text());

      const spyInvalidate = mock(() => {});
      borderBox.invalidate = spyInvalidate;

      borderBox.handleInput("q");

      expect(spyInvalidate).toHaveBeenCalledTimes(1);
    });
  });

  describe("edge cases", () => {
    it("handles empty child (renders empty string)", () => {
      const box = new BorderBox();
      box.addChild(new Text("", 0, 0));

      const lines = box.render(3);

      expect(lines).toEqual(["┌─┐", "│ │", "└─┘"]);
    });
  });
});
