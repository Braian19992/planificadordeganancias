import {
  LEVEL_CONFIG,
  LEVEL_INDICATORS,
  LEVEL_DISCOUNT,
  MIN_TOTAL_POINTS,
  MIN_N1_N2_COUNTS,
  MIN_EMPRENDEDORES,
  POINTS_PER_EMPRENDEDOR,
  INCOME_DISTRIBUTION,
} from '../config';
import { distributionMarginPerUnit } from '../config';
import type { EarningsResult, TeamStructure } from './types';

// ---------------------------------------------------------------------------
// Generational billing factor per level.
// facturacion = pts * precio * billingFactor
// Parametrized per level so it can be refined independently.
// ---------------------------------------------------------------------------
const GENERATIONAL_BILLING_FACTOR: Record<string, { n1: number; n2: number }> = {
  emp_plata:     { n1: 0.555, n2: 0 },
  emp_oro:       { n1: 0.555, n2: 0 },
  ment_plata:    { n1: 0.555, n2: 0.555 },
  ment_oro:      { n1: 0.555, n2: 0.555 },
  ment_platino:  { n1: 0.555, n2: 0.555 },
  ment_diamante: { n1: 0.555, n2: 0.555 },
  emb_oro:       { n1: 0.555, n2: 0.555 },
  emb_platino:   { n1: 0.555, n2: 0.555 },
  emb_diamante:  { n1: 0.555, n2: 0.555 },
};

const TIERS = ['bronce', 'plata', 'oro', 'platino'] as const;
type Tier = typeof TIERS[number];

// ---------------------------------------------------------------------------
// Smoothed interpolation for N1/N2: power curve (slow start, fast finish).
// t in [0,1] → output in [0,1], with t^exponent shape.
// ---------------------------------------------------------------------------
function smoothN1N2(t: number): number {
  return Math.pow(Math.max(0, Math.min(1, t)), 1.5);
}

// ---------------------------------------------------------------------------
// Linear interpolation helper.
// ---------------------------------------------------------------------------
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// ---------------------------------------------------------------------------
// Interpolate a value across [piso, promedio, techo] given fraction [0..1].
// fraction=0 → piso, fraction=0.5 → promedio, fraction=1.0 → techo.
// Uses the provided curve function for the t mapping.
// ---------------------------------------------------------------------------
function interpRange(
  piso: number,
  promedio: number,
  techo: number,
  fraction: number,
  curveFn: (t: number) => number = (t) => t,
): number {
  if (fraction <= 0.5) {
    const t = curveFn(fraction / 0.5);
    return lerp(piso, promedio, t);
  }
  const t = curveFn((fraction - 0.5) / 0.5);
  return lerp(promedio, techo, t);
}

// ---------------------------------------------------------------------------
// Distribute team points into emprendedor tiers using mix weights that
// shift based on fraction: lower fractions weight bronce/plata more,
// higher fractions weight oro/platino more.
// ---------------------------------------------------------------------------
function distribuirEquipoPorMix(
  levelKey: string,
  ptsEquipo: number,
  fraction: number,
): TeamStructure {
  const cfg = LEVEL_CONFIG[levelKey];
  if (!cfg || ptsEquipo <= 0) {
    return {
      cant: { bronce: 0, plata: 0, oro: 0, platino: 0 },
      pts: { bronce: 0, plata: 0, oro: 0, platino: 0 },
      totalPts: 0,
      totalEmpr: 0,
    };
  }

  const baseMix = cfg.mixEquipo;
  const shift = (fraction - 0.5) * 0.4;

  const adjustedMix = {
    bronce:  Math.max(1, baseMix.bronce * (1 - shift)),
    plata:   Math.max(1, baseMix.plata * (1 - shift * 0.5)),
    oro:     Math.max(1, baseMix.oro * (1 + shift * 0.5)),
    platino: Math.max(1, baseMix.platino * (1 + shift)),
  };

  const totalWeight = adjustedMix.bronce + adjustedMix.plata + adjustedMix.oro + adjustedMix.platino;

  const desiredPts: Record<Tier, number> = {
    bronce:  (adjustedMix.bronce / totalWeight) * ptsEquipo,
    plata:   (adjustedMix.plata / totalWeight) * ptsEquipo,
    oro:     (adjustedMix.oro / totalWeight) * ptsEquipo,
    platino: (adjustedMix.platino / totalWeight) * ptsEquipo,
  };

  const cant: Record<Tier, number> = {
    bronce:  Math.max(0, Math.round(desiredPts.bronce / POINTS_PER_EMPRENDEDOR.bronce)),
    plata:   Math.max(0, Math.round(desiredPts.plata / POINTS_PER_EMPRENDEDOR.plata)),
    oro:     Math.max(0, Math.round(desiredPts.oro / POINTS_PER_EMPRENDEDOR.oro)),
    platino: Math.max(0, Math.round(desiredPts.platino / POINTS_PER_EMPRENDEDOR.platino)),
  };

  const pts: Record<Tier, number> = {
    bronce:  cant.bronce * POINTS_PER_EMPRENDEDOR.bronce,
    plata:   cant.plata * POINTS_PER_EMPRENDEDOR.plata,
    oro:     cant.oro * POINTS_PER_EMPRENDEDOR.oro,
    platino: cant.platino * POINTS_PER_EMPRENDEDOR.platino,
  };

  return {
    cant,
    pts,
    totalPts: pts.bronce + pts.plata + pts.oro + pts.platino,
    totalEmpr: cant.bronce + cant.plata + cant.oro + cant.platino,
  };
}

