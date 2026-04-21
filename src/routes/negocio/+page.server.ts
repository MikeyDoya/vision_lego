import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { orders, products, productVariants } from '$lib/server/db/schema';
import { eq, and, gte, sum, count, lte } from 'drizzle-orm';
import { formatCOP } from '$lib/utils/currency';
import { auth } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const [todaySales, pendingOrders, lowStock] = await Promise.all([
		db
			.select({ total: sum(orders.total) })
			.from(orders)
			.where(and(eq(orders.status, 'paid'), gte(orders.createdAt, today))),
		db
			.select({ count: count() })
			.from(orders)
			.where(eq(orders.status, 'pending')),
		db
			.select({ count: count() })
			.from(productVariants)
			.where(and(eq(productVariants.isActive, true), lte(productVariants.stock, 3))),
	]);

	return {
		todaySales: formatCOP(Number(todaySales[0]?.total ?? 0)),
		pendingOrders: pendingOrders[0]?.count ?? 0,
		lowStockCount: lowStock[0]?.count ?? 0,
	};
};

export const actions: Actions = {
	salir: async (event) => {
		await auth.api.signOut({ headers: event.request.headers });
		redirect(302, '/iniciar-sesion');
	},
};
