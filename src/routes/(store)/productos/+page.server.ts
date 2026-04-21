import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { products, productVariants, productImages, brands } from '$lib/server/db/schema';
import { eq, and, gte, lte, inArray, sql, isNotNull } from 'drizzle-orm';

export const load: PageServerLoad = async ({ url }) => {
	const category = url.searchParams.get('categoria') ?? '';
	const brandId = url.searchParams.get('marca') ?? '';
	const gender = url.searchParams.get('genero') ?? '';
	const color = url.searchParams.get('color') ?? '';
	const material = url.searchParams.get('material') ?? '';
	const size = url.searchParams.get('talla') ?? '';
	const minPrice = url.searchParams.get('precioMin') ? Number(url.searchParams.get('precioMin')) : null;
	const maxPrice = url.searchParams.get('precioMax') ? Number(url.searchParams.get('precioMax')) : null;
	const sort = url.searchParams.get('orden') ?? 'newest';

	// Sub-query: product IDs that have at least one active variant with stock > 0
	const inStockIds = await db
		.selectDistinct({ productId: productVariants.productId })
		.from(productVariants)
		.where(and(eq(productVariants.isActive, true), gte(productVariants.stock, 1)));

	const inStockProductIds = inStockIds.map((r) => r.productId);

	// Load distinct filter options from active in-stock variants
	const [allBrands, colorRows, materialRows, sizeRows] = await Promise.all([
		db.select({ id: brands.id, name: brands.name }).from(brands),
		db
			.selectDistinct({ color: productVariants.color })
			.from(productVariants)
			.where(and(eq(productVariants.isActive, true), gte(productVariants.stock, 1), isNotNull(productVariants.color)))
			.orderBy(productVariants.color),
		db
			.selectDistinct({ material: productVariants.material })
			.from(productVariants)
			.where(and(eq(productVariants.isActive, true), gte(productVariants.stock, 1), isNotNull(productVariants.material)))
			.orderBy(productVariants.material),
		db
			.selectDistinct({ size: productVariants.size })
			.from(productVariants)
			.where(and(eq(productVariants.isActive, true), gte(productVariants.stock, 1), isNotNull(productVariants.size)))
			.orderBy(productVariants.size),
	]);

	const distinctColors = colorRows.map((r) => r.color!).filter(Boolean);
	const distinctMaterials = materialRows.map((r) => r.material!).filter(Boolean);
	const distinctSizes = sizeRows.map((r) => r.size!).filter(Boolean);

	if (inStockProductIds.length === 0) {
		return {
			products: [],
			brands: allBrands,
			distinctColors,
			distinctMaterials,
			distinctSizes,
			filters: { category, brandId, gender, color, material, size, minPrice, maxPrice, sort },
		};
	}

	// Build where conditions
	const conditions = [
		eq(products.isActive, true),
		inArray(products.id, inStockProductIds),
	];

	if (category) conditions.push(eq(products.category, category as 'sunglasses' | 'optical'));
	if (brandId) conditions.push(eq(products.brandId, brandId));
	if (gender) conditions.push(eq(products.gender, gender));
	if (minPrice !== null) conditions.push(gte(products.basePrice, String(minPrice)));
	if (maxPrice !== null) conditions.push(lte(products.basePrice, String(maxPrice)));

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
		})
		.from(products)
		.where(and(...conditions));

	// Filter by color/material/size at variant level if requested
	if (color || material || size) {
		const variantConditions = [eq(productVariants.isActive, true), gte(productVariants.stock, 1)];
		if (color) variantConditions.push(sql`lower(${productVariants.color}) = lower(${color})`);
		if (material) variantConditions.push(sql`lower(${productVariants.material}) = lower(${material})`);
		if (size) variantConditions.push(sql`lower(${productVariants.size}) = lower(${size})`);

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
		productRows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
	}

	const ids = productRows.map((p) => p.id);
	const primaryImages = ids.length
		? await db
				.select({ productId: productImages.productId, url: productImages.url })
				.from(productImages)
				.where(and(eq(productImages.isPrimary, true), inArray(productImages.productId, ids)))
		: [];

	const imageMap = new Map(primaryImages.map((img) => [img.productId, img.url]));

	return {
		products: productRows.map((p) => ({
			id: p.id,
			name: p.name,
			slug: p.slug,
			basePrice: Number(p.basePrice),
			category: p.category,
			gender: p.gender,
			isFeatured: p.isFeatured,
			primaryImage: imageMap.get(p.id) ?? null,
		})),
		brands: allBrands,
		distinctColors,
		distinctMaterials,
		distinctSizes,
		filters: { category, brandId, gender, color, material, size, minPrice, maxPrice, sort },
	};
};
