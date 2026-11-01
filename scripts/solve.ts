import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { formatTypeBreakdown, solveFile } from "../src/solve.js";

interface CliOptions {
  input: string;
  output: string;
}

function parseArgs(argv: string[]): CliOptions {
  let input: string | undefined;
  let output: string | undefined;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === undefined) continue;
    if (arg === "--input" || arg === "-i") {
      input = argv[i + 1];
      i += 1;
    } else if (arg.startsWith("--input=")) {
      input = arg.slice("--input=".length);
    } else if (arg === "--output" || arg === "-o") {
      output = argv[i + 1];
      i += 1;
    } else if (arg.startsWith("--output=")) {
      output = arg.slice("--output=".length);
    }
  }

  if (input === undefined || input.length === 0) {
    throw new Error("Missing --input <file.txt>");
  }
  if (output === undefined || output.length === 0) {
    throw new Error("Missing --output <file.json>");
  }

  return { input, output };
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const inputPath = resolve(options.input);
  const outputPath = resolve(options.output);

  if (!existsSync(inputPath)) {
    throw new Error(`Input file not found: ${inputPath}`);
  }

  const result = await solveFile(inputPath, outputPath);
  const ms = Math.round(result.elapsedMs);
  console.log(
    `input: ${inputPath}\noutput: ${result.outputPath}\ntempo: ${ms} ms\nencontros: ${result.stats.total} (${formatTypeBreakdown(result.stats)})`,
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Erro: ${message}`);
  process.exitCode = 1;
});
