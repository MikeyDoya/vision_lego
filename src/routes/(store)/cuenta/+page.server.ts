import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { orders, orderItems, users } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { redirect, fail } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		redirect(302, '/iniciar-sesion');
	}

	const user = locals.user as { id: string; name: string; email: string };
	const orderConfirmed = url.searchParams.get('pedido') ?? null;

	const userOrders = await db
		.select({
			id: orders.id,
			status: orders.status,
			total: orders.total,
			shippingCost: orders.shippingCost,
			createdAt: orders.createdAt,
		})
		.from(orders)
		.where(eq(orders.userId, user.id))
		.orderBy(desc(orders.createdAt));

	const ordersWithItems = await Promise.all(
		userOrders.map(async (order) => {
			const items = await db
				.select({
					id: orderItems.id,
					productName: orderItems.productName,
					variantLabel: orderItems.variantLabel,
					unitPrice: orderItems.unitPrice,
					quantity: orderItems.quantity,
					subtotal: orderItems.subtotal,
				})
				.from(orderItems)
				.where(eq(orderItems.orderId, order.id));

			return {
				id: order.id,
				status: order.status,
				total: Number(order.total),
				createdAt: order.createdAt,
				items: items.map((item) => ({
					id: item.id,
					productName: item.productName,
					variantLabel: item.variantLabel,
					unitPrice: Number(item.unitPrice),
					quantity: item.quantity,
					subtotal: Number(item.subtotal),
				})),
			};
		})
	);

	return {
		user: { id: user.id, name: user.name, email: user.email },
		orders: ordersWithItems,
		orderConfirmed,
	};
};

export const actions: Actions = {
	salir: async ({ request, cookies }) => {
		await auth.api.signOut({ headers: request.headers });
		// Clear session cookie manually to be safe
		cookies.delete('better-auth.session_token', { path: '/' });
		redirect(302, '/');
	},

	updateProfile: async ({ request, locals }) => {
		if (!locals.user) redirect(302, '/iniciar-sesion');

		const data = await request.formData();
		const name = (data.get('name') as string)?.trim();

		if (!name) return fail(400, { error: 'El nombre no puede estar vacío' });

		const user = locals.user as { id: string };
		await db.update(users).set({ name, updatedAt: new Date() }).where(eq(users.id, user.id));

		return { success: true };
	},
};
