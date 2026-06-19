import { describe, expect, test } from "bun:test";
import { padLine } from "./pad-line";

describe("padLine", () => {
  test("pads a short line with spaces to target width", () => {
    expect(padLine("Hi", 5)).toBe("Hi   ");
  });

  test("returns unchanged when line already matches target", () => {
    expect(padLine("Hello", 5)).toBe("Hello");
  });

  test("returns unchanged when line exceeds target", () => {
    expect(padLine("Hello!", 5)).toBe("Hello!");
  });

  test("handles empty string", () => {
    expect(padLine("", 3)).toBe("   ");
  });
});
