import { describe, expect, test } from "bun:test";
import { alignInWidth, alignInWidthLR } from "./align";

describe("alignInWidth", () => {
  test("centers text within width", () => {
    expect(alignInWidth("Hi", 6, "center")).toBe("  Hi  ");
  });

  test("left-aligns text with spaces", () => {
    expect(alignInWidth("Hi", 5, "left")).toBe("Hi   ");
  });

  test("right-aligns text with spaces", () => {
    expect(alignInWidth("Hi", 5, "right")).toBe("   Hi");
  });

  test("uses custom fill character", () => {
    expect(alignInWidth("X", 5, "center", "─")).toBe("──X──");
    expect(alignInWidth("X", 5, "left", "─")).toBe("X────");
    expect(alignInWidth("X", 5, "right", "─")).toBe("────X");
  });

  test("returns content unchanged when equal to width", () => {
    expect(alignInWidth("Hello", 5, "center")).toBe("Hello");
    expect(alignInWidth("Hello", 5, "left")).toBe("Hello");
    expect(alignInWidth("Hello", 5, "right")).toBe("Hello");
  });

  test("returns content unchanged when wider than width", () => {
    expect(alignInWidth("Hello!", 5, "center")).toBe("Hello!");
  });

  test("handles empty content", () => {
    expect(alignInWidth("", 4, "center", "─")).toBe("────");
  });
});

describe("alignInWidthLR", () => {
  test("positions left and right content with fill in between", () => {
    expect(alignInWidthLR("A", "B", 5, "─")).toBe("A───B");
  });

  test("handles zero gap", () => {
    expect(alignInWidthLR("AA", "BB", 4, "─")).toBe("AABB");
  });

  test("overflows when content exceeds width", () => {
    const result = alignInWidthLR("AAAA", "BB", 4, "─");
    expect(result).toBe("AAAABB");
  });
});
