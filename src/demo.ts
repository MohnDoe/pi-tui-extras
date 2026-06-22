import { Container, ProcessTerminal, Text, TUI } from "@mariozechner/pi-tui";
import { BorderBox } from "./components/border-box";
import chalk from "chalk";

function main() {
  const terminal = new ProcessTerminal();
  const tui = new TUI(terminal);

  const root = new Container();

  // Single border with title
  const box1 = new BorderBox({
    titles: [{ text: "Demo", align: "left" }],
  });
  box1.addChild(new Text("Hello from BorderBox!", 1, 0));
  root.addChild(box1);

  const box2 = new BorderBox({
    borderStyle: "heavy",
    titles: [{ text: "Wrap supreme", align: "left" }],
    padding: { left: 2 },
  });
  box2.addChild(
    new Text("The text will wrap and the border box will grow in height to fit it.", 0, 0),
  );
  root.addChild(box2);

  // Blank line between boxes
  root.addChild(new Text("", 0, 0));

  // Rounded border with left+right titles
  const box3 = new BorderBox({
    borderStyle: "singleRounded",
    borderFn: chalk.blue,
    titles: [
      { text: chalk.yellow("Left yellow"), align: "left" },
      { text: "Right", align: "right" },
    ],
    footers: [{ text: "Footer", align: "center" }],
  });
  box3.addChild(new Text("Rounded corners", 1, 0));
  root.addChild(box3);

  const box4 = new BorderBox({
    borderStyle: "double",
    borderFn: chalk.red,
    padding: {
      top: 0,
      bottom: 3,
      left: 7,
      right: 0,
    },
  });
  box4.addChild(new Text("No title, no footer, and asymetrical padding"));
  root.addChild(box4);

  const box5 = new BorderBox({
    borderStyle: "singleRounded",
    innerBgFn: chalk.white,
    titles: [{ text: "chalk.white innerBg", align: "left" }],
  });
  box5.addChild(new Text("Inner area background via innerBgFn", 1, 1));
  root.addChild(box5);

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