// ---------------------------------------------------------------------------
// Structure type produced by construirEstructura.
// ---------------------------------------------------------------------------
interface Estructura {
  ptsPersonal: number;
  ptsEquipo: number;
  equipo: TeamStructure;
  empr: number;
  n1: number;
  ptsN1: number;
  n2: number;
  ptsN2: number;
}

// ---------------------------------------------------------------------------
// Build a valid structure for a level at a given fraction [0..1].
// fraction=0 → floor, fraction=0.5 → Hoja 3 average, fraction=1.0 → ceiling.
// Each variable interpolates within its own [piso, promedio, techo] range.
// N1 and N2 use a smoothed curve (slow start, accelerating).
// Team distribution shifts toward advanced tiers at higher fractions.
// ---------------------------------------------------------------------------
function construirEstructura(levelKey: string, fraction: number): Estructura {
  const ind = LEVEL_INDICATORS[levelKey];
  const cfg = LEVEL_CONFIG[levelKey];
  const f = Math.max(0, Math.min(1, fraction));

  // -- Puntos ED: linear interpolation --
  const pisoED = MIN_TOTAL_POINTS[levelKey] || 100;
  const promedioED = ind?.puntos ?? pisoED;
  const techoED = promedioED * 2;
  const ptsED = Math.round(interpRange(pisoED, promedioED, techoED, f));

  // -- Split personal/equipo using personalFrac directly --
  const ptsPersonal = Math.round(ptsED * (cfg?.personalFrac ?? 0.15));
  const ptsEquipo = ptsED - ptsPersonal;

  // -- Equipo distribution (mix shifts with fraction) --
  const equipo = distribuirEquipoPorMix(levelKey, ptsEquipo, f);

  // -- Emprendedores directos --
  const pisoEmpr = MIN_EMPRENDEDORES[levelKey] ?? 0;
  const promedioEmpr = ind?.empr ?? pisoEmpr;
  const techoEmpr = promedioEmpr * 2;
  let empr = Math.round(interpRange(
    Math.max(pisoEmpr, 0), promedioEmpr, techoEmpr, f,
  ));
  empr = Math.max(empr, pisoEmpr);

  if (equipo.totalEmpr < empr) {
    const deficit = empr - equipo.totalEmpr;
    equipo.cant.plata += deficit;
    equipo.pts.plata += deficit * POINTS_PER_EMPRENDEDOR.plata;
    equipo.totalEmpr += deficit;
    equipo.totalPts += deficit * POINTS_PER_EMPRENDEDOR.plata;
  }

  // -- N1: smoothed curve --
  const floors = MIN_N1_N2_COUNTS[levelKey];
  const pisoN1 = floors?.n1 ?? 0;
  const promedioN1 = ind?.n1 ?? 0;
  const techoN1 = promedioN1 * 2;

  let n1 = 0;
  let ptsN1 = 0;
  if (promedioN1 > 0) {
    n1 = Math.round(interpRange(pisoN1, promedioN1, techoN1, f, smoothN1N2));
    n1 = Math.max(n1, pisoN1);
    n1 = Math.min(n1, techoN1);

    if (n1 > 0) {
      const ratioN1 = Math.max((ind?.ptsN1 ?? 0) / promedioN1, 100);
      ptsN1 = Math.round(n1 * ratioN1);
      ptsN1 = Math.max(ptsN1, n1 * 100);
    }
  }

  // -- N2: smoothed curve --
  const pisoN2 = floors?.n2 ?? 0;
  const promedioN2 = ind?.n2 ?? 0;
  const techoN2 = promedioN2 * 2;

  let n2 = 0;
  let ptsN2 = 0;
  if (promedioN2 > 0) {
    n2 = Math.round(interpRange(pisoN2, promedioN2, techoN2, f, smoothN1N2));
    n2 = Math.max(n2, pisoN2);
    n2 = Math.min(n2, techoN2);

    if (n2 > 0) {
      const ratioN2 = Math.max((ind?.ptsN2 ?? 0) / promedioN2, 100);
      ptsN2 = Math.round(n2 * ratioN2);
      ptsN2 = Math.max(ptsN2, n2 * 100);
    }
  }

  // -- Bidirectional consistency --
  if (n1 === 0) ptsN1 = 0;
  if (n2 === 0) ptsN2 = 0;

  return { ptsPersonal, ptsEquipo, equipo, empr, n1, ptsN1, n2, ptsN2 };
}

