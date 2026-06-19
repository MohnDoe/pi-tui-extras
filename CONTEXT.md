# pi-tui-extras

A component and utility library extending `@mariozechner/pi-tui` with additional TUI widgets and layout primitives. All components accept the standard pi-tui `Component` interface. Tests are co-located (`*.test.ts` next to source) and use vitest.

## Language

**pi-tui-extras**:
A library of optional components and utilities layered on pi-tui. Consumers install it alongside pi-tui and import individual extras as needed.
_Avoid_: Framework, extension, plugin system

**pi-tui**:
The upstream TUI framework (`@mariozechner/pi-tui`) that pi-tui-extras extends. All components in this library implement pi-tui's `Component` interface and are composable with any pi-tui Component (Text, Box, Input, SelectList, etc.).
_Avoid_: Host framework, base library
