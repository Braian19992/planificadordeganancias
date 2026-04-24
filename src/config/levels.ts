// Centralized level configuration for the Bagues business model simulator.
// To update a bonus, margin, or display name, edit ONLY this file.

export const DEFAULT_PUNTO_PRICE = 12000;

// Minimum points per emprendedor tier (used for team distribution)
export const POINTS_PER_EMPRENDEDOR: Record<string, number> = {
  bronce: 5,
  plata: 12,
  oro: 25,
  platino: 50,
};

// Minimum total points required per level (business rule floor).
// The punto price can change the monetary value, but never reduce points below this.
export const MIN_TOTAL_POINTS: Record<string, number> = {
  empr_bronce: 5,
  empr_plata: 12,
  empr_oro: 25,
  empr_platino: 50,
  emp_bronce: 100,
  emp_plata: 150,
  emp_oro: 300,
  ment_plata: 450,
  ment_oro: 450,
  ment_platino: 450,
  ment_diamante: 450,
  emb_oro: 450,
  emb_platino: 450,
  emb_diamante: 450,
};

// Hard-floor minimum N1/N2 empresario counts per level.
// The buscado may never produce fewer than these.
export const MIN_N1_N2_COUNTS: Record<string, { n1: number; n2: number }> = {
  ment_plata:    { n1: 1,  n2: 0   },
  ment_oro:      { n1: 4,  n2: 0   },
  ment_platino:  { n1: 7,  n2: 0   },
  ment_diamante: { n1: 10, n2: 0   },
  emb_oro:       { n1: 10, n2: 40  },
  emb_platino:   { n1: 10, n2: 70  },
  emb_diamante:  { n1: 10, n2: 100 },
};

// Hard-floor minimum emprendedores directos for mentor/emblema tiers.
export const MIN_EMPRENDEDORES: Record<string, number> = {
  ment_plata:    30,
  ment_oro:      30,
  ment_platino:  30,
  ment_diamante: 30,
  emb_oro:       30,
  emb_platino:   30,
  emb_diamante:  30,
};

// ---------- Level tier type ----------
export type LevelTier = 'emprendedor' | 'empresario' | 'mentor' | 'emblema';

// ---------- Emprendedor display names (not in nivelesConfig) ----------
export const EMPRENDEDOR_NAMES: Record<string, string> = {
  empr_bronce: 'Emprendedor Bronce',
  empr_plata: 'Emprendedor Plata',
  empr_oro: 'Emprendedor Oro',
  empr_platino: 'Emprendedor Platino',
};

// ---------- Level subtitle shown below the level title ----------
export const LEVEL_SUBTITLES: Record<string, string> = {
  empr_bronce: 'Tu primer paso en el mundo del emprendimiento',
  empr_plata: 'Expandi tu circulo y aumenta tus ventas',
  empr_oro: 'Lleva tus metas a otro nivel',
  empr_platino: 'Tu primer equipo empieza a tomar forma',

  emp_bronce: 'Tu primera estructura de negocio',
  emp_plata: 'Crece con mas emprendedores en tu equipo',
  emp_oro: 'Consolida tu negocio para el proximo nivel',

  ment_plata: 'El primer paso para ser mentor',
  ment_oro: 'Multiplica el impacto de tu liderazgo',
  ment_platino: 'Tu equipo crece y tu red se fortalece',
  ment_diamante: 'Lideras un equipo consolidado de empresarios',

  emb_oro: 'Expandi tu red de empresarios mentores',
  emb_platino: 'Alcanza una expansion sin precedentes',
  emb_diamante: 'Tu liderazgo se convierte en legado',
};

// ---------- Level icon filenames ----------
export const LEVEL_ICONS: Record<string, string> = {
  empr_bronce: 'Emprendedor bronce.png',
  empr_plata: 'Emprendedorplata.png',
  empr_oro: 'Emprendedororo.png',
  empr_platino: 'Emprendedorplatino.png',

  emp_bronce: 'Empresariobronce.png',
  emp_plata: 'Empresarioplata.png',
  emp_oro: 'Empresariooro.png',

  ment_plata: 'mentorplata.png',
  ment_oro: 'mentororo.png',
  ment_platino: 'mentorplatino.png',
  ment_diamante: 'mentordiamante.png',

  emb_oro: 'emblemaoro.png',
  emb_platino: 'emblemaplatino.png',
  emb_diamante: 'emblemadiamante.png',
};

