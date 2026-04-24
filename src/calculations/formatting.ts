// Currency formatting and numeric input parsing utilities.

// Formats a number as Argentine peso currency: "$1.234.567"
export function formatCurrency(amount: number): string {
  return '$' + Math.round(Number(amount || 0)).toLocaleString('es-AR');
}

// Strips non-digit characters from a user-input string and returns the number.
export function parseNumericInput(value: string): number {
  const digits = String(value || '').replace(/[^\d]/g, '');
  return Number(digits || 0);
}

// Formats a raw input string with thousand-separator dots: "1234567" -> "1.234.567"
export function formatNumericInput(value: string): string {
  const digits = String(value || '').replace(/[^\d]/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('es-AR');
}
