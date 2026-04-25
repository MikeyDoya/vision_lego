import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { productVariants, products } from '$lib/server/db/schema';
import { eq, lte, asc } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ url }) => {
	const onlyLow = url.searchParams.get('bajostock') === '1';
	const threshold = 3;

	const rows = await db
		.select({
			id: productVariants.id,
			productId: productVariants.productId,
			productName: products.name,
			color: productVariants.color,
			size: productVariants.size,
			material: productVariants.material,
			sku: productVariants.sku,
			stock: productVariants.stock,
			isActive: productVariants.isActive,
		})
		.from(productVariants)
		.innerJoin(products, eq(productVariants.productId, products.id))
		.where(
			onlyLow
				? lte(productVariants.stock, threshold)
				: undefined
		)
		.orderBy(asc(productVariants.stock), asc(products.name));

	return { variants: rows, onlyLow, threshold };
};

export const actions: Actions = {
	updateStock: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		const stock = Number(data.get('stock'));
		if (!id) return fail(400, { message: 'ID requerido' });
		if (isNaN(stock) || stock < 0) return fail(400, { message: 'Stock inválido' });
		await db.update(productVariants).set({ stock }).where(eq(productVariants.id, id));
	},

	updateVariant: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		if (!id) return fail(400, { message: 'ID requerido' });
		const color = data.get('color')?.toString().trim() || null;
		const size = data.get('size')?.toString().trim() || null;
		const material = data.get('material')?.toString().trim() || null;
		const sku = data.get('sku')?.toString().trim() || null;
		const stock = Number(data.get('stock') ?? 0);
		if (isNaN(stock) || stock < 0) return fail(400, { message: 'Stock inválido' });
		await db.update(productVariants).set({ color, size, material, sku, stock }).where(eq(productVariants.id, id));
	},
};
