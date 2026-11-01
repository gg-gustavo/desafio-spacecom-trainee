import { createReadStream, mkdirSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { dirname } from "node:path";
import { isHeader, parsePositionRecord } from "./csv.js";
import { EncounterDetector } from "./detector.js";
import type { Encounter, EncounterStats, EncounterType, SolveResult } from "./types.js";

function emptyStats(): EncounterStats {
  return {
    total: 0,
    byType: { generico: 0, faccao: 0, protetiva: 0 },
  };
}

function register(stats: EncounterStats, encounters: Encounter[]): void {
  for (const encounter of encounters) {
    stats.total += 1;
    stats.byType[encounter.tipo] += 1;
  }
}

/**
 * Streams the input file line by line, detects meetings and writes the JSON
 * array to outputPath. Never loads the whole input into memory.
 */
export async function solveFile(inputPath: string, outputPath: string): Promise<SolveResult> {
  const startedAt = process.hrtime.bigint();

  const detector = new EncounterDetector();
  const encounters: Encounter[] = [];
  const stats = emptyStats();

  const stream = createReadStream(inputPath, { encoding: "utf8" });
  const lines = createInterface({ input: stream, crlfDelay: Infinity });

  let lineNumber = 0;
  let sawHeader = false;

  for await (const rawLine of lines) {
    lineNumber += 1;
    const line = rawLine.replace(/^\uFEFF/, "").replace(/\r$/, "");
    if (line.length === 0) continue;

    if (!sawHeader) {
      if (!isHeader(line)) {
        throw new Error(
          `Unexpected header in ${inputPath} at line ${lineNumber}: ${line.slice(0, 160)}`,
        );
      }
      sawHeader = true;
      continue;
    }

    const record = parsePositionRecord(line);
    const detected = detector.add(record);
    if (detected.length > 0) {
      register(stats, detected);
      for (const encounter of detected) encounters.push(encounter);
    }
  }

  if (!sawHeader) {
    throw new Error(`Input file is empty or missing header: ${inputPath}`);
  }

  const tail = detector.finish();
  if (tail.length > 0) {
    register(stats, tail);
    for (const encounter of tail) encounters.push(encounter);
  }

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, JSON.stringify(encounters, null, 2), "utf8");

  const elapsedMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;

  return { elapsedMs, stats, outputPath };
}

export function formatTypeBreakdown(stats: EncounterStats): string {
  const order: EncounterType[] = ["generico", "faccao", "protetiva"];
  return order.map((type) => `${type}: ${stats.byType[type]}`).join(", ");
}
