import { describe, expect, it } from "bun:test";
import { padLine } from "./pad-line";

describe("padLine", () => {
  it("pads a short line with spaces to target width", () => {
    expect(padLine("Hi", 5)).toBe("Hi   ");
  });

  it("returns unchanged when line width already matches target", () => {
    expect(padLine("Hello", 5)).toBe("Hello");
  });

  it("returns unchanged when line width exceeds target", () => {
    expect(padLine("Hello!", 5)).toBe("Hello!");
  });

  it("handles empty string", () => {
    expect(padLine("", 3)).toBe("   ");
  });
});
