import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Encounter, Position } from "../src/types.js";

const DEFAULT_GABARITO_DIR = "/home/gustavo/Downloads/Desafio/Outros";
const COORDINATE_TOLERANCE = 1e-9;
const DISTANCE_TOLERANCE = 1e-9;

type DatasetId = 1 | 2;

interface Diff {
  key: string;
  reason: string;
}

function loadJson(path: string): Encounter[] {
  const parsed: unknown = JSON.parse(readFileSync(path, "utf8"));
  if (!Array.isArray(parsed)) {
    throw new Error(`Expected a JSON array in ${path}`);
  }
  return parsed as Encounter[];
}

function encounterKey(encounter: Encounter): string {
  const ids = [...encounter.monitoradosEncontro].sort((a, b) => a - b);
  return `${encounter.timestamp}|${ids.join(",")}`;
}

function near(a: number, b: number, tolerance: number): boolean {
  return a === b || Math.abs(a - b) < tolerance;
}

function comparePositions(
  key: string,
  actual: Record<string, Position> | undefined,
  expected: Record<string, Position> | undefined,
): Diff[] {
  const diffs: Diff[] = [];
  const actualIds = Object.keys(actual ?? {}).sort();
  const expectedIds = Object.keys(expected ?? {}).sort();

  if (actualIds.join(",") !== expectedIds.join(",")) {
    diffs.push({
      key,
      reason: `posicoes keys actual=[${actualIds.join(",")}] expected=[${expectedIds.join(",")}]`,
    });
    return diffs;
  }

  for (const id of expectedIds) {
    const actualPosition = actual?.[id];
    const expectedPosition = expected?.[id];
    if (actualPosition === undefined || expectedPosition === undefined) {
      diffs.push({ key, reason: `posicao ausente para id ${id}` });
      continue;
    }
    if (
      !near(actualPosition.lat, expectedPosition.lat, COORDINATE_TOLERANCE) ||
      !near(actualPosition.lon, expectedPosition.lon, COORDINATE_TOLERANCE)
    ) {
      diffs.push({
        key,
        reason: `posicao divergente id ${id}: actual=(${actualPosition.lat}, ${actualPosition.lon}) expected=(${expectedPosition.lat}, ${expectedPosition.lon})`,
      });
    }
  }

  return diffs;
}

function compareDatasets(actual: Encounter[], expected: Encounter[]): Diff[] {
  const diffs: Diff[] = [];
  const actualMap = new Map<string, Encounter>();
  const expectedMap = new Map<string, Encounter>();

  for (const encounter of actual) {
    const key = encounterKey(encounter);
    if (actualMap.has(key)) diffs.push({ key, reason: "registro duplicado no output" });
    actualMap.set(key, encounter);
  }
  for (const encounter of expected) {
    const key = encounterKey(encounter);
    if (expectedMap.has(key)) diffs.push({ key, reason: "registro duplicado no gabarito" });
    expectedMap.set(key, encounter);
  }

  for (const [key, expectedEncounter] of expectedMap) {
    const actualEncounter = actualMap.get(key);
    if (actualEncounter === undefined) {
      diffs.push({ key, reason: "encontro esperado ausente no output" });
      continue;
    }
    if (actualEncounter.tipo !== expectedEncounter.tipo) {
      diffs.push({
        key,
        reason: `tipo divergente: actual=${actualEncounter.tipo} expected=${expectedEncounter.tipo}`,
      });
    }
    if (
      !near(
        actualEncounter.distanciaMetros,
        expectedEncounter.distanciaMetros,
        DISTANCE_TOLERANCE,
      )
    ) {
      diffs.push({
        key,
        reason: `distancia divergente: actual=${actualEncounter.distanciaMetros} expected=${expectedEncounter.distanciaMetros}`,
      });
    }
    diffs.push(
      ...comparePositions(key, actualEncounter.posicoes, expectedEncounter.posicoes),
    );
  }

  for (const key of actualMap.keys()) {
    if (!expectedMap.has(key)) {
      diffs.push({ key, reason: "encontro extra no output (falso positivo)" });
    }
  }

  return diffs;
}

function parseDatasets(argv: string[]): DatasetId[] {
  const requested: DatasetId[] = [];
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === undefined) continue;
    if (arg === "--dataset" || arg === "-d") {
      const value = Number(argv[i + 1]);
      i += 1;
      if (value === 1 || value === 2) requested.push(value);
      else throw new Error(`Unsupported dataset for validation: ${argv[i] ?? ""}`);
    } else if (arg.startsWith("--dataset=")) {
      const value = Number(arg.slice("--dataset=".length));
      if (value === 1 || value === 2) requested.push(value);
      else throw new Error(`Unsupported dataset for validation: ${value}`);
    }
  }
  return requested.length > 0 ? requested : [1, 2];
}

function main(): void {
  const gabaritoDir = resolve(process.env.GABARITO_DIR ?? DEFAULT_GABARITO_DIR);
  const outDir = resolve(process.env.OUT_DIR ?? "outputs");
  const datasets = parseDatasets(process.argv.slice(2));

  let failed = false;

  for (const dataset of datasets) {
    const actualPath = resolve(outDir, `output${dataset}.json`);
    const expectedPath = resolve(gabaritoDir, `respostas${dataset}.json`);

    if (!existsSync(actualPath)) {
      console.log(`dataset${dataset}: FALHOU (output ausente: ${actualPath})`);
      failed = true;
      continue;
    }
    if (!existsSync(expectedPath)) {
      console.log(`dataset${dataset}: FALHOU (gabarito ausente: ${expectedPath})`);
      failed = true;
      continue;
    }

    const actual = loadJson(actualPath);
    const expected = loadJson(expectedPath);
    const diffs = compareDatasets(actual, expected);

    if (diffs.length === 0) {
      console.log(
        `dataset${dataset}: OK (${actual.length} encontros, igualdade exata com o gabarito)`,
      );
    } else {
      failed = true;
      console.log(`dataset${dataset}: FALHOU (${diffs.length} divergencias)`);
      for (const diff of diffs.slice(0, 50)) {
        console.log(`  ${diff.key}: ${diff.reason}`);
      }
      if (diffs.length > 50) {
        console.log(`  ... e mais ${diffs.length - 50} divergencias`);
      }
    }
  }

  if (failed) process.exitCode = 1;
}

main();
