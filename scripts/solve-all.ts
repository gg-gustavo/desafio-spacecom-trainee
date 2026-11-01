import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { formatTypeBreakdown, solveFile } from "../src/solve.js";

const DEFAULT_DATA_DIR = "/home/gustavo/Downloads/Desafio/Dataset";
const DATASET_COUNT = 7;

async function main(): Promise<void> {
  const dataDir = resolve(process.env.DATA_DIR ?? DEFAULT_DATA_DIR);
  const outDir = resolve(process.env.OUT_DIR ?? "outputs");

  console.log(`data dir: ${dataDir}`);
  console.log(`output dir: ${outDir}`);

  let totalEncounters = 0;
  let totalMs = 0;
  let processed = 0;

  for (let index = 1; index <= DATASET_COUNT; index += 1) {
    const inputPath = resolve(dataDir, `dataset${index}.txt`);
    const outputPath = resolve(outDir, `output${index}.json`);

    if (!existsSync(inputPath)) {
      console.log(`dataset${index}: arquivo nao encontrado (${inputPath}), ignorado`);
      continue;
    }

    const result = await solveFile(inputPath, outputPath);
    processed += 1;
    totalMs += result.elapsedMs;
    totalEncounters += result.stats.total;

    const ms = Math.round(result.elapsedMs);
    console.log(
      `dataset${index}: ${ms} ms, ${result.stats.total} encontros (${formatTypeBreakdown(result.stats)})`,
    );
  }

  console.log(
    `total: ${processed} datasets, ${totalEncounters} encontros, ${Math.round(totalMs)} ms`,
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Erro: ${message}`);
  process.exitCode = 1;
});
