import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { expenses } from '$lib/server/db/schema';
import { eq, and, gte, lte, sum, desc } from 'drizzle-orm';
import { formatCOP } from '$lib/utils/currency';
import { fail } from '@sveltejs/kit';

const CATEGORY_LABELS: Record<string, string> = {
	rent: 'Arriendo',
	payroll: 'Nómina',
	supplier: 'Proveedor',
	utilities: 'Servicios',
	other: 'Otro',
};

export const load: PageServerLoad = async ({ url }) => {
	const month = url.searchParams.get('mes') ?? new Date().toISOString().slice(0, 7);
	const category = url.searchParams.get('categoria') ?? '';

	const [year, mon] = month.split('-').map(Number);
	const start = new Date(year, mon - 1, 1).toISOString().slice(0, 10);
	const end = new Date(year, mon, 0).toISOString().slice(0, 10);

	const rows = await db
		.select()
		.from(expenses)
		.where(
			and(
				gte(expenses.date, start),
				lte(expenses.date, end),
				category ? eq(expenses.category, category as typeof expenses.category._.data) : undefined
			)
		)
		.orderBy(desc(expenses.date));

	const totalRow = await db
		.select({ total: sum(expenses.amount) })
		.from(expenses)
		.where(and(gte(expenses.date, start), lte(expenses.date, end)));

	return {
		expenses: rows.map((e) => ({
			...e,
			amountFormatted: formatCOP(Number(e.amount)),
			categoryLabel: CATEGORY_LABELS[e.category] ?? e.category,
		})),
		monthTotal: formatCOP(Number(totalRow[0]?.total ?? 0)),
		month,
		category,
		categoryLabels: CATEGORY_LABELS,
	};
};

export const actions: Actions = {
	create: async ({ request }) => {
		const data = await request.formData();
		const description = data.get('description')?.toString().trim() ?? '';
		const amount = Number(data.get('amount'));
		const category = data.get('category')?.toString() ?? '';
		const date = data.get('date')?.toString() ?? '';
		const notes = data.get('notes')?.toString().trim() || null;

		if (!description) return fail(400, { message: 'La descripción es obligatoria.' });
		if (!amount || amount <= 0) return fail(400, { message: 'El monto debe ser mayor a 0.' });
		if (!category) return fail(400, { message: 'Selecciona una categoría.' });
		if (!date) return fail(400, { message: 'La fecha es obligatoria.' });

		await db.insert(expenses).values({
			id: crypto.randomUUID(),
			description,
			amount: String(amount),
			category: category as typeof expenses.category._.data,
			date,
			notes,
		});
	},
};
