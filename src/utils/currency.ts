/**
 * Indian Rupee (INR) Currency Utilities
 */

export function formatCurrency(
  amount: number | null | undefined,
  currencySymbol: string = '₹',
  minimumFractionDigits: number = 2,
  maximumFractionDigits: number = 2
): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `${currencySymbol}0.00`;
  }
  const formatted = amount.toLocaleString('en-IN', {
    minimumFractionDigits,
    maximumFractionDigits,
  });
  return `${currencySymbol}${formatted}`;
}

export function formatINR(
  amount: number | null | undefined,
  decimals: number = 2
): string {
  return formatCurrency(amount, '₹', decimals, decimals);
}

export function formatCompactINR(
  amount: number,
  currencySymbol: string = '₹'
): string {
  if (amount >= 10000000) {
    return `${currencySymbol}${(amount / 10000000).toFixed(1).replace(/\.0$/, '')} Cr`;
  }
  if (amount >= 100000) {
    return `${currencySymbol}${(amount / 100000).toFixed(1).replace(/\.0$/, '')}L`;
  }
  if (amount >= 1000) {
    return `${currencySymbol}${(amount / 1000).toFixed(0)}K`;
  }
  return `${currencySymbol}${amount.toLocaleString('en-IN')}`;
}
