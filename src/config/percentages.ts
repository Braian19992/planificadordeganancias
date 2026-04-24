// Earning percentages by level.
// These tables define how much of each punto translates to earnings.

// ---------- Unified discount rate per level ----------
// Discount = fraction of the public price that becomes profit.
// Formula: costo = precioPublico * (1 - descuento), ganancia = precioPublico * descuento
// This is the single source of truth for personal-sale margins.
export const LEVEL_DISCOUNT: Record<string, number> = {
  empr_bronce:   0.285,
  empr_plata:    0.31,
  empr_oro:      0.355,
  empr_platino:  0.375,

  emp_bronce:    0.445,
  emp_plata:     0.46,
  emp_oro:       0.475,

  ment_plata:    0.49,
  ment_oro:      0.50,
  ment_platino:  0.50,
  ment_diamante: 0.50,

  emb_oro:       0.50,
  emb_platino:   0.50,
  emb_diamante:  0.50,
};

// Computes the per-unit profit for personal sale (full margin vs. public price).
export function profitPerUnit(levelKey: string, publicPrice: number): number {
  const discount = LEVEL_DISCOUNT[levelKey] || 0;
  return publicPrice * discount;
}

// Computes the per-unit distribution margin when a distributor sells to an emprendedor.
// margin = (distributor discount - emprendedor discount) * publicPrice
export function distributionMarginPerUnit(
  distributorKey: string,
  emprendedorTier: 'bronce' | 'plata' | 'oro' | 'platino',
  publicPrice: number,
): number {
  const distDiscount = LEVEL_DISCOUNT[distributorKey] || 0;
  const emprDiscount = LEVEL_DISCOUNT[`empr_${emprendedorTier}`] || 0;
  return publicPrice * Math.max(0, distDiscount - emprDiscount);
}

