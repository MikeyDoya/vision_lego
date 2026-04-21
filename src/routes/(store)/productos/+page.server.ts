import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { products, productVariants, productImages, brands } from '$lib/server/db/schema';
import { eq, and, gte, lte, inArray, sql } from 'drizzle-orm';

export const load: PageServerLoad = async ({ url }) => {
	const category = url.searchParams.get('categoria') ?? '';
	const brandId = url.searchParams.get('marca') ?? '';
	const gender = url.searchParams.get('genero') ?? '';
	const color = url.searchParams.get('color') ?? '';
	const material = url.searchParams.get('material') ?? '';
	const minPrice = url.searchParams.get('precioMin') ? Number(url.searchParams.get('precioMin')) : null;
	const maxPrice = url.searchParams.get('precioMax') ? Number(url.searchParams.get('precioMax')) : null;
	const sort = url.searchParams.get('orden') ?? 'newest';

	// Sub-query: product IDs that have at least one active variant with stock > 0
	const inStockIds = await db
		.selectDistinct({ productId: productVariants.productId })
		.from(productVariants)
		.where(and(eq(productVariants.isActive, true), gte(productVariants.stock, 1)));

	const inStockProductIds = inStockIds.map((r) => r.productId);

	if (inStockProductIds.length === 0) {
		const allBrands = await db.select({ id: brands.id, name: brands.name }).from(brands);
		return { products: [], brands: allBrands, filters: { category, brandId, gender, color, material, minPrice, maxPrice, sort } };
	}

	// Build where conditions
	const conditions = [
		eq(products.isActive, true),
		inArray(products.id, inStockProductIds),
	];

	if (category) {
		conditions.push(eq(products.category, category as 'sunglasses' | 'optical'));
	}
	if (brandId) {
		conditions.push(eq(products.brandId, brandId));
	}
	if (gender) {
		conditions.push(eq(products.gender, gender));
	}
	if (minPrice !== null) {
		conditions.push(gte(products.basePrice, String(minPrice)));
	}
	if (maxPrice !== null) {
		conditions.push(lte(products.basePrice, String(maxPrice)));
	}

	// Fetch products with optional color/material filter applied at variant level
	let productRows = await db
		.select({
			id: products.id,
			name: products.name,
			slug: products.slug,
			basePrice: products.basePrice,
			category: products.category,
			gender: products.gender,
			isFeatured: products.isFeatured,
			createdAt: products.createdAt,
			brandId: products.brandId,
		})
		.from(products)
		.where(and(...conditions));

	// Filter by color/material at variant level if requested
	if (color || material) {
		const variantConditions = [eq(productVariants.isActive, true), gte(productVariants.stock, 1)];
		if (color) variantConditions.push(sql`lower(${productVariants.color}) = lower(${color})`);
		if (material) variantConditions.push(sql`lower(${productVariants.material}) = lower(${material})`);

		const matchingVariants = await db
			.selectDistinct({ productId: productVariants.productId })
			.from(productVariants)
			.where(and(...variantConditions));

		const matchingIds = new Set(matchingVariants.map((v) => v.productId));
		productRows = productRows.filter((p) => matchingIds.has(p.id));
	}

	// Sort
	if (sort === 'price-asc') {
		productRows.sort((a, b) => Number(a.basePrice) - Number(b.basePrice));
	} else if (sort === 'price-desc') {
		productRows.sort((a, b) => Number(b.basePrice) - Number(a.basePrice));
	} else if (sort === 'featured') {
		productRows.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
	} else {
		// newest
		productRows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
	}

	// Fetch primary images for all resulting products
	const ids = productRows.map((p) => p.id);
	const primaryImages = ids.length
		? await db
				.select({ productId: productImages.productId, url: productImages.url })
				.from(productImages)
				.where(and(eq(productImages.isPrimary, true), inArray(productImages.productId, ids)))
		: [];

	const imageMap = new Map(primaryImages.map((img) => [img.productId, img.url]));

	const allBrands = await db.select({ id: brands.id, name: brands.name }).from(brands);

	const result = productRows.map((p) => ({
		id: p.id,
		name: p.name,
		slug: p.slug,
		basePrice: Number(p.basePrice),
		category: p.category,
		gender: p.gender,
		isFeatured: p.isFeatured,
		primaryImage: imageMap.get(p.id) ?? null,
	}));

	return {
		products: result,
		brands: allBrands,
		filters: { category, brandId, gender, color, material, minPrice, maxPrice, sort },
	};
};
