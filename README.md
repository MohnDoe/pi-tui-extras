<p align="center">
  <strong>Extras components and utilities for pi.dev</strong>
</p>
<p align="center">
  <a href="https://github.com/mohndoe/pi-tui-extras/blob/main/LICENSE"><img src="https://img.shields.io/github/license/mohndoe/pi-tui-extras?style=flat&colorA=222222&colorB=58A6FF" alt="License"></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat&colorA=222222&logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="https://bun.sh"><img src="https://img.shields.io/badge/runtime-Bun-f472b6?style=flat&colorA=222222" alt="Bun"></a>
</p>

Out of the box and useful components for pi.dev extensions development.

## Install

```bash
bun add @mohndoe/pi-tui-extras
npm install @mohndoe/pi-tui-extras
pnpm add @mohndoe/pi-tui-extras
yarn add @mohndoe/pi-tui-extras
```

## Components

### BorderBox

A bordered container with optional titles and footers, paddings, colors and border style.

```ts
import { BorderBox } from "@mohndoe/pi-tui-extras";
import { Text } from "@mariozechner/pi-tui";
import chalk from "chalk";

new BorderBox(new Text("Hello", 1, 0), {
  borderStyle: "singleRounded",
  borderColor: chalk.blue,
  titles: [{ text: "Demo", align: "left" }],
  footers: [{ text: "Footer", align: "center" }],
  padding: { left: 2 },
});
```

| Prop                 | Values                                       | Default  |                                                  |
| -------------------- | -------------------------------------------- | -------- | ------------------------------------------------ |
| `borderStyle`        | `single`, `singleRounded`, `double`, `heavy` | `single` | Box-drawing style                                |
| `borderColor`        | `(s:string) => string`                       | —        | e.g. `chalk.red`, `(s) => theme.fg("accent", s)` |
| `titles` / `footers` | `TitleDef[]` (max 2)                         | —        | Text in top/bottom border                        |
| `padding`            | `{left?,right?,top?,bottom?}`                | —        | Inner spacing                                    |

#### Examples

##### Standard box

```ts
new BorderBox(new Text("Hello from BorderBox!", 1, 0), {
  titles: [{ text: "Demo", align: "left" }],
});
```

```bash
┌─ Demo ─────────────────────────────────────────────────┐
│ Hello from BorderBox!                                  │
└────────────────────────────────────────────────────────┘
```

##### Titles and centered footer

```ts
new BorderBox(new Text("Rounded corners", 0, 0), {
  borderStyle: "singleRounded",
  titles: [
    { text: "Left title", align: "left" },
    { text: "Right", align: "right" },
  ],
  footers: [{ text: "Footer but centered", align: "center" }],
  padding: {
    left: 1,
  },
}),
```

```bash
╭─ Left title ────────────────────────────────── Right ─╮
│ Rounded corners                                       │
╰───────────────── Footer but centered ─────────────────╯
```

##### Double border, no titles or footers, and some padding

```ts
new BorderBox(new Text("No title, no footer but paddings!", 0, 0), {
  borderStyle: "double",
  padding: {
    top: 3,
    left: 2,
    bottom: 1,
  },
}),
```

```bash
╔════════════════════════════════════════════════════════╗
║                                                        ║
║                                                        ║
║                                                        ║
║  No title, no footer but paddings!                     ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
```

### Core utilities

| Export                                       | Description                     |
| -------------------------------------------- | ------------------------------- |
| `truncate(s, maxLen)`                        | Fit string to width, append "…" |
| `padLine(line, targetWidth)`                 | Right-pad to width              |
| `alignInWidth(content, width, align, fill?)` | Left/center/right align         |
| `alignInWidthLR(left, right, width, fill?)`  | Two strings opposite ends       |

## Project status

Early development. `BorderBox` is stable and tested. More components coming, including: tables, flex layout, scrollbar, etc.

## Contributing

This project follows the conventions in [`CONTEXT.md`](CONTEXT.md) and [`AGENTS.md`](AGENTS.md). Tests are co-located (`*.test.ts` next to source) and use `vitest`.

1. Branch from `main` into a `feat/` or `fix/` prefix
2. Write tests before implementation (TDD)
3. Run `bun test` before opening a PR
4. Open a PR

## License

MIT — see [LICENSE](LICENSE).
