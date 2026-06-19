import { describe, expect, test } from "bun:test";
import { truncate } from "./truncate";

describe("truncate", () => {
  test("returns string unchanged when it fits within maxLen", () => {
    expect(truncate("Hi", 5)).toBe("Hi");
  });

  test("appends ellipsis when string exceeds maxLen", () => {
    expect(truncate("Hello World", 5)).toBe("Hell…");
  });

  test("returns ellipsis alone when maxLen is 1", () => {
    expect(truncate("Hi", 1)).toBe("…");
  });

  test("handles empty string", () => {
    expect(truncate("", 5)).toBe("");
  });

  test("does not append ellipsis for exact fit", () => {
    expect(truncate("Hello", 5)).toBe("Hello");
  });
});
