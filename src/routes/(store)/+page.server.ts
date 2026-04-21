import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { products, productImages } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { formatCOP } from '$lib/utils/currency';

export const load: PageServerLoad = async () => {
	const featuredProducts = await db
		.select({
			id: products.id,
			name: products.name,
			slug: products.slug,
			basePrice: products.basePrice,
		})
		.from(products)
		.where(and(eq(products.isActive, true), eq(products.isFeatured, true)))
		.limit(8);

	const primaryImages = await db
		.select({ productId: productImages.productId, url: productImages.url })
		.from(productImages)
		.where(eq(productImages.isPrimary, true));

	const imageMap = new Map(primaryImages.map((img) => [img.productId, img.url]));

	const featured = featuredProducts.map((p) => ({
		...p,
		price: formatCOP(Number(p.basePrice)),
		primaryImage: imageMap.get(p.id) ?? null,
	}));

	return { featured };
};
