import type { PositionRecord } from "./types.js";

export const EXPECTED_HEADER =
  "idMonitorado;faccaoMonitorado;timestamp;latitude;longitude;medidaProtetiva;idsRestricaoMedida";

/**
 * Splits a semicolon separated CSV line. Surrounding double quotes are removed
 * and doubled quotes inside a quoted field are unescaped.
 */
export function splitCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ";" && !inQuotes) {
      fields.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  fields.push(current);
  return fields;
}

export function isHeader(line: string): boolean {
  return splitCsvLine(line)
    .map((field) => field.trim())
    .join(";") === EXPECTED_HEADER;
}

/**
 * Parses one data line. Latitude/longitude are kept as parsed doubles so the
 * output mirrors the numeric value of the input (trailing zeros are dropped by
 * JSON serialization, as in the reference outputs).
 */
export function parsePositionRecord(line: string): PositionRecord {
  const fields = splitCsvLine(line);

  if (fields.length < 7) {
    throw new Error(`Malformed CSV line with ${fields.length} fields: ${line.slice(0, 120)}`);
  }

  const id = Number(fields[0]);
  const faccaoRaw = (fields[1] ?? "").trim();
  const lat = Number(fields[3]);
  const lon = Number(fields[4]);
  const restricaoRaw = (fields[6] ?? "").trim();

  if (!Number.isInteger(id)) {
    throw new Error(`Invalid idMonitorado: ${fields[0] ?? ""}`);
  }
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    throw new Error(`Invalid coordinates for id ${id}: ${fields[3] ?? ""}, ${fields[4] ?? ""}`);
  }

  const idsRestricaoMedida = restricaoRaw.length === 0
    ? []
    : restricaoRaw
        .split(",")
        .map((value) => value.trim())
        .filter((value) => value.length > 0)
        .map((value) => {
          const parsed = Number(value);
          if (!Number.isInteger(parsed)) {
            throw new Error(`Invalid restriction id "${value}" for id ${id}`);
          }
          return parsed;
        });

  return {
    id,
    faccao: faccaoRaw.length === 0 ? null : faccaoRaw,
    timestamp: (fields[2] ?? "").trim(),
    lat,
    lon,
    medidaProtetiva: (fields[5] ?? "").trim() === "true",
    idsRestricaoMedida,
  };
}
