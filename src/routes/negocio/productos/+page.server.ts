import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { products, brands, productVariants } from '$lib/server/db/schema';
import { eq, ilike, and, sum, sql } from 'drizzle-orm';
import { formatCOP } from '$lib/utils/currency';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ url }) => {
	const search = url.searchParams.get('q') ?? '';
	const category = url.searchParams.get('categoria') ?? '';

	const rows = await db
		.select({
			id: products.id,
			name: products.name,
			slug: products.slug,
			category: products.category,
			basePrice: products.basePrice,
			isActive: products.isActive,
			isFeatured: products.isFeatured,
			brandName: brands.name,
			totalStock: sql<number>`coalesce(sum(${productVariants.stock}), 0)`.as('total_stock'),
		})
		.from(products)
		.leftJoin(brands, eq(products.brandId, brands.id))
		.leftJoin(productVariants, eq(productVariants.productId, products.id))
		.where(
			and(
				search ? ilike(products.name, `%${search}%`) : undefined,
				category ? eq(products.category, category as 'sunglasses' | 'optical') : undefined
			)
		)
		.groupBy(products.id, brands.name)
		.orderBy(products.createdAt);

	return {
		products: rows.map((p) => ({
			...p,
			basePriceFormatted: formatCOP(Number(p.basePrice)),
		})),
		search,
		category,
	};
};

export const actions: Actions = {
	toggleActive: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		const current = data.get('isActive') === 'true';
		if (!id) return fail(400, { message: 'ID requerido' });
		await db.update(products).set({ isActive: !current, updatedAt: new Date() }).where(eq(products.id, id));
	},
	toggleFeatured: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		const current = data.get('isFeatured') === 'true';
		if (!id) return fail(400, { message: 'ID requerido' });
		await db.update(products).set({ isFeatured: !current, updatedAt: new Date() }).where(eq(products.id, id));
	},
};
