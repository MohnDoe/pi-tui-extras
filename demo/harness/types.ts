/**
 * A single action the user can trigger in the harness.
 * Each action has a hotkey for power users and is rendered as
 * a SelectList item for discoverability.
 */
export interface ControlAction {
  id: string;
  label: string;
  hotkey: string;
  /** Called when the action is triggered (via hotkey or SelectList). */
  execute(): void;
}

/**
 * One page/component in the demo harness.
 * Each page manages its own state, renders a preview, and exposes
 * control actions for the bottom panel.
 */
export interface DemoPage {
  /** Tab label shown in the top bar. */
  name: string;
  /** Optional single-char hotkey to jump to this page (e.g. "1", "2"). */
  tabHotkey?: string;
  /** Render the page's live preview at the given width. */
  render(width: number): string[];
  /** Invalidate any cached render state. */
  invalidate(): void;
  /** Get the list of available control actions. */
  getActions(): ControlAction[];
  /** Returns status lines shown in the bottom panel (multi-line state readout). */
  getStateReadout(): string[];
  /** Try to handle a raw keypress. Return true if consumed. */
  handleHotkey(key: string): boolean;
}
