export function formatNumber(n) {
  return new Intl.NumberFormat('en-IN').format(n)
}

export function formatCurrency(n) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n)
}

export function todayLabel() {
  return new Date('2026-07-06').toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
