import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { orders, orderItems } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
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

export const load: PageServerLoad = async ({ params }) => {
	const order = await db.query.orders.findFirst({
		where: eq(orders.id, params.id),
		with: { items: true, shippingMethod: true },
	});
	if (!order) error(404, 'Pedido no encontrado');

	return {
		order: {
			...order,
			totalFormatted: formatCOP(Number(order.total)),
			shippingCostFormatted: formatCOP(Number(order.shippingCost)),
			statusLabel: STATUS_LABELS[order.status] ?? order.status,
			items: order.items.map((item) => ({
				...item,
				unitPriceFormatted: formatCOP(Number(item.unitPrice)),
				subtotalFormatted: formatCOP(Number(item.subtotal)),
			})),
		},
		statusLabels: STATUS_LABELS,
	};
};

export const actions: Actions = {
	updateStatus: async ({ request, params }) => {
		const data = await request.formData();
		const status = data.get('status')?.toString();
		const validStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
		if (!status || !validStatuses.includes(status)) {
			return fail(400, { message: 'Estado inválido' });
		}
		await db
			.update(orders)
			.set({ status: status as typeof orders.status._.data, updatedAt: new Date() })
			.where(eq(orders.id, params.id));
	},
};
