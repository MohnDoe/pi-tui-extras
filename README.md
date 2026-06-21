<p align="center">
  <strong>A pi.dev component and utility library.</strong>
</p>
<p align="center">
  <img src="https://img.shields.io/badge/coverage-96%25-green" alt="Coverage">
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat&colorA=222222&logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="https://bun.sh"><img src="https://img.shields.io/badge/runtime-Bun-f472b6?style=flat&colorA=222222" alt="Bun"></a>
  <a href="https://github.com/mohndoe/pi-tui-extras/blob/main/LICENSE"><img src="https://img.shields.io/github/license/mohndoe/pi-tui-extras?style=flat&colorA=222222&colorB=58A6FF" alt="License"></a>
</p>

Customizable, well-tested and easy to use components and utilities for pi.dev extensions development.

## Install

```bash
bun add @mohndoe/pi-tui-extras
npm install @mohndoe/pi-tui-extras
pnpm add @mohndoe/pi-tui-extras
yarn add @mohndoe/pi-tui-extras
```

## Components

- [**BorderBox**](src/components/README.md#borderbox) -- Bordered container with configurable style, titles, footers, and padding.
- ~~**Table**~~ _(coming soon)_
- ~~**FlexLayout**~~ _(coming soon)_
- ~~**Scrollbar**~~ _(coming soon)_

See all components [**here**](src/components/README.md).

## Core utilities

- [**`truncate`**](src/core/README.md#truncate) -- Fit string to a maximum visible width, appending "…".
- [**`padLine`**](src/core/README.md#padline) -- Right-pad a string with spaces to reach a target width.
- [**`alignInWidth`**](src/core/README.md#aligninwidth) -- Left, center, or right-align text within a fixed width.
- [**`alignInWidthLR`**](src/core/README.md#aligninwidthlr) -- Position two strings at opposite ends of a fixed width.

See all all utilities [**here**](src/core/README.md).

## Project status

Early development. [**BorderBox**](src/components/README.md#borderbox) is stable and tested. More components coming, including: tables, flex layout, scrollbar, etc.

## Contributing

This project follows the conventions in [`CONTEXT.md`](CONTEXT.md) and [`AGENTS.md`](AGENTS.md). Tests are co-located (`*.test.ts` next to source) and use `vitest`.

1. Branch from `main` into a `feat/` or `fix/` prefix
2. Write tests before implementation (TDD)
3. Run `bun test` before opening a PR
4. Open a PR

## License

MIT — see [LICENSE](LICENSE).
