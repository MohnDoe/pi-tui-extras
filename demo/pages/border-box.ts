import { Text } from "@mariozechner/pi-tui";
import chalk from "chalk";
import {
  BorderBox,
  type BorderStyle,
  type Padding,
  type TextAlign,
} from "../../src/components/border-box";
import type { ControlAction, DemoPage } from "../harness/types";

// ─── Theme presets ──────────────────────────────────────────

interface Theme {
  name: string;
  borderFn?: (s: string) => string;
  innerFn?: (s: string) => string;
  outerFn?: (s: string) => string;
}

const THEMES: Theme[] = [
  { name: "none" },
  { name: "blue border", borderFn: chalk.blue },
  { name: "red border", borderFn: chalk.red },
  {
    name: "blue + black inner + dark outer",
    borderFn: chalk.blue,
    innerFn: chalk.bgBlack,
    outerFn: chalk.bgBlackBright,
  },
  { name: "green border + gray inner", borderFn: chalk.green, innerFn: chalk.bgGray },
  {
    name: "yellow + magenta inner + cyan outer",
    borderFn: chalk.yellow,
    innerFn: chalk.bgMagenta,
    outerFn: chalk.bgCyan,
  },
  { name: "cyan border", borderFn: chalk.cyan },
];

// ─── Title/Footer presets ───────────────────────────────────

type LinePreset = "none" | "left" | "right" | "center" | "left+right";

interface LineConfig {
  preset: LinePreset;
  textL?: string;
  textR?: string;
}

// ─── Child text presets ─────────────────────────────────────

interface ChildPreset {
  label: string;
  text: string;
}

const CHILD_PRESETS: ChildPreset[] = [
  { label: "A simple greeting", text: "Hello from BorderBox!" },
  { label: "A short text", text: "Hi" },
  {
    label: "A long line",
    text: "This is a long line that wraps across the full terminal width and then some more.",
  },
  { label: "Multi-child (3)", text: "multi" }, // handled specially
  { label: "A styled child", text: chalk.green("Green text!") },
];

// ─── State ──────────────────────────────────────────────────

interface BorderBoxPageState {
  borderStyle: BorderStyle;
  themeIndex: number;
  padding: Required<Padding>;
  titleConfig: LineConfig;
  footerConfig: LineConfig;
  childPreset: number;
  multiCount: number;
}

function defaultState(): BorderBoxPageState {
  return {
    borderStyle: "singleRounded",
    themeIndex: 0,
    padding: { left: 0, right: 0, top: 0, bottom: 0 },
    titleConfig: { preset: "none" },
    footerConfig: { preset: "none" },
    childPreset: 0,
    multiCount: 3,
  };
}

// ─── Helpers ────────────────────────────────────────────────

function presetToDefs(
  config: LineConfig,
  isFooter: boolean,
): Array<{ text: string; align: TextAlign }> | undefined {
  const baseText = isFooter ? "Footer" : "Title";
  switch (config.preset) {
    case "none":
      return undefined;
    case "left":
      return [{ text: config.textL ?? baseText, align: "left" }];
    case "right":
      return [{ text: config.textL ?? baseText, align: "right" }];
    case "center":
      return [{ text: config.textL ?? baseText, align: "center" }];
    case "left+right":
      return [
        { text: config.textL ?? `L-${baseText}`, align: "left" },
        { text: config.textR ?? `R-${baseText}`, align: "right" },
      ];
  }
}

const STYLES: BorderStyle[] = ["single", "singleRounded", "double", "heavy"];
const PRESET_ORDER: LinePreset[] = ["none", "left", "right", "center", "left+right"];

function cyclePreset(current: LinePreset): LinePreset {
  const idx = PRESET_ORDER.indexOf(current);
  return PRESET_ORDER[(idx + 1) % PRESET_ORDER.length];
}

// ─── Page implementation ────────────────────────────────────

export class BorderBoxPage implements DemoPage {
  name = "BorderBox";
  tabHotkey = "1";

  private state: BorderBoxPageState;
  private liveBox: BorderBox;

  constructor() {
    this.state = defaultState();
    this.liveBox = this.buildBox();
  }

  private buildBox(): BorderBox {
    const s = this.state;
    const theme = THEMES[s.themeIndex] ?? THEMES[0]!;
    const titles = presetToDefs(s.titleConfig, false);
    const footers = presetToDefs(s.footerConfig, true);

    const box = new BorderBox({
      borderStyle: s.borderStyle,
      borderFn: theme.borderFn,
      innerFn: theme.innerFn,
      outerFn: theme.outerFn,
      titles,
      footers,
      padding: { ...s.padding },
    });

    const preset = CHILD_PRESETS[s.childPreset]!;
    if (preset.label.startsWith("Multi-child")) {
      for (let i = 0; i < s.multiCount; i++) {
        box.addChild(new Text(`Child ${i + 1}`, 1, 0));
      }
    } else {
      box.addChild(new Text(preset.text, 0, 0));
    }

    return box;
  }

