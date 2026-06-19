import { Container, ProcessTerminal, Text, TUI } from "@mariozechner/pi-tui";
import { BorderBox } from "./components/border-box";
import chalk from "chalk";

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
  root.addChild(
    new BorderBox(
      new Text("The text will wrap and the border box will grow in height to fit it.", 0, 0),
      {
        borderStyle: "heavy",
        titles: [{ text: "Wrap supreme", align: "left" }],
        padding: {
          left: 2,
        },
      },
    ),
  );

  // Blank line between boxes
  root.addChild(new Text("", 0, 0));

  // Rounded border with left+right titles
  root.addChild(
    new BorderBox(new Text("Rounded corners", 1, 0), {
      borderStyle: "singleRounded",
      borderColor: chalk.blue,
      titles: [
        { text: chalk.yellow("Left yellow"), align: "left" },
        { text: "Right", align: "right" },
      ],
      footers: [{ text: "Footer", align: "center" }],
    }),
  );

  root.addChild(
    new BorderBox(new Text("No title, no footer", 1, 0), {
      borderStyle: "double",
      borderColor: chalk.red,
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
