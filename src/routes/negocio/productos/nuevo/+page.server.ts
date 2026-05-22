import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { products, brands } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { toSlug } from '$lib/utils/slug';

export const load: PageServerLoad = async () => {
	const allBrands = await db.select({ id: brands.id, name: brands.name }).from(brands).orderBy(brands.name);
	return { brands: allBrands };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();

		const name = data.get('name')?.toString().trim() ?? '';
		const description = data.get('description')?.toString().trim() ?? '';
		const category = data.get('category')?.toString() ?? '';
		const brandId = data.get('brandId')?.toString() || null;
		const gender = data.get('gender')?.toString() || null;
		const basePrice = Number(data.get('basePrice'));
		const newBrandName = data.get('newBrandName')?.toString().trim() ?? '';
		const isOnSale = data.get('isOnSale') === 'true';
		const discountRaw = data.get('discountPercent')?.toString().trim();
		const discountParsed = discountRaw ? parseInt(discountRaw, 10) : null;
		const discountPercent = discountParsed !== null && !isNaN(discountParsed)
			? Math.min(100, Math.max(0, discountParsed))
			: null;

		if (!name) return fail(400, { message: 'El nombre es obligatorio.' });
		if (!category || !['sunglasses', 'optical', 'accessories'].includes(category)) {
			return fail(400, { message: 'Selecciona una categoría.' });
		}
		if (!basePrice || basePrice <= 0) return fail(400, { message: 'El precio base debe ser mayor a 0.' });

		let resolvedBrandId: string | null = brandId;

		if (newBrandName && !brandId) {
			const existing = await db.select({ id: brands.id }).from(brands)
				.where(eq(brands.slug, toSlug(newBrandName))).limit(1);

			if (existing.length > 0) {
				resolvedBrandId = existing[0].id;
			} else {
				const newBrand = await db
					.insert(brands)
					.values({ id: crypto.randomUUID(), name: newBrandName, slug: toSlug(newBrandName) })
					.returning({ id: brands.id });
				resolvedBrandId = newBrand[0].id;
			}
		}

		const slug = toSlug(name);
		const id = crypto.randomUUID();

		try {
			await db.insert(products).values({
				id,
				name,
				slug,
				description: description || null,
				category: category as 'sunglasses' | 'optical' | 'accessories',
				brandId: resolvedBrandId,
				gender,
				basePrice: String(basePrice),
				isOnSale,
				discountPercent,
			});
		} catch {
			return fail(400, { message: 'Ya existe un producto con ese nombre.' });
		}

		redirect(302, `/negocio/productos/${id}`);
	},
};
