import { describe, expect, it } from "bun:test";
import { alignInWidth, alignInWidthLR } from "./align";

describe("alignInWidth", () => {
  it("centers text within width", () => {
    expect(alignInWidth("Hi", 6, "center")).toBe("  Hi  ");
  });

  it("centers text within odd width", () => {
    expect(alignInWidth("Hi", 7, "center")).toBe("  Hi   ");
    expect(alignInWidth("Hi", 3, "center")).toBe("Hi ");
  });

  it("left-aligns text with spaces", () => {
    expect(alignInWidth("Hi", 5, "left")).toBe("Hi   ");
  });

  it("right-aligns text with spaces", () => {
    expect(alignInWidth("Hi", 5, "right")).toBe("   Hi");
  });

  it("uses custom fill character", () => {
    expect(alignInWidth("X", 5, "center", "─")).toBe("──X──");
    expect(alignInWidth("X", 5, "left", "x")).toBe("Xxxxx");
    expect(alignInWidth("X", 5, "right", ",")).toBe(",,,,X");
  });

  it("returns content unchanged when equal to width", () => {
    expect(alignInWidth("Hello", 5, "center")).toBe("Hello");
    expect(alignInWidth("Hello", 5, "left")).toBe("Hello");
    expect(alignInWidth("Hello", 5, "right")).toBe("Hello");
  });

  it("returns content unchanged when wider than width", () => {
    expect(alignInWidth("Hello!", 5, "center")).toBe("Hello!");
  });

  it("handles empty content", () => {
    expect(alignInWidth("", 4, "center", "─")).toBe("────");
  });
});

describe("alignInWidthLR", () => {
  it("positions left and right content with fill in between", () => {
    expect(alignInWidthLR("A", "B", 5, "─")).toBe("A───B");
  });

  it("handles zero gap", () => {
    expect(alignInWidthLR("AA", "BB", 4, "─")).toBe("AABB");
  });

  it("overflows when content exceeds width", () => {
    const result = alignInWidthLR("AAAA", "BB", 4, "─");
    expect(result).toBe("AAAABB");
  });
});