  private rebuild(): void {
    this.liveBox = this.buildBox();
    this.liveBox.invalidate();
  }

  render(width: number): string[] {
    return this.liveBox.render(width);
  }

  invalidate(): void {
    this.liveBox.invalidate();
  }

  getStateReadout(): string[] {
    const s = this.state;
    const theme = THEMES[s.themeIndex]!;
    const preset = CHILD_PRESETS[s.childPreset]!;
    return [
      `borderStyle: ${s.borderStyle} / theme: ${theme.name} / children: ${preset.label}`,
      `pad: L${s.padding.left} R${s.padding.right} T${s.padding.top} B${s.padding.bottom}` +
        ` / title: ${s.titleConfig.preset} / footer: ${s.footerConfig.preset}`,
    ];
  }

  // ─── Hotkey handling ──────────────────────────────────────

  handleHotkey(key: string): boolean {
    switch (key) {
      // Style / theme / titles / footer
      case "s": {
        const idx = STYLES.indexOf(this.state.borderStyle);
        this.state.borderStyle = STYLES[(idx + 1) % STYLES.length]!;
        this.rebuild();
        return true;
      }
      case "t": {
        this.state.themeIndex = (this.state.themeIndex + 1) % THEMES.length;
        this.rebuild();
        return true;
      }
      case "i": {
        this.state.titleConfig.preset = cyclePreset(this.state.titleConfig.preset);
        this.rebuild();
        return true;
      }
      case "f": {
        this.state.footerConfig.preset = cyclePreset(this.state.footerConfig.preset);
        this.rebuild();
        return true;
      }

      // Padding: lower = +1, UPPER = -1
      case "h":
        this.state.padding.left = Math.min(10, this.state.padding.left + 1);
        this.rebuild();
        return true;
      case "H":
        this.state.padding.left = Math.max(0, this.state.padding.left - 1);
        this.rebuild();
        return true;
      case "l":
        this.state.padding.right = Math.min(10, this.state.padding.right + 1);
        this.rebuild();
        return true;
      case "L":
        this.state.padding.right = Math.max(0, this.state.padding.right - 1);
        this.rebuild();
        return true;
      case "k":
        this.state.padding.top = Math.min(5, this.state.padding.top + 1);
        this.rebuild();
        return true;
      case "K":
        this.state.padding.top = Math.max(0, this.state.padding.top - 1);
        this.rebuild();
        return true;
      case "j":
        this.state.padding.bottom = Math.min(5, this.state.padding.bottom + 1);
        this.rebuild();
        return true;
      case "J":
        this.state.padding.bottom = Math.max(0, this.state.padding.bottom - 1);
        this.rebuild();
        return true;

      // Children
      case "c": {
        this.state.childPreset = (this.state.childPreset + 1) % CHILD_PRESETS.length;
        this.rebuild();
        return true;
      }
      default:
        return false;
    }
  }

  // ─── Actions for SelectList ───────────────────────────────

  getActions(): ControlAction[] {
    return [
      {
        id: "cycle-style",
        label: "Cycle Border Style [s]",
        hotkey: "s",
        execute: () => this.handleHotkey("s"),
      },
      {
        id: "cycle-theme",
        label: "Cycle Theme [t]",
        hotkey: "t",
        execute: () => this.handleHotkey("t"),
      },
      {
        id: "cycle-title",
        label: "Cycle Title(s) Position(s) [i]",
        hotkey: "i",
        execute: () => this.handleHotkey("i"),
      },
      {
        id: "cycle-footer",
        label: "Cycle Footer(s) Position(s) [f]",
        hotkey: "f",
        execute: () => this.handleHotkey("f"),
      },
      {
        id: "cycle-child",
        label: "Cycle Children [c]",
        hotkey: "c",
        execute: () => this.handleHotkey("c"),
      },
      {
        id: "pad-left-inc",
        label: "Pad L+ [h]",
        hotkey: "h",
        execute: () => this.handleHotkey("h"),
      },
      {
        id: "pad-left-dec",
        label: "Pad L- [H]",
        hotkey: "H",
        execute: () => this.handleHotkey("H"),
      },
      {
        id: "pad-right-inc",
        label: "Pad R+ [l]",
        hotkey: "l",
        execute: () => this.handleHotkey("l"),
      },
      {
        id: "pad-right-dec",
        label: "Pad R- [L]",
        hotkey: "L",
        execute: () => this.handleHotkey("L"),
      },
      {
        id: "pad-top-inc",
        label: "Pad T+ [k]",
        hotkey: "k",
        execute: () => this.handleHotkey("k"),
      },
      {
        id: "pad-top-dec",
        label: "Pad T- [K]",
        hotkey: "K",
        execute: () => this.handleHotkey("K"),
      },
      {
        id: "pad-bottom-inc",
        label: "Pad B+ [j]",
        hotkey: "j",
        execute: () => this.handleHotkey("j"),
      },
      {
        id: "pad-bottom-dec",
        label: "Pad B- [J]",
        hotkey: "J",
        execute: () => this.handleHotkey("J"),
      },
    ];
  }
}
