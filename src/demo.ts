import { Container, ProcessTerminal, Text, TUI } from "@mariozechner/pi-tui";

function main() {
  const terminal = new ProcessTerminal();
  const tui = new TUI(terminal);

  const root = new Container();

  root.addChild(new Text("Demo terminal"));

  tui.addChild(root);

  tui.addInputListener((data) => {
    if (data === "q") {
      tui.stop();
      return process.exit(0);
    }
  });

  tui.start();
}

main();
