// Shared types for calculation results.

// Team structure distribution: how many emprendedores of each tier and their points.
export interface TeamStructure {
  cant: { bronce: number; plata: number; oro: number; platino: number };
  pts: { bronce: number; plata: number; oro: number; platino: number };
  totalPts: number;
  totalEmpr: number;
  upgradeSuggest?: boolean;
  requerido?: number;
}

// Full calculation result for any level.
export interface EarningsResult {
  objetivo: number;
  gananciaTotal: number;
  ventaPersonal: number;
  equipoDirecto: number;
  bonoConquista: number;
  bonoN1: number;
  bonoN2: number;
  puntosPersonal: number;
  puntosEquipo: number;
  estructura: TeamStructure | null;
  n1: number;
  n2: number;
  ptsN1?: number;
  ptsN2?: number;
  facturacionN1?: number;
  facturacionN2?: number;
  upgradeSuggest?: boolean;
  requeridoEquipo?: number | null;
  diffObjetivo?: number | null;
}

// Level recommendation result.
export interface LevelRecommendation {
  key: string;
  name: string;
  avg: number;
  isMax: boolean;
}
