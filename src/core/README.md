# Core utilities

String manipulation helpers for terminal-width-aware text layout. All functions account for visible character width (not byte length) using pi-tui's `visibleWidth`.

## Available utilities

- [`truncate`](#truncate) -- Fit string to a maximum visible width, appending "…"
- [`padLine`](#padline) -- Right-pad a string with spaces to reach a target width
- [`alignInWidth`](#aligninwidth) -- Left, center, or right-align text within a fixed width
- [`alignInWidthLR`](#aligninwidthlr) -- Position two strings at opposite ends of a fixed width

---

## truncate

```ts
truncate(s: string, maxLen: number): string
```

Truncates a string to fit within `maxLen` visible characters, appending `"…"` (single ellipsis character) when the string is longer than the limit.

```ts
import { truncate } from "@mohndoe/pi-tui-extras";

truncate("Hello World", 8); // "Hello Wo…"
truncate("Hello World", 20); // "Hello World"
// text shorter than maxLen : no change
truncate("Short", 10); // "Short"
```

## padLine

```ts
padLine(line: string, targetWidth: number): string
```

Right-pads a string with spaces to reach `targetWidth` visible characters. If the string is already at or beyond the target width, returns it unchanged.

```ts
import { padLine } from "@mohndoe/pi-tui-extras";

padLine("Left", 10); // "Left      "
padLine("ExactlyTen", 10); // "ExactlyTen"
// text longer than targetWidth : no change
padLine("Too long!", 5); // "Too long!"
```

## alignInWidth

```ts
alignInWidth(
  content: string,
  width: number,
  align: Align,
  fill?: string,
): string
```

Positions `content` inside a fixed `width` with the given alignment (`"left"`, `"right"`, or `"center"`). The remaining space is filled with `fill` (default: space).

```ts
import { alignInWidth } from "@mohndoe/pi-tui-extras";

alignInWidth("X", 8, "left"); // "X       "
alignInWidth("X", 8, "right"); // "       X"
alignInWidth("X", 8, "center"); // "   X    "
alignInWidth("X", 8, "right", "."); // ".......X"
```

## alignInWidthLR

```ts
alignInWidthLR(
  left: string,
  right: string,
  width: number,
  fill?: string,
): string
```

Positions two strings at opposite ends of a fixed width. Useful for rendering two-column border titles, status bars, or side-by-side labels.

```ts
import { alignInWidthLR } from "@mohndoe/pi-tui-extras";

alignInWidthLR("Left", "Right", 15); // "Left       Right"
alignInWidthLR("L", "R", 10, "."); // "L........R"
alignInWidthLR("A", "B", 3); // "A B"
```
