import { haversineMeters, EARTH_RADIUS_METERS } from "./haversine.js";
import type { Encounter, EncounterType, PositionRecord } from "./types.js";

/** Strictly below this distance a pair is considered a meeting. */
export const MEETING_THRESHOLD_METERS = 20;

/**
 * Spatial bucket size. It must be >= the distance threshold so that, after the
 * longitude correction below, checking the 8 neighbouring cells is enough.
 */
const CELL_SIZE_METERS = 25;

const DEG_TO_RAD = Math.PI / 180;
const GRID_OFFSET = 2_000_000;
const GRID_MULTIPLIER = 8_000_000;

function gridKey(latCell: number, lonCell: number): number {
  return (latCell + GRID_OFFSET) * GRID_MULTIPLIER + (lonCell + GRID_OFFSET);
}

/**
 * Groups records by exact timestamp and emits the meetings of each window.
 *
 * Input is expected to be ordered by timestamp (the official datasets are).
 * The caller pushes records one by one; when the timestamp changes the previous
 * window is evaluated and returned, keeping memory proportional to a single
 * timestamp window instead of the whole file.
 */
export class EncounterDetector {
  private currentTimestamp: string | null = null;
  private window: PositionRecord[] = [];
  private seenPairs = new Set<string>();

  add(record: PositionRecord): Encounter[] {
    if (this.currentTimestamp === null) {
      this.currentTimestamp = record.timestamp;
      this.window.push(record);
      return [];
    }

    if (record.timestamp !== this.currentTimestamp) {
      const encounters = this.flush();
      this.currentTimestamp = record.timestamp;
      this.window.push(record);
      return encounters;
    }

    this.window.push(record);
    return [];
  }

  finish(): Encounter[] {
    return this.flush();
  }

  private flush(): Encounter[] {
    if (this.window.length < 2) {
      this.window = [];
      this.seenPairs.clear();
      return [];
    }

    const window = this.window;
    const timestamp = this.currentTimestamp ?? "";

    let maxAbsLat = 0;
    for (const record of window) {
      const absLat = Math.abs(record.lat);
      if (absLat > maxAbsLat) maxAbsLat = absLat;
    }

    // Longitude cells are scaled by cos(maxAbsLat) so their physical width is
    // always >= CELL_SIZE_METERS, which keeps the 3x3 neighbourhood sufficient.
    const lonScale = Math.cos(maxAbsLat * DEG_TO_RAD);

    const buckets = new Map<number, PositionRecord[]>();
    const encounters: Encounter[] = [];
    const seen = this.seenPairs;
    seen.clear();

    for (const record of window) {
      const latCell = Math.floor((record.lat * DEG_TO_RAD * EARTH_RADIUS_METERS) / CELL_SIZE_METERS);
      const lonCell = Math.floor(
        (record.lon * DEG_TO_RAD * EARTH_RADIUS_METERS * lonScale) / CELL_SIZE_METERS,
      );

      for (let dLat = -1; dLat <= 1; dLat += 1) {
        for (let dLon = -1; dLon <= 1; dLon += 1) {
          const bucket = buckets.get(gridKey(latCell + dLat, lonCell + dLon));
          if (bucket === undefined) continue;

          for (const other of bucket) {
            if (other.id === record.id) continue;

            const distance = haversineMeters(other, record);
            if (distance >= MEETING_THRESHOLD_METERS) continue;

            const first = other.id < record.id ? other : record;
            const second = other.id < record.id ? record : other;
            const pairKey = `${first.id}:${second.id}`;
            if (seen.has(pairKey)) continue;
            seen.add(pairKey);

            encounters.push(
              buildEncounter(first, second, timestamp, distance),
            );
          }
        }
      }

      const ownKey = gridKey(latCell, lonCell);
      const bucket = buckets.get(ownKey);
      if (bucket === undefined) {
        buckets.set(ownKey, [record]);
      } else {
        bucket.push(record);
      }
    }

    this.window = [];
    this.seenPairs.clear();

    encounters.sort((a, b) => {
      const a0 = a.monitoradosEncontro[0];
      const b0 = b.monitoradosEncontro[0];
      if (a0 !== b0) return a0 - b0;
      return a.monitoradosEncontro[1] - b.monitoradosEncontro[1];
    });

    return encounters;
  }
}

function buildEncounter(
  first: PositionRecord,
  second: PositionRecord,
  timestamp: string,
  distance: number,
): Encounter {
  return {
    tipo: classifyMeeting(first, second),
    monitoradosEncontro: [first.id, second.id],
    timestamp,
    posicoes: {
      [String(first.id)]: { lat: first.lat, lon: first.lon },
      [String(second.id)]: { lat: second.lat, lon: second.lon },
    },
    distanciaMetros: distance,
  };
}

/**
 * A protective meeting requires one side to hold a protective measure and the
 * other side to be one of the aggressors listed by that measure. Faction
 * meetings take precedence over generic ones; protective meetings are the most
 * specific and take precedence over both.
 */
export function classifyMeeting(a: PositionRecord, b: PositionRecord): EncounterType {
  if (isProtectiveMeeting(a, b)) return "protetiva";
  if (a.faccao !== null && b.faccao !== null && a.faccao === b.faccao) return "faccao";
  return "generico";
}

function isProtectiveMeeting(a: PositionRecord, b: PositionRecord): boolean {
  if (a.medidaProtetiva && a.idsRestricaoMedida.includes(b.id)) return true;
  if (b.medidaProtetiva && b.idsRestricaoMedida.includes(a.id)) return true;
  return false;
}
