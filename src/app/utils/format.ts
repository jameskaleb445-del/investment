/**
 * Format number as XAF currency with comma separators
 */
export function formatCurrency(amount: number): string {
  // Format with commas as thousand separators
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
  
  return `${formatted} FCFA`
}

/**
 * Format number with thousand separators (commas)
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Calculate percentage
 */
export function calculatePercentage(part: number, total: number): number {
  if (total === 0) return 0
  return (part / total) * 100
}

/**
 * Format number as USD currency
 * XAF to USD conversion rate: approximately 600 XAF = 1 USD
 */
export function formatCurrencyUSD(amount: number): string {
  // Convert XAF to USD (600 XAF = 1 USD)
  const usdAmount = amount / 600
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(usdAmount)
}

