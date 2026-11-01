export type EncounterType = "generico" | "faccao" | "protetiva";

export interface Position {
  lat: number;
  lon: number;
}

export interface Encounter {
  tipo: EncounterType;
  monitoradosEncontro: [number, number];
  timestamp: string;
  posicoes: Record<string, Position>;
  distanciaMetros: number;
}

export interface PositionRecord {
  id: number;
  /** null when the monitored person has no faction (empty CSV field). */
  faccao: string | null;
  timestamp: string;
  lat: number;
  lon: number;
  medidaProtetiva: boolean;
  idsRestricaoMedida: number[];
}

export interface EncounterStats {
  total: number;
  byType: Record<EncounterType, number>;
}

export interface SolveResult {
  elapsedMs: number;
  stats: EncounterStats;
  outputPath: string;
}
