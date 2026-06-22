/**
 * Custom watch script for the TUI demo.
 *
 * Why not `bun --watch`?
 * - bun --watch doesn't send catchable signals (github.com/oven-sh/bun/issues/25721)
 * - it doesn't debounce file events, hitting the atomic-save race
 *   (editor writes temp → deletes original → renames; bun fires on the delete gap)
 *
 * This script:
 * - spawns `bun run demo/demo.ts` as a child process
 * - watches src/ and demo/ for .ts file changes
 * - debounces file events (200ms) to avoid atomic-save races
 * - sends SIGINT to the child (our handler catches it → tui.stop() → clean terminal)
 * - waits for clean exit, then restarts
 */
import { spawn, type ChildProcess } from "node:child_process";
import { readdirSync, statSync, watch } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const WATCH_DIRS = ["src", "demo"];
const DEBOUNCE_MS = 200;

let child: ChildProcess | null = null;
let restartTimer: ReturnType<typeof setTimeout> | null = null;
let restartQueued = false;

function startChild() {
  // Clear screen before spawning so new TUI starts on a clean slate
  process.stdout.write("\x1b[2J\x1b[H");

  child = spawn("bun", ["run", "demo/demo.ts"], {
    cwd: ROOT,
    stdio: "inherit",
    env: { ...process.env },
  });

  child.on("exit", (code, signal) => {
    child = null;
    if (restartQueued) {
      restartQueued = false;
      scheduleRestart();
    } else {
      // Child exited on its own (Ctrl+C, q, or crash) — shut down watcher too
      closeWatchers();
      process.exit(code ?? 0);
    }
  });
}

function scheduleRestart() {
  if (restartTimer) clearTimeout(restartTimer);
  restartTimer = setTimeout(() => {
    restartTimer = null;
    startChild();
  }, DEBOUNCE_MS);
}

function queueRestart() {
  // If child is running, kill it with SIGINT → our handler catches it → clean shutdown
  if (child) {
    restartQueued = true;
    child.kill("SIGINT");
    return;
  }

  // Child already dead (e.g. first run) — restart after debounce
  scheduleRestart();
}

// Collect all subdirectories (recursive: true on fs.watch is macOS-only)
function collectDirs(dir: string): string[] {
  const dirs: string[] = [dir];
  try {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory() && !entry.startsWith(".")) {
        dirs.push(...collectDirs(full));
      }
    }
  } catch { /* ignore read errors */ }
  return dirs;
}

const watchers: ReturnType<typeof watch>[] = [];
for (const dirName of WATCH_DIRS) {
  const dir = join(ROOT, dirName);
  for (const sub of collectDirs(dir)) {
    watchers.push(watch(sub, (event, filename) => {
      if (!filename || !filename.endsWith(".ts")) return;
      queueRestart();
    }));
  }
}

// Cleanup on script exit
function closeWatchers() {
  for (const w of watchers) w.close();
}

process.on("SIGINT", () => {
  closeWatchers();
  if (child) child.kill("SIGINT");
  process.exit(0);
});
process.on("SIGTERM", () => {
  closeWatchers();
  if (child) child.kill("SIGINT");
  process.exit(0);
});

startChild();
