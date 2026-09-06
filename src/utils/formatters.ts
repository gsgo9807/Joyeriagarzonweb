export function formatCurrency(amountCOP: number, currency: 'COP' | 'USD' = 'COP'): string {
  if (currency === 'USD') {
    // Approx exchange rate e.g. 1 USD = 4000 COP
    const usd = Math.round(amountCOP / 4000);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(usd);
  }

  // Colombian Pesos COP
  return '$' + new Intl.NumberFormat('es-CO', {
    maximumFractionDigits: 0
  }).format(amountCOP) + ' COP';
}

export function formatShortPrice(amountCOP: number): string {
  return '$' + new Intl.NumberFormat('es-CO', {
    maximumFractionDigits: 0
  }).format(amountCOP);
}