// ---------- Model average earnings per level ----------
// Used as the default "objective" when the user hasn't typed one.
export const MODEL_AVERAGE_EARNINGS: Record<string, number> = {
  empr_bronce: 20900,
  empr_plata: 63800,
  empr_oro: 137500,
  empr_platino: 242000,
  emp_bronce: 412000,
  emp_plata: 626000,
  emp_oro: 1090000,
  ment_plata: 1975000,
  ment_oro: 3244000,
  ment_platino: 4275000,
  ment_diamante: 8180000,
  emb_oro: 15900000,
  emb_platino: 20420000,
  emb_diamante: 25670000,
};

// ---------- Healthy earnings ceiling per level ----------
// Maximum earnings a level can realistically produce. If objective
// exceeds ceiling * 1.05, the level is discarded in auto-selection.
export const LEVEL_MAX_EARNINGS: Record<string, number> = {
  empr_bronce: 42000,
  empr_plata: 110000,
  empr_oro: 218000,
  empr_platino: 370000,
  emp_bronce: 520000,
  emp_plata: 860000,
  emp_oro: 1500000,
  ment_plata: 2600000,
  ment_oro: 3800000,
  ment_platino: 6200000,
  ment_diamante: 12000000,
  emb_oro: 18000000,
  emb_platino: 23000000,
  emb_diamante: Infinity,
};

// ---------- Performance indicators per level ----------
// puntos: total points the model expects at this level
// empr: total emprendedores in the team
// n1/ptsN1: N1 empresarios and their total points
// n2/ptsN2: N2 empresarios and their total points
export interface LevelIndicators {
  puntos: number;
  empr: number;
  n1: number;
  ptsN1: number;
  n2: number;
  ptsN2: number;
}

export const LEVEL_INDICATORS: Record<string, LevelIndicators> = {
  empr_bronce:   { puntos: 8,    empr: 0,   n1: 0,    ptsN1: 0,     n2: 0,   ptsN2: 0     },
  empr_plata:    { puntos: 17,   empr: 0,   n1: 0,    ptsN1: 0,     n2: 0,   ptsN2: 0     },
  empr_oro:      { puntos: 35,   empr: 1,   n1: 0,    ptsN1: 0,     n2: 0,   ptsN2: 0     },
  empr_platino:  { puntos: 70,   empr: 3,   n1: 0,    ptsN1: 0,     n2: 0,   ptsN2: 0     },

  emp_bronce:    { puntos: 125,  empr: 11,  n1: 0,    ptsN1: 0,     n2: 0,   ptsN2: 0     },
  emp_plata:     { puntos: 200,  empr: 18,  n1: 0.5,  ptsN1: 32,    n2: 0,   ptsN2: 0     },
  emp_oro:       { puntos: 380,  empr: 28,  n1: 1,    ptsN1: 68,    n2: 0,   ptsN2: 0     },

  ment_plata:    { puntos: 811,  empr: 46,  n1: 3,    ptsN1: 1200,  n2: 1,   ptsN2: 342   },
  ment_oro:      { puntos: 960,  empr: 56,  n1: 7,    ptsN1: 2800,  n2: 3,   ptsN2: 1028  },
  ment_platino:  { puntos: 1044, empr: 64,  n1: 9,    ptsN1: 3668,  n2: 7,   ptsN2: 2248  },
  ment_diamante: { puntos: 836,  empr: 79,  n1: 25,   ptsN1: 10235, n2: 10,  ptsN2: 3018  },

  emb_oro:       { puntos: 1003, empr: 86,  n1: 34,   ptsN1: 14586, n2: 50,  ptsN2: 15000 },
  emb_platino:   { puntos: 573,  empr: 127, n1: 18,   ptsN1: 11459, n2: 72,  ptsN2: 34061 },
  emb_diamante:  { puntos: 590,  empr: 150, n1: 22,   ptsN1: 14330, n2: 100, ptsN2: 40105 },
};

// ---------- Main level configuration ----------
// Only levels from Empresario Bronce upward have this config.
// Emprendedor levels use separate percentage tables.
export interface LevelConfig {
  nombre: string;
  tipo: LevelTier;
  bonoConquista: number;    // one-time achievement bonus
  personalFrac: number;     // fraction of total points allocated to personal sales
  minTotalPts: number;      // minimum total points expected
  mixEquipo: { bronce: number; plata: number; oro: number; platino: number }; // team mix weights
  b1Pct: number;            // bonus N1 percentage
  b2Pct: number;            // bonus N2 percentage
}