// ---------------------------------------------------------------------------
// Monetize a structure: pure arithmetic, no decisions.
// ---------------------------------------------------------------------------
interface MonetizationResult {
  ventaPersonal: number;
  equipoDirecto: number;
  bonoConquista: number;
  bonoN1: number;
  bonoN2: number;
  facturacionN1: number;
  facturacionN2: number;
  gananciaTotal: number;
}

function monetizarEstructura(
  est: Estructura,
  levelKey: string,
  precio: number,
): MonetizationResult {
  const cfg = LEVEL_CONFIG[levelKey];
  const billing = GENERATIONAL_BILLING_FACTOR[levelKey] ?? { n1: 0.555, n2: 0.555 };

  const ventaPersonal = est.ptsPersonal * precio * (LEVEL_DISCOUNT[levelKey] ?? 0);

  let equipoDirecto = 0;
  for (const tier of TIERS) {
    const margin = distributionMarginPerUnit(levelKey, tier, precio);
    equipoDirecto += (est.equipo.pts[tier] ?? 0) * margin;
  }

  const bonoConquista = cfg?.bonoConquista ?? 0;

  let facturacionN1 = 0;
  let bonoN1 = 0;
  if (est.n1 > 0 && cfg && cfg.b1Pct > 0) {
    facturacionN1 = est.ptsN1 * precio * billing.n1;
    bonoN1 = (cfg.b1Pct / 100) * facturacionN1;
  }

  let facturacionN2 = 0;
  let bonoN2 = 0;
  if (est.n2 > 0 && cfg && cfg.b2Pct > 0) {
    facturacionN2 = est.ptsN2 * precio * billing.n2;
    bonoN2 = (cfg.b2Pct / 100) * facturacionN2;
  }

  const gananciaTotal = ventaPersonal + equipoDirecto + bonoConquista + bonoN1 + bonoN2;

  return {
    ventaPersonal, equipoDirecto, bonoConquista,
    bonoN1, bonoN2, facturacionN1, facturacionN2, gananciaTotal,
  };
}

// ---------------------------------------------------------------------------
// Validate scenario: soft composition check against INCOME_DISTRIBUTION.
// Returns warnings (informative only, never corrects the result).
// ---------------------------------------------------------------------------
function validateScenario(
  result: MonetizationResult,
  levelKey: string,
  fraction: number,
): { rangePosition: string; warnings: string[] } {
  const warnings: string[] = [];

  let rangePosition: string;
  if (fraction <= 0.01) {
    rangePosition = 'below_min';
    warnings.push('Objetivo por debajo del minimo. Estructura en piso.');
  } else if (fraction < 0.3) {
    rangePosition = 'near_min';
  } else if (fraction <= 0.7) {
    rangePosition = 'target';
  } else if (fraction < 0.99) {
    rangePosition = 'near_max';
  } else {
    rangePosition = 'above_max';
    warnings.push('Objetivo excede el maximo. Estructura en techo.');
  }

  const ref = INCOME_DISTRIBUTION[levelKey];
  if (ref) {
    const sinConq = result.gananciaTotal - result.bonoConquista;
    if (sinConq > 0) {
      const vdPct = (result.ventaPersonal + result.equipoDirecto) / sinConq * 100;
      if (Math.abs(vdPct - ref.ventaDirecta) > 20) {
        warnings.push(`Composicion VD=${Math.round(vdPct)}% vs ref ${ref.ventaDirecta}%`);
      }
    }
  }

  return { rangePosition, warnings };
}

