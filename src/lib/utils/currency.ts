export function applyDiscount(basePrice: number, discountPercent: number | null): number {
	if (!discountPercent || discountPercent <= 0) return basePrice;
	const pct = Math.min(100, Math.max(0, discountPercent));
	return Math.round(basePrice * (1 - pct / 100));
}

export function formatCOP(amount: number): string {
	return new Intl.NumberFormat('es-CO', {
		style: 'currency',
		currency: 'COP',
		minimumFractionDigits: 0,
	}).format(amount)
}
