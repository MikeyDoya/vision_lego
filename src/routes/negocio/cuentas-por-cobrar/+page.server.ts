import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { receivables } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { formatCOP } from '$lib/utils/currency';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const rows = await db.select().from(receivables).orderBy(desc(receivables.createdAt));

	const today = new Date().toISOString().slice(0, 10);

	return {
		receivables: rows.map((r) => {
			const paid = Number(r.paidAmount);
			const total = Number(r.amount);
			const remaining = total - paid;
			const isOverdue = !r.isPaid && r.dueDate !== null && r.dueDate < today;
			const paymentStatus = r.isPaid ? 'paid' : paid > 0 ? 'partial' : 'pending';

			return {
				...r,
				amountFormatted: formatCOP(total),
				paidAmountFormatted: formatCOP(paid),
				remainingFormatted: formatCOP(remaining),
				paymentStatus,
				isOverdue,
			};
		}),
	};
};

export const actions: Actions = {
	create: async ({ request }) => {
		const data = await request.formData();
		const customerName = data.get('customerName')?.toString().trim() ?? '';
		const customerPhone = data.get('customerPhone')?.toString().trim() || null;
		const description = data.get('description')?.toString().trim() ?? '';
		const amount = Number(data.get('amount'));
		const dueDate = data.get('dueDate')?.toString() || null;

		if (!customerName) return fail(400, { message: 'El nombre del cliente es obligatorio.' });
		if (!description) return fail(400, { message: 'La descripción es obligatoria.' });
		if (!amount || amount <= 0) return fail(400, { message: 'El monto debe ser mayor a 0.' });

		await db.insert(receivables).values({
			id: crypto.randomUUID(),
			customerName,
			customerPhone,
			description,
			amount: String(amount),
			paidAmount: '0',
			dueDate,
		});
	},

	recordPayment: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		const payment = Number(data.get('payment'));

		if (!id) return fail(400, { message: 'ID requerido' });
		if (!payment || payment <= 0) return fail(400, { message: 'Monto inválido' });

		const existing = await db.select().from(receivables).where(eq(receivables.id, id)).limit(1);
		if (existing.length === 0) return fail(404, { message: 'No encontrado' });

		const rec = existing[0];
		const newPaid = Math.min(Number(rec.paidAmount) + payment, Number(rec.amount));
		const isPaid = newPaid >= Number(rec.amount);

		await db
			.update(receivables)
			.set({ paidAmount: String(newPaid), isPaid, updatedAt: new Date() })
			.where(eq(receivables.id, id));
	},
};
