import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { orders } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { formatCOP } from '$lib/utils/currency';

const STATUS_LABELS: Record<string, string> = {
	pending: 'Pendiente',
	paid: 'Pagado',
	processing: 'En proceso',
	shipped: 'Enviado',
	delivered: 'Entregado',
	cancelled: 'Cancelado',
	refunded: 'Reembolsado',
};

export const load: PageServerLoad = async ({ url }) => {
	const status = url.searchParams.get('estado') ?? '';

	const rows = await db
		.select({
			id: orders.id,
			customerName: orders.customerName,
			customerEmail: orders.customerEmail,
			status: orders.status,
			total: orders.total,
			createdAt: orders.createdAt,
		})
		.from(orders)
		.where(status ? eq(orders.status, status as typeof orders.status._.data) : undefined)
		.orderBy(desc(orders.createdAt));

	return {
		orders: rows.map((o) => ({
			...o,
			totalFormatted: formatCOP(Number(o.total)),
			statusLabel: STATUS_LABELS[o.status] ?? o.status,
		})),
		status,
		statusLabels: STATUS_LABELS,
	};
};
