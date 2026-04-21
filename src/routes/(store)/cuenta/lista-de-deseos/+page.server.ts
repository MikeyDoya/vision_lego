import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { wishlistItems, products, productImages, productVariants } from '$lib/server/db/schema';
import { eq, and, gte, inArray } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(302, '/iniciar-sesion');
	}

	const user = locals.user as { id: string };

	const wished = await db
		.select({
			productId: wishlistItems.productId,
			addedAt: wishlistItems.addedAt,
			name: products.name,
			slug: products.slug,
			basePrice: products.basePrice,
			isActive: products.isActive,
		})
		.from(wishlistItems)
		.innerJoin(products, eq(wishlistItems.productId, products.id))
		.where(eq(wishlistItems.userId, user.id));

	if (!wished.length) return { items: [] };

	const productIds = wished.map((w) => w.productId);

	// Check which have stock
	const inStockIds = await db
		.selectDistinct({ productId: productVariants.productId })
		.from(productVariants)
		.where(and(eq(productVariants.isActive, true), gte(productVariants.stock, 1), inArray(productVariants.productId, productIds)));

	const inStockSet = new Set(inStockIds.map((r) => r.productId));

	const primaryImages = await db
		.select({ productId: productImages.productId, url: productImages.url })
		.from(productImages)
		.where(and(eq(productImages.isPrimary, true), inArray(productImages.productId, productIds)));

	const imageMap = new Map(primaryImages.map((img) => [img.productId, img.url]));

	return {
		items: wished.map((w) => ({
			productId: w.productId,
			name: w.name,
			slug: w.slug,
			basePrice: Number(w.basePrice),
			isActive: w.isActive,
			hasStock: inStockSet.has(w.productId),
			primaryImage: imageMap.get(w.productId) ?? null,
		})),
	};
};

export const actions: Actions = {
	remove: async ({ request, locals }) => {
		if (!locals.user) redirect(302, '/iniciar-sesion');

		const data = await request.formData();
		const productId = data.get('productId') as string;
		const user = locals.user as { id: string };

		await db
			.delete(wishlistItems)
			.where(and(eq(wishlistItems.userId, user.id), eq(wishlistItems.productId, productId)));

		return { success: true };
	},
};
