// UI categories for the level selector tabs and ordered level hierarchy.

export interface CategoryDef {
  key: string;
  label: string;
  levels: [string, string][];
}

// Tab definitions for the top-level category selector
export const CATEGORIES: CategoryDef[] = [
  { key: 'empr', label: 'Emprendedor', levels: [
    ['empr_bronce', 'Bronce'],
    ['empr_plata', 'Plata'],
    ['empr_oro', 'Oro'],
    ['empr_platino', 'Platino'],
  ]},
  { key: 'emp', label: 'Empresario', levels: [
    ['emp_bronce', 'Bronce'],
    ['emp_plata', 'Plata'],
    ['emp_oro', 'Oro'],
  ]},
  { key: 'ment', label: 'Mentor', levels: [
    ['ment_plata', 'Plata'],
    ['ment_oro', 'Oro'],
    ['ment_platino', 'Platino'],
    ['ment_diamante', 'Diamante'],
  ]},
  { key: 'emb', label: 'Emblema', levels: [
    ['emb_oro', 'Oro'],
    ['emb_platino', 'Platino'],
    ['emb_diamante', 'Diamante'],
  ]},
];

// Default level when switching to a new category
export const DEFAULT_LEVEL_BY_CATEGORY: Record<string, string> = {
  empr: 'empr_bronce',
  emp: 'emp_bronce',
  ment: 'ment_plata',
  emb: 'emb_oro',
};

// All levels in ascending order of seniority.
// Used for the "recommend next level" feature.
export const LEVEL_ORDER: string[] = [
  'empr_bronce', 'empr_plata', 'empr_oro', 'empr_platino',
  'emp_bronce', 'emp_plata', 'emp_oro',
  'ment_plata', 'ment_oro', 'ment_platino', 'ment_diamante',
  'emb_oro', 'emb_platino', 'emb_diamante',
];
