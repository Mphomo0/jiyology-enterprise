/**
 * Central currency configuration for the application.
 * All currency formatting should use these utilities
 * to ensure consistent ZAR display across the app.
 */

export const CURRENCY = {
  code: 'ZAR',
  symbol: 'R',
  locale: 'en-ZA',
} as const

/**
 * Format a number as South African Rands (ZAR).
 * Uses Intl.NumberFormat for proper locale-aware formatting.
 *
 * @example formatCurrency(1500) → "R 1 500,00"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(CURRENCY.locale, {
    style: 'currency',
    currency: CURRENCY.code,
  }).format(amount)
}

/**
 * Format currency for plain text contexts (PDF, email).
 * Returns a simpler format: "R1,500.00"
 */
export function formatCurrencyPlain(amount: number): string {
  return `R${amount.toFixed(2)}`
}
