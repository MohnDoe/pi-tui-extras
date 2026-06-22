import {
  type Component,
  ProcessTerminal,
  SelectList,
  Text,
  type SelectItem,
  type SelectListTheme,
  TUI,
} from "@mariozechner/pi-tui";
import chalk from "chalk";
import type { ControlAction, DemoPage } from "./harness/types";
import { BorderBoxPage } from "./pages/border-box";

// ─── SelectList theme ───────────────────────────────────────

const CONTROL_THEME: SelectListTheme = {
  selectedPrefix: (s: string) => chalk.cyan(s),
  selectedText: (s: string) => chalk.cyan(s),
  description: (s: string) => chalk.dim(s),
  scrollInfo: (s: string) => chalk.dim(s),
  noMatch: (s: string) => chalk.red(s),
};

// ─── TUI lifecycle ──────────────────────────────────────────

let tui: TUI | undefined;

function cleanup() {
  tui?.stop();
  tui = undefined;
}

process.on("SIGTERM", () => {
  cleanup();
  process.exit(0);
});
process.on("SIGINT", () => {
  cleanup();
  process.exit(0);
});
process.on("SIGQUIT", () => {
  cleanup();
  process.exit(0);
});
process.on("uncaughtException", (err) => {
  cleanup();
  console.error(err);
  process.exit(1);
});
process.on("unhandledRejection", (reason) => {
  cleanup();
  console.error(reason);
  process.exit(1);
});

// ─── Harness view: renders tab bar + preview + state ───────

class HarnessView implements Component {
  constructor(
    private pages: DemoPage[],
    private activeIndex: () => number,
  ) {}

  render(width: number): string[] {
    const lines: string[] = [];
    const idx = this.activeIndex();
    const page = this.pages[idx];

    if (!page) return lines;

    // ── Tab bar ───────────────────────────────────────────
    const tabParts: string[] = [];
    for (let i = 0; i < this.pages.length; i++) {
      const p = this.pages[i]!;
      if (i === idx) {
        tabParts.push(chalk.cyan(`[${p.name}]`));
      } else if (p.tabHotkey) {
        tabParts.push(chalk.dim(`${p.tabHotkey}.${p.name}`));
      } else {
        tabParts.push(chalk.dim(p.name));
      }
    }
    lines.push(chalk.bold("@mohndoe/pi-tui-extras") + " demo !");
    lines.push(chalk.dim("Test components in your terminal, live."));
    lines.push("");

    lines.push(chalk.bold("─".repeat(width)));
    lines.push(`Active component | ${tabParts.join("  ")}  `);
    lines.push(chalk.bold("─".repeat(width)));

    lines.push(chalk.dim("─".repeat(width)));
    lines.push(chalk.bold(chalk.dim("| Live preview strart")));
    lines.push(chalk.dim("─".repeat(width)));
    // ── Page preview ──────────────────────────────────────
    const pageLines = page.render(width);
    lines.push(...pageLines);

    lines.push(chalk.dim("─".repeat(width)));
    lines.push(chalk.bold(chalk.dim("| End of live preview")));

    lines.push(chalk.dim("─".repeat(width)));
    lines.push(chalk.bold("| Current component's config:"));
    const readout = page.getStateReadout();
    for (const r of readout) {
      lines.push(chalk.dim("| " + r));
    }
    // ── Bottom separator (above controls) ────────────────
    lines.push(chalk.dim("─".repeat(width)));

    lines.push(chalk.bold("Change component's config:"));

    return lines;
  }

  invalidate(): void {
    const idx = this.activeIndex();
    this.pages[idx]?.invalidate();
  }
}

// ─── SelectList helper: build items from ControlActions ────

function actionsToItems(actions: ControlAction[]): SelectItem[] {
  return actions.map((a) => ({
    value: a.id,
    label: a.label,
    description: "",
  }));
}

function makeSelectList(page: DemoPage): SelectList {
  const select = new SelectList(actionsToItems(page.getActions()), 10, CONTROL_THEME);
  select.onSelect = (item: SelectItem) => {
    const action = page.getActions().find((a) => a.id === item.value);
    action?.execute();
    tui?.requestRender();
  };
  return select;
}

// ─── Main ──────────────────────────────────────────────────

function main() {
  const terminal = new ProcessTerminal();
  tui = new TUI(terminal);

  // ── Pages ───────────────────────────────────────────────
  const pages: DemoPage[] = [new BorderBoxPage()];
  let activePageIndex = 0;

  function currentPage(): DemoPage {
    return pages[activePageIndex]!;
  }

  // ── Assemble TUI children ───────────────────────────────
  const harnessView = new HarnessView(pages, () => activePageIndex);
  let controlSelect = makeSelectList(currentPage());

  tui.addChild(harnessView);
  tui.addChild(new Text(chalk.dim("↑↓ move | Enter to select"), 0, 0));
  tui.addChild(controlSelect);

  // ── Input listener ───────────────────────────────────────
  tui.addInputListener((data: string) => {
    // Quit
    if (data === "q") {
      tui!.stop();
      process.exit(0);
    }

    // Tab → next page, Shift+Tab → prev page
    if (data === "tab" || data === "shift+tab") {
      const prev = activePageIndex;
      if (data === "tab") {
        activePageIndex = (activePageIndex + 1) % pages.length;
      } else {
        activePageIndex = (activePageIndex - 1 + pages.length) % pages.length;
      }
      if (activePageIndex !== prev) {
        // Remove old SelectList, insert new one at same index
        const idx = tui!.children.indexOf(controlSelect);
        tui!.removeChild(controlSelect);
        controlSelect = makeSelectList(currentPage());
        tui!.children.splice(idx, 0, controlSelect);
        tui!.setFocus(controlSelect);
        tui!.requestRender();
      }
      return { consume: true };
    }

    // Single-char hotkey → route to current page
    if (data.length === 1) {
      const consumed = currentPage().handleHotkey(data);
      if (consumed) {
        tui?.requestRender();
        return { consume: true };
      }
    }

    // Pass through to focused component (SelectList)
    return undefined;
  });

  // Focus the SelectList so arrow keys work
  tui.setFocus(controlSelect);

  tui.start();
}

main();
