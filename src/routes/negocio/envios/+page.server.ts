import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { shippingMethods } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { formatCOP } from '$lib/utils/currency';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const rows = await db.select().from(shippingMethods).orderBy(shippingMethods.name);
	return {
		methods: rows.map((m) => ({ ...m, costFormatted: formatCOP(Number(m.cost)) })),
	};
};

export const actions: Actions = {
	create: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name')?.toString().trim() ?? '';
		const description = data.get('description')?.toString().trim() || null;
		const cost = Number(data.get('cost'));

		if (!name) return fail(400, { message: 'El nombre es obligatorio.' });
		if (isNaN(cost) || cost < 0) return fail(400, { message: 'El costo debe ser 0 o mayor.' });

		await db.insert(shippingMethods).values({
			id: crypto.randomUUID(),
			name,
			description,
			cost: String(cost),
		});
	},

	update: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		const cost = Number(data.get('cost'));

		if (!id) return fail(400, { message: 'ID requerido' });
		if (isNaN(cost) || cost < 0) return fail(400, { message: 'Costo inválido' });

		await db.update(shippingMethods).set({ cost: String(cost) }).where(eq(shippingMethods.id, id));
	},

	toggleActive: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		const current = data.get('isActive') === 'true';
		if (!id) return fail(400, { message: 'ID requerido' });
		await db.update(shippingMethods).set({ isActive: !current }).where(eq(shippingMethods.id, id));
	},
};
