import { LEVEL_ORDER, CATEGORIES } from '../config/categories';
import { MODEL_AVERAGE_EARNINGS, LEVEL_MAX_EARNINGS, getLevelDisplayName } from '../config/levels';
import type { LevelRecommendation } from './types';

// Scans all levels above currentKey and returns the first one whose
// average earnings meet or exceed the objective.
export function findRecommendedLevel(
  currentKey: string,
  objetivo: number,
): LevelRecommendation | null {
  const currentIdx = LEVEL_ORDER.indexOf(currentKey);
  if (currentIdx < 0) return null;

  const currentAvg = MODEL_AVERAGE_EARNINGS[currentKey] ?? 0;
  if (objetivo <= currentAvg) return null;

  const higherLevels = LEVEL_ORDER.slice(currentIdx + 1);
  if (higherLevels.length === 0) return null;

  for (const key of higherLevels) {
    const avg = MODEL_AVERAGE_EARNINGS[key] ?? 0;
    if (avg >= objetivo) {
      return { key, name: getLevelDisplayName(key), avg, isMax: false };
    }
  }

  const maxKey = higherLevels[higherLevels.length - 1];
  return {
    key: maxKey,
    name: getLevelDisplayName(maxKey),
    avg: MODEL_AVERAGE_EARNINGS[maxKey] ?? 0,
    isMax: true,
  };
}

function findCategory(levelKey: string) {
  return CATEGORIES.find(c => c.levels.some(([k]) => k === levelKey));
}

// Finds the lowest level whose healthy range can cover the objective.
// A level is viable when the objective does not exceed its ceiling
// (with 5% tolerance). The first viable level wins.
export function findBestLevelForAmount(amount: number): { levelKey: string; catKey: string } | null {
  if (amount <= 0) return null;

  for (const key of LEVEL_ORDER) {
    const ceiling = LEVEL_MAX_EARNINGS[key] ?? Infinity;
    if (amount <= ceiling * 1.05) {
      console.log('[LevelSelect]', { amount, chosen: key, ceiling });
      return { levelKey: key, catKey: findCategory(key)?.key ?? '' };
    }
  }

  const maxKey = LEVEL_ORDER[LEVEL_ORDER.length - 1];
  console.log('[LevelSelect] fallback to max', { amount, chosen: maxKey });
  return { levelKey: maxKey, catKey: findCategory(maxKey)?.key ?? '' };
}