export const LEVEL_CONFIG: Record<string, LevelConfig> = {
  emp_bronce:    { nombre: 'Empresario Bronce',  tipo: 'empresario', bonoConquista: 45000,  personalFrac: 0.20, minTotalPts: 100, mixEquipo: { bronce: 20, plata: 24, oro: 25, platino: 50 },    b1Pct: 0,  b2Pct: 0   },
  emp_plata:     { nombre: 'Empresario Plata',   tipo: 'empresario', bonoConquista: 65000,  personalFrac: 0.18, minTotalPts: 150, mixEquipo: { bronce: 30, plata: 36, oro: 50, platino: 75 },    b1Pct: 2,  b2Pct: 0   },
  emp_oro:       { nombre: 'Empresario Oro',     tipo: 'empresario', bonoConquista: 100000, personalFrac: 0.15, minTotalPts: 300, mixEquipo: { bronce: 40, plata: 48, oro: 75, platino: 100 },   b1Pct: 4,  b2Pct: 0   },

  ment_plata:    { nombre: 'Mentor Plata',       tipo: 'mentor',     bonoConquista: 125000, personalFrac: 0.10, minTotalPts: 450, mixEquipo: { bronce: 60, plata: 72, oro: 100, platino: 150 },  b1Pct: 6,  b2Pct: 1.5 },
  ment_oro:      { nombre: 'Mentor Oro',         tipo: 'mentor',     bonoConquista: 125000, personalFrac: 0.10, minTotalPts: 450, mixEquipo: { bronce: 80, plata: 96, oro: 150, platino: 170 },  b1Pct: 7,  b2Pct: 2   },
  ment_platino:  { nombre: 'Mentor Platino',     tipo: 'mentor',     bonoConquista: 125000, personalFrac: 0.10, minTotalPts: 450, mixEquipo: { bronce: 90, plata: 108, oro: 170, platino: 200 }, b1Pct: 8,  b2Pct: 2.5 },
  ment_diamante: { nombre: 'Mentor Diamante',    tipo: 'mentor',     bonoConquista: 125000, personalFrac: 0.10, minTotalPts: 450, mixEquipo: { bronce: 100, plata: 120, oro: 180, platino: 220 },b1Pct: 9,  b2Pct: 3   },

  emb_oro:       { nombre: 'Emblema Oro',        tipo: 'emblema',    bonoConquista: 125000, personalFrac: 0.05, minTotalPts: 450, mixEquipo: { bronce: 100, plata: 120, oro: 180, platino: 220 },b1Pct: 10, b2Pct: 5   },
  emb_platino:   { nombre: 'Emblema Platino',    tipo: 'emblema',    bonoConquista: 125000, personalFrac: 0.05, minTotalPts: 450, mixEquipo: { bronce: 100, plata: 120, oro: 180, platino: 220 },b1Pct: 10, b2Pct: 5.5 },
  emb_diamante:  { nombre: 'Emblema Diamante',   tipo: 'emblema',    bonoConquista: 125000, personalFrac: 0.05, minTotalPts: 450, mixEquipo: { bronce: 100, plata: 120, oro: 180, platino: 220 },b1Pct: 10, b2Pct: 6   },
};

// ---------- Income distribution by level ----------
// Defines the real-world composition of total earnings (excluding bonoConquista).
// ventaDirecta = venta personal + equipo directo
// n1Pct + n2Pct = generational bonuses
// Sum must equal 100 for each level.
export interface IncomeDistribution {
  ventaDirecta: number;
  n1Pct: number;
  n2Pct: number;
}

export const INCOME_DISTRIBUTION: Record<string, IncomeDistribution> = {
  emp_bronce:    { ventaDirecta: 100.00, n1Pct:  0.00, n2Pct: 0.00 },
  emp_plata:     { ventaDirecta:  99.07, n1Pct:  0.93, n2Pct: 0.00 },
  emp_oro:       { ventaDirecta:  97.86, n1Pct:  2.14, n2Pct: 0.00 },

  ment_plata:    { ventaDirecta:  87.72, n1Pct: 11.72, n2Pct: 0.56 },
  ment_oro:      { ventaDirecta:  73.23, n1Pct: 25.13, n2Pct: 1.64 },
  ment_platino:  { ventaDirecta:  57.31, n1Pct: 38.56, n2Pct: 4.13 },
  ment_diamante: { ventaDirecta:  45.30, n1Pct: 49.75, n2Pct: 4.95 },

  emb_oro:       { ventaDirecta:  32.75, n1Pct: 56.00, n2Pct: 11.25 },
  emb_platino:   { ventaDirecta:  17.96, n1Pct: 68.86, n2Pct: 13.18 },
  emb_diamante:  { ventaDirecta:  13.50, n1Pct: 71.00, n2Pct: 15.50 },
};

// Returns the human-readable name for any level key
export function getLevelDisplayName(key: string): string {
  return LEVEL_CONFIG[key]?.nombre ?? EMPRENDEDOR_NAMES[key] ?? key;
}
