# Components

Ready-to-use TUI widgets that implement pi-tui's `Component` interface and compose with any pi-tui component.

## Available components

- [BorderBox](#borderbox) -- bordered container with titles, footers, padding, and three styling layers.

### Planned components

Gauge / **progress bar**, **flex layout**, scrollbar, titles, table / sorted table, dialog, **tabs**.

---

## BorderBox

A bordered container with optional titles and footers, paddings, and three independent styling layers (border, inner content, outer line). Extends pi-tui's `Box` so `addChild`, `removeChild`, and `clear` work as expected.

```ts
import { BorderBox } from "@mohndoe/pi-tui-extras";

const box = new BorderBox({
  borderStyle: "singleRounded",
  borderFn: chalk.blue,
  innerFn: chalk.bgWhite,
  outerFn: chalk.bgBlackBright,
  titles: [{ text: "Demo", align: "left" }],
  footers: [{ text: "Footer", align: "center" }],
  padding: { left: 2 },
});
box.addChild(new Text("Hello", 1, 0));
box.addChild(new Text("World", 1, 0));
```

### API

| Prop                 | Values                                       | Default  |                                                       |
| -------------------- | -------------------------------------------- | -------- | ----------------------------------------------------- |
| `borderStyle`        | `single`, `singleRounded`, `double`, `heavy` | `single` | Box-drawing style                                     |
| `borderFn`           | `(s: string) => string`                      | —        | Styles each border character. e.g. `chalk.red`        |
| `innerFn`            | `(s: string) => string`                      | —        | Styles the content area between the vertical bars     |
| `outerFn`            | `(s: string) => string`                      | —        | Styles every complete output line (borders + content) |
| `titles` / `footers` | `TextDef[]` (max 2 each)                     | —        | Decorative text in top/bottom border edge             |
| `padding`            | `{left?,right?,top?,bottom?}`                | —        | Inner spacing between border edge and children        |

All style functions (`borderFn`, `innerFn` and `outerFn`) receive the raw string and return a styled version.
Typical usage: `chalk.red`, `chalk.bgBlue`, `(s) => theme.fg("muted", s)`.

Children are added via the inherited `addChild()` method. Multiple children stack vertically inside the border.

```ts
const box = new BorderBox();
box.addChild(new Text("Line one"));
box.addChild(new Text("Line two"));
box.clear(); // removes all children
```

### Styling layers

Styling layers are applied inside-out on each content line:

```
1. child text
2. pad to inner width
3. innerFn wraps the padded content
4. borderFn wraps each border character, assembled around the inner content
5. padLine fills to full width
6. outerFn wraps the complete line

┌─────────────────────┐   outerFn wraps every complete line
│                     │
│                     │   innerFn wraps between the bars
│                     │
└─────────────────────┘   borderFn styles each border character
```

### Examples

#### Basic usage

```ts
const box = new BorderBox({ titles: [{ text: "Demo", align: "left" }] });
box.addChild(new Text("Hello from BorderBox!", 1, 0));
```

```
┌─ Demo ─────────────────────────────────────────────────┐
│ Hello from BorderBox!                                  │
└────────────────────────────────────────────────────────┘
```

#### Titles and centered footer

```ts
const box = new BorderBox({
  borderStyle: "singleRounded",
  titles: [
    { text: "Left title", align: "left" },
    { text: "Right", align: "right" },
  ],
  footers: [{ text: "Footer but centered", align: "center" }],
  padding: { left: 1 },
});
box.addChild(new Text("Rounded corners", 0, 0));
```

```
╭─ Left title ────────────────────────────────── Right ─╮
│ Rounded corners                                       │
╰───────────────── Footer but centered ─────────────────╯
```

#### Double border, no titles, with padding

```ts
const box = new BorderBox({
  borderStyle: "double",
  padding: { top: 3, left: 2, bottom: 1 },
});
box.addChild(new Text("No title, no footer but paddings!", 0, 0));
```

```
╔════════════════════════════════════════════════════════╗
║                                                        ║
║                                                        ║
║                                                        ║
║  No title, no footer but paddings!                     ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
```

#### Styling layers combined

```ts
const box = new BorderBox({
  borderStyle: "heavy",
  borderFn: chalk.red,
  innerFn: chalk.bgWhite,
  outerFn: chalk.bgBlackBright,
  titles: [{ text: "Combining styles", align: "left" }],
});
box.addChild(new Text(chalk.black("Inner area styled via innerFn"), 1, 0));
box.addChild(new Text(chalk.black("Full box styled via outerFn"), 1, 0));
```