// ---------------------------------------------------------------------------
// SCENARIO SEARCH: generate scenarios across range, pick closest to objective.
// 21 coarse samples + binary refinement.
// ---------------------------------------------------------------------------
interface ScenarioResult {
  fraction: number;
  estructura: Estructura;
  monetizado: MonetizationResult;
}

function scoreDiff(ganancia: number, objetivo: number): number {
  const raw = ganancia - objetivo;
  const abs = Math.abs(raw);
  if (raw > 0) return abs * 1.3;
  return abs;
}

function findBestScenario(
  levelKey: string,
  objetivo: number,
  precio: number,
): ScenarioResult {
  const STEPS = 21;
  let best: ScenarioResult | null = null;
  let bestScore = Infinity;

  for (let i = 0; i < STEPS; i++) {
    const f = i / (STEPS - 1);
    const estructura = construirEstructura(levelKey, f);
    const monetizado = monetizarEstructura(estructura, levelKey, precio);
    const score = scoreDiff(monetizado.gananciaTotal, objetivo);
    if (score < bestScore) {
      best = { fraction: f, estructura, monetizado };
      bestScore = score;
    }
  }

  if (!best) {
    const est = construirEstructura(levelKey, 0.5);
    return { fraction: 0.5, estructura: est, monetizado: monetizarEstructura(est, levelKey, precio) };
  }

  let lo = Math.max(0, best.fraction - 0.05);
  let hi = Math.min(1, best.fraction + 0.05);
  for (let i = 0; i < 12; i++) {
    const mid = (lo + hi) / 2;
    const estructura = construirEstructura(levelKey, mid);
    const monetizado = monetizarEstructura(estructura, levelKey, precio);
    const score = scoreDiff(monetizado.gananciaTotal, objetivo);
    if (score < bestScore) {
      best = { fraction: mid, estructura, monetizado };
      bestScore = score;
    }
    if (monetizado.gananciaTotal < objetivo) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return best;
}

// ---------------------------------------------------------------------------
// Microadjust: after scenario selection, tweak continuous variables to close
// the gap between gananciaTotal and objetivo without breaking structure.
// Phases: ptsPersonal -> ptsN1 -> ptsN2 -> ptsPersonal (fine-tune).
// ---------------------------------------------------------------------------
function microadjust(
  est: Estructura,
  levelKey: string,
  precio: number,
  objetivo: number,
): { est: Estructura; mon: MonetizationResult } {
  const cfg = LEVEL_CONFIG[levelKey];
  if (!cfg) {
    return { est, mon: monetizarEstructura(est, levelKey, precio) };
  }

  let current = { ...est };
  let mon = monetizarEstructura(current, levelKey, precio);
  let gap = objetivo - mon.gananciaTotal;
  if (Math.abs(gap) < 1) return { est: current, mon };

  const pisoED = MIN_TOTAL_POINTS[levelKey] || 0;
  const ind = LEVEL_INDICATORS[levelKey];
  const techoED = (ind?.puntos ?? pisoED) * 2;

  const personalRate = precio * (LEVEL_DISCOUNT[levelKey] ?? 0);

  // Phase 1: Adjust ptsPersonal
  if (personalRate > 0 && Math.abs(gap) > 1) {
    const deltaPts = Math.round(gap / personalRate);
    if (deltaPts !== 0) {
      const newPersonal = Math.max(0, current.ptsPersonal + deltaPts);
      const newTotalED = newPersonal + current.ptsEquipo;
      if (newTotalED >= pisoED && newTotalED <= techoED * 1.1) {
        current = { ...current, ptsPersonal: newPersonal };
        mon = monetizarEstructura(current, levelKey, precio);
        gap = objetivo - mon.gananciaTotal;
      }
    }
  }
  if (Math.abs(gap) < 1) return { est: current, mon };

  // Phase 2: Adjust ptsN1
  const billing = GENERATIONAL_BILLING_FACTOR[levelKey] ?? { n1: 0.555, n2: 0.555 };
  if (current.n1 > 0 && cfg.b1Pct > 0 && Math.abs(gap) > 1) {
    const rateN1 = (cfg.b1Pct / 100) * precio * billing.n1;
    if (rateN1 > 0) {
      const deltaN1 = gap / rateN1;
      const newPtsN1 = Math.max(current.n1 * 100, Math.round(current.ptsN1 + deltaN1));
      const promedioN1 = ind?.n1 ?? 0;
      const techoN1Pts = promedioN1 > 0
        ? Math.round(promedioN1 * 2 * Math.max((ind?.ptsN1 ?? 0) / promedioN1, 100))
        : current.ptsN1 * 3;
      if (newPtsN1 <= techoN1Pts * 1.1 && newPtsN1 >= current.n1 * 100) {
        current = { ...current, ptsN1: newPtsN1 };
        mon = monetizarEstructura(current, levelKey, precio);
        gap = objetivo - mon.gananciaTotal;
      }
    }
  }
  if (Math.abs(gap) < 1) return { est: current, mon };

  // Phase 3: Adjust ptsN2
  if (current.n2 > 0 && cfg.b2Pct > 0 && Math.abs(gap) > 1) {
    const rateN2 = (cfg.b2Pct / 100) * precio * billing.n2;
    if (rateN2 > 0) {
      const deltaN2 = gap / rateN2;
      const newPtsN2 = Math.max(current.n2 * 100, Math.round(current.ptsN2 + deltaN2));
      const promedioN2 = ind?.n2 ?? 0;
      const techoN2Pts = promedioN2 > 0
        ? Math.round(promedioN2 * 2 * Math.max((ind?.ptsN2 ?? 0) / promedioN2, 100))
        : current.ptsN2 * 3;
      if (newPtsN2 <= techoN2Pts * 1.1 && newPtsN2 >= current.n2 * 100) {
        current = { ...current, ptsN2: newPtsN2 };
        mon = monetizarEstructura(current, levelKey, precio);
        gap = objetivo - mon.gananciaTotal;
      }
    }
  }
  if (Math.abs(gap) < 1) return { est: current, mon };

  // Phase 4: Fine-tune ptsPersonal for remaining gap
  if (personalRate > 0 && Math.abs(gap) > 1) {
    const finalDelta = Math.round(gap / personalRate);
    if (finalDelta !== 0) {
      const newPersonal = Math.max(0, current.ptsPersonal + finalDelta);
      const newTotalED = newPersonal + current.ptsEquipo;
      if (newTotalED >= pisoED) {
        current = { ...current, ptsPersonal: newPersonal };
        mon = monetizarEstructura(current, levelKey, precio);
      }
    }
  }

  return { est: current, mon };
}

// ---------------------------------------------------------------------------
// PUBLIC: Build scenario for Empresario / Mentor / Emblema.
// Generates scenarios across the level's range, picks closest to objective.
// ---------------------------------------------------------------------------
export function buildScenario(
  levelKey: string,
  objetivo: number,
  precio: number,
): EarningsResult {
  const cfg = LEVEL_CONFIG[levelKey];
  if (!cfg) {
    return emptyResult(objetivo);
  }

  const scenario = findBestScenario(levelKey, objetivo, precio);
  const { fraction } = scenario;
  const { est, mon } = microadjust(scenario.estructura, levelKey, precio, objetivo);
  validateScenario(mon, levelKey, fraction);

  if (est.n1 > 0 && est.ptsN1 < est.n1 * 100) {
    throw new Error(`Invariant violation: ptsN1=${est.ptsN1} < n1*100=${est.n1 * 100}`);
  }
  if (est.n2 > 0 && est.ptsN2 < est.n2 * 100) {
    throw new Error(`Invariant violation: ptsN2=${est.ptsN2} < n2*100=${est.n2 * 100}`);
  }

  return {
    objetivo,
    gananciaTotal: mon.gananciaTotal,
    ventaPersonal: mon.ventaPersonal,
    equipoDirecto: mon.equipoDirecto,
    bonoConquista: mon.bonoConquista,
    bonoN1: mon.bonoN1,
    bonoN2: mon.bonoN2,
    puntosPersonal: est.ptsPersonal,
    puntosEquipo: est.equipo.totalPts,
    estructura: est.equipo,
    n1: est.n1,
    n2: est.n2,
    ptsN1: est.ptsN1,
    ptsN2: est.ptsN2,
    facturacionN1: mon.facturacionN1,
    facturacionN2: mon.facturacionN2,
    upgradeSuggest: fraction >= 0.99 && mon.gananciaTotal < objetivo * 0.9,
    requeridoEquipo: null,
  };
}

// ---------------------------------------------------------------------------
// PUBLIC: Build scenario for Emprendedor Bronce / Plata / Oro.
// Direct personal sales only.
// ---------------------------------------------------------------------------
export function buildEmprendedorScenario(
  levelKey: string,
  objetivo: number,
  precio: number,
): EarningsResult {
  const earningsPerPt = precio * (LEVEL_DISCOUNT[levelKey] ?? 0);
  const pisosPts = MIN_TOTAL_POINTS[levelKey] || 0;

  const ptsNeeded = earningsPerPt > 0 ? Math.ceil(objetivo / earningsPerPt) : 0;
  const ptsFinal = Math.max(ptsNeeded, pisosPts);
  const ganancia = ptsFinal * earningsPerPt;

  return {
    objetivo,
    gananciaTotal: ganancia,
    ventaPersonal: ganancia,
    equipoDirecto: 0,
    bonoConquista: 0,
    bonoN1: 0,
    bonoN2: 0,
    puntosPersonal: ptsFinal,
    puntosEquipo: 0,
    estructura: null,
    n1: 0,
    n2: 0,
  };
}

// ---------------------------------------------------------------------------
// PUBLIC: Build scenario for Emprendedor Platino.
// Sweep over 2-5 Emprendedores Plata.
// ---------------------------------------------------------------------------
export function buildEmprendedorPlatinoScenario(
  objetivo: number,
  precio: number,
): EarningsResult {
  const levelKey = 'empr_platino';
  const earningsPerPt = precio * (LEVEL_DISCOUNT[levelKey] ?? 0);
  const marginPlata = distributionMarginPerUnit(levelKey, 'plata', precio);
  const pisosPtsPers = Math.max(MIN_TOTAL_POINTS[levelKey] || 50, LEVEL_INDICATORS[levelKey]?.puntos ?? 70);

  let best: {
    cantPlata: number; ptsPers: number; ptsEq: number;
    ganPers: number; ganEq: number; total: number; diff: number;
  } | null = null;

  for (let cantPlata = 2; cantPlata <= 5; cantPlata++) {
    const ptsEq = cantPlata * POINTS_PER_EMPRENDEDOR.plata;
    const ganEq = ptsEq * marginPlata;
    const remaining = Math.max(0, objetivo - ganEq);
    const ptsPers = Math.max(
      earningsPerPt > 0 ? Math.ceil(remaining / earningsPerPt) : 0,
      pisosPtsPers,
    );
    const ganPers = ptsPers * earningsPerPt;
    const total = ganPers + ganEq;
    const diff = Math.abs(total - objetivo);
    if (!best || diff < best.diff) {
      best = { cantPlata, ptsPers, ptsEq, ganPers, ganEq, total, diff };
    }
  }

  if (!best) {
    return emptyResult(objetivo);
  }

  return {
    objetivo,
    gananciaTotal: best.total,
    ventaPersonal: best.ganPers,
    equipoDirecto: best.ganEq,
    bonoConquista: 0,
    bonoN1: 0,
    bonoN2: 0,
    puntosPersonal: best.ptsPers,
    puntosEquipo: best.ptsEq,
    estructura: {
      cant: { bronce: 0, plata: best.cantPlata, oro: 0, platino: 0 },
      pts: { bronce: 0, plata: best.ptsEq, oro: 0, platino: 0 },
      totalPts: best.ptsEq,
      totalEmpr: best.cantPlata,
    },
    n1: 0,
    n2: 0,
    upgradeSuggest: best.total < objetivo * 0.7,
    requeridoEquipo: null,
  };
}

function emptyResult(objetivo: number): EarningsResult {
  return {
    objetivo,
    gananciaTotal: 0,
    ventaPersonal: 0,
    equipoDirecto: 0,
    bonoConquista: 0,
    bonoN1: 0,
    bonoN2: 0,
    puntosPersonal: 0,
    puntosEquipo: 0,
    estructura: null,
    n1: 0,
    n2: 0,
  };
}
