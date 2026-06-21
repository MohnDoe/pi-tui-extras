# Components

Ready-to-use TUI widgets that implement pi-tui's `Component` interface and compose with any pi-tui component.

## Available components

- [BorderBox](#borderbox) -- bordered container with titles, footers, padding, colors and styles.

---

## BorderBox

A bordered container with optional titles and footers, paddings, colors and border style.

```ts
import { BorderBox } from "@mohndoe/pi-tui-extras";

new BorderBox(new Text("Hello"), {
  borderStyle: "singleRounded",
  borderColor: chalk.blue,
  titles: [{ text: "Demo", align: "left" }],
  footers: [{ text: "Footer", align: "center" }],
  padding: { left: 2 },
});
```

### API

| Prop                 | Values                                       | Default  |                                                  |
| -------------------- | -------------------------------------------- | -------- | ------------------------------------------------ |
| `borderStyle`        | `single`, `singleRounded`, `double`, `heavy` | `single` | Box-drawing style                                |
| `borderColor`        | `(s:string) => string`                       | —        | e.g. `chalk.red`, `(s) => theme.fg("accent", s)` |
| `titles` / `footers` | `TextDef[]` (max 2)                          | —        | Text in top/bottom border                        |
| `padding`            | `{left?,right?,top?,bottom?}`                | —        | Inner spacing                                    |

### Examples

#### Standard box

```ts
new BorderBox(new Text("Hello from BorderBox!", 1, 0), {
  titles: [{ text: "Demo", align: "left" }],
});
```

```
┌─ Demo ─────────────────────────────────────────────────┐
│ Hello from BorderBox!                                  │
└────────────────────────────────────────────────────────┘
```

#### Titles and centered footer

```ts
new BorderBox(new Text("Rounded corners", 0, 0), {
  borderStyle: "singleRounded", // adds rounded border
  titles: [
    { text: "Left title", align: "left" },
    { text: "Right", align: "right" },
  ],
  footers: [{ text: "Footer but centered", align: "center" }],
  padding: { left: 1 },
}),
```

```
╭─ Left title ────────────────────────────────── Right ─╮
│ Rounded corners                                       │
╰───────────────── Footer but centered ─────────────────╯
```

#### Double border, no titles, with padding

```ts
new BorderBox(new Text("No title, no footer but paddings!", 0, 0), {
  borderStyle: "double",
  padding: { top: 3, left: 2, bottom: 1 },
}),
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
