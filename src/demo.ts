import { Container, ProcessTerminal, Text, TUI } from "@mariozechner/pi-tui";
import { BorderBox } from "./components/border-box";

function main() {
  const terminal = new ProcessTerminal();
  const tui = new TUI(terminal);

  const root = new Container();

  // Single border with title
  root.addChild(
    new BorderBox(new Text("Hello from BorderBox!", 1, 0), {
      titles: [{ text: "Demo", align: "left" }],
    }),
  );

  // Blank line between boxes
  root.addChild(new Text("", 0, 0));

  // Rounded border with left+right titles
  root.addChild(
    new BorderBox(new Text("Rounded corners", 1, 0), {
      borderStyle: "singleRounded",
      titles: [
        { text: "Left", align: "left" },
        { text: "Right", align: "right" },
      ],
      footers: [{ text: "Footer", align: "center" }],
    }),
  );

  tui.addChild(root);

  tui.addInputListener((data) => {
    if (data === "q" || data === "\x1b") {
      tui.stop();
      process.exit(0);
    }
    return { consume: true };
  });

  tui.start();
}

main();
