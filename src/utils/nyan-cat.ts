import readline from "node:readline";
import chalk from "chalk";

export interface Animation {
  start: () => void;
  stop: (success: boolean, message: string) => void;
  updateMessage: (message: string) => void;
}

export function createNyanCatAnimation(initialMessage: string): Animation {
  let isRunning = false;
  let frameIndex = 0;
  let intervalId: NodeJS.Timeout | null = null;
  let message = initialMessage;

  function clearLines(count: number): void {
    for (let i = 0; i < count; i++) {
      readline.moveCursor(process.stdout, 0, -1);
      readline.clearLine(process.stdout, 0);
    }
  }

  const RAINBOW_COLORS = [
    chalk.red,
    chalk.yellow,
    chalk.green,
    chalk.blue,
    chalk.magenta,
    chalk.cyan,
  ];

  function getRainbowTail(length: number, offset: number): string {
    let tail = "";
    const pattern = "-_";
    for (let i = 0; i < length; i++) {
      const char = pattern[(i + offset) % pattern.length];
      const color = RAINBOW_COLORS[i % RAINBOW_COLORS.length];
      tail += color(char);
    }
    return tail;
  }

  function render(): void {
    const frame = frameIndex % 4;

    // 星星背景
    const starsTop = [
      "   +      o     +              o   ",
      "       +             o     +       ",
      "   o          +                    ",
      "       o  +           +        +   ",
    ];

    const starsBottom = [
      "       o  +           +        +   ",
      "   o          +                    ",
      "       +             o     +       ",
      "   +      o     +              o   ",
    ];

    // 猫
    const cat = [
      "_,------,   ",
      "|   /\\_/\\   ",
      "~|__( ^ .^)  ",
      frame % 2 === 0 ? ' ""  ""      ' : '  ""  ""     ',
    ];

    const displayLines: string[] = [];
    const tailLength = 12;

    // Line 1: Stars
    displayLines.push(starsTop[frame]);

    // Line 2: Tail + Cat Top
    displayLines.push(" " + getRainbowTail(tailLength, frame) + cat[0]);

    // Line 3: Tail + Cat Face
    displayLines.push(" " + getRainbowTail(tailLength, frame + 1) + cat[1]);

    // Line 4: Tail + Cat Body
    displayLines.push(" " + getRainbowTail(tailLength, frame) + cat[2]);

    // Line 5: Tail + Cat Legs
    displayLines.push(" " + getRainbowTail(tailLength, frame + 1) + cat[3]);

    // Line 6: Stars
    displayLines.push(starsBottom[frame]);

    displayLines.push("");
    displayLines.push(`  🌈 ${message}`);

    if (frameIndex > 0) {
      clearLines(displayLines.length);
    }

    for (const line of displayLines) {
      console.log(line);
    }

    frameIndex++;
  }

  return {
    start(): void {
      if (isRunning) return;
      isRunning = true;
      process.stdout.write("\x1B[?25l"); // Hide cursor

      // Initial render space
      const initialLines = 8; // 6 lines of art + 1 empty + 1 message
      console.log("\n".repeat(initialLines));
      clearLines(initialLines);

      intervalId = setInterval(render, 100);
    },

    stop(success: boolean, finalMessage: string): void {
      if (!isRunning) return;
      isRunning = false;

      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }

      const totalLines = 8;
      clearLines(totalLines);

      process.stdout.write("\x1B[?25h"); // Show cursor

      const icon = success ? "✔" : "✖";
      const color = success ? chalk.green : chalk.red;
      console.log(`${color(icon)} ${finalMessage}`);
    },

    updateMessage(newMessage: string): void {
      message = newMessage;
    },
  };
}
