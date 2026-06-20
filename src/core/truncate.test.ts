import { describe, expect, it } from "bun:test";
import { truncate } from "./truncate";

describe("truncate", () => {
  it("returns string unchanged when it fits within maxLen", () => {
    expect(truncate("Hi", 5)).toBe("Hi");
  });

  it("appends ellipsis when string exceeds maxLen", () => {
    expect(truncate("Hello World", 5)).toBe("Hell…");
  });

  it("returns ellipsis alone when maxLen is 1", () => {
    expect(truncate("Hi", 1)).toBe("…");
  });

  it("returns ellipsis alone when maxLen is 0", () => {
    expect(truncate("Hi", 0)).toBe("…");
  });

  it("handles empty string", () => {
    expect(truncate("", 5)).toBe("");
  });

  it("does not append ellipsis for exact fit", () => {
    expect(truncate("Hello", 5)).toBe("Hello");
  });
});
