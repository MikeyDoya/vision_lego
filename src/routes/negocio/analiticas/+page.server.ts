import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { orders, orderItems, expenses } from '$lib/server/db/schema';
import { eq, and, gte, lte, sum, desc, sql } from 'drizzle-orm';
import { formatCOP } from '$lib/utils/currency';

export const load: PageServerLoad = async ({ url }) => {
	const today = new Date();
	const defaultFrom = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
	const defaultTo = today.toISOString().slice(0, 10);

	const from = url.searchParams.get('desde') ?? defaultFrom;
	const to = url.searchParams.get('hasta') ?? defaultTo;

	const fromDate = new Date(from + 'T00:00:00');
	const toDate = new Date(to + 'T23:59:59');

	const [salesByDay, topProducts, totalExpenses] = await Promise.all([
		db
			.select({
				day: sql<string>`date_trunc('day', ${orders.createdAt})::date::text`.as('day'),
				total: sum(orders.total),
			})
			.from(orders)
			.where(
				and(
					eq(orders.status, 'paid'),
					gte(orders.createdAt, fromDate),
					lte(orders.createdAt, toDate)
				)
			)
			.groupBy(sql`date_trunc('day', ${orders.createdAt})`)
			.orderBy(sql`date_trunc('day', ${orders.createdAt})`),

		db
			.select({
				productName: orderItems.productName,
				totalQty: sum(orderItems.quantity),
				totalRevenue: sum(orderItems.subtotal),
			})
			.from(orderItems)
			.innerJoin(orders, eq(orderItems.orderId, orders.id))
			.where(
				and(
					eq(orders.status, 'paid'),
					gte(orders.createdAt, fromDate),
					lte(orders.createdAt, toDate)
				)
			)
			.groupBy(orderItems.productName)
			.orderBy(desc(sum(orderItems.quantity)))
			.limit(5),

		db
			.select({ total: sum(expenses.amount) })
			.from(expenses)
			.where(and(gte(expenses.date, from), lte(expenses.date, to))),
	]);

	const totalIncome = salesByDay.reduce((acc, d) => acc + Number(d.total ?? 0), 0);
	const totalExpensesAmount = Number(totalExpenses[0]?.total ?? 0);
	const netProfit = totalIncome - totalExpensesAmount;

	return {
		from,
		to,
		salesByDay: salesByDay.map((d) => ({ day: d.day, total: Number(d.total ?? 0) })),
		topProducts: topProducts.map((p) => ({
			name: p.productName,
			qty: Number(p.totalQty ?? 0),
			revenue: formatCOP(Number(p.totalRevenue ?? 0)),
		})),
		summary: {
			totalIncome: formatCOP(totalIncome),
			totalExpenses: formatCOP(totalExpensesAmount),
			netProfit: formatCOP(netProfit),
			netProfitRaw: netProfit,
		},
	};
};
