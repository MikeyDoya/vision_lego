import { fail, redirect, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { products, brands, productVariants, productImages } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { toSlug } from '$lib/utils/slug';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export const load: PageServerLoad = async ({ params }) => {
	const product = await db.query.products.findFirst({
		where: eq(products.id, params.id),
		with: {
			variants: { orderBy: (v, { asc }) => [asc(v.color)] },
			images: { orderBy: (i, { asc }) => [asc(i.position)] },
		},
	});
	if (!product) error(404, 'Producto no encontrado');

	const allBrands = await db.select({ id: brands.id, name: brands.name }).from(brands).orderBy(brands.name);

	return { product, brands: allBrands };
};

export const actions: Actions = {
	updateProduct: async ({ request, params }) => {
		const data = await request.formData();

		const name = data.get('name')?.toString().trim() ?? '';
		const description = data.get('description')?.toString().trim() ?? '';
		const category = data.get('category')?.toString() ?? '';
		const brandId = data.get('brandId')?.toString() || null;
		const gender = data.get('gender')?.toString() || null;
		const basePrice = Number(data.get('basePrice'));
		const isActive = data.get('isActive') === 'true';
		const isFeatured = data.get('isFeatured') === 'true';

		if (!name) return fail(400, { message: 'El nombre es obligatorio.' });
		if (!basePrice || basePrice <= 0) return fail(400, { message: 'El precio base debe ser mayor a 0.' });

		await db.update(products).set({
			name,
			slug: toSlug(name),
			description: description || null,
			category: category as 'sunglasses' | 'optical',
			brandId,
			gender,
			basePrice: String(basePrice),
			isActive,
			isFeatured,
			updatedAt: new Date(),
		}).where(eq(products.id, params.id));
	},

	addVariant: async ({ request, params }) => {
		const data = await request.formData();
		const color = data.get('color')?.toString().trim() || null;
		const size = data.get('size')?.toString().trim() || null;
		const material = data.get('material')?.toString().trim() || null;
		const sku = data.get('sku')?.toString().trim() || null;
		const priceRaw = data.get('price')?.toString();
		const price = priceRaw ? String(Number(priceRaw)) : null;
		const stock = Number(data.get('stock') ?? 0);

		await db.insert(productVariants).values({
			id: crypto.randomUUID(),
			productId: params.id,
			color,
			size,
			material,
			sku,
			price,
			stock,
		});
	},

	deleteVariant: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		if (!id) return fail(400, { message: 'ID requerido' });
		await db.delete(productVariants).where(eq(productVariants.id, id));
	},

	updateStock: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		const stock = Number(data.get('stock'));
		if (!id) return fail(400, { message: 'ID requerido' });
		await db.update(productVariants).set({ stock }).where(eq(productVariants.id, id));
	},

	uploadImages: async ({ request, params }) => {
		const data = await request.formData();
		const files = data.getAll('images') as File[];

		const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
		const maxSize = 5 * 1024 * 1024;

		const uploadDir = join('static', 'uploads', 'products', params.id);
		await mkdir(uploadDir, { recursive: true });

		const existing = await db
			.select({ position: productImages.position })
			.from(productImages)
			.where(eq(productImages.productId, params.id))
			.orderBy(productImages.position);

		let nextPosition = existing.length > 0 ? Math.max(...existing.map((e) => e.position)) + 1 : 0;
		const hasPrimary = existing.length > 0;

		for (const file of files) {
			if (!validTypes.includes(file.type)) continue;
			if (file.size > maxSize) continue;

			const ext = file.name.split('.').pop() ?? 'jpg';
			const filename = `${crypto.randomUUID()}.${ext}`;
			const filePath = join(uploadDir, filename);

			const buffer = Buffer.from(await file.arrayBuffer());
			await writeFile(filePath, buffer);

			const url = `/uploads/products/${params.id}/${filename}`;
			const isPrimary = !hasPrimary && nextPosition === 0;

			await db.insert(productImages).values({
				id: crypto.randomUUID(),
				productId: params.id,
				url,
				altText: null,
				position: nextPosition,
				isPrimary,
			});
			nextPosition++;
		}
	},

	setPrimaryImage: async ({ request }) => {
		const data = await request.formData();
		const imageId = data.get('imageId')?.toString();
		const productId = data.get('productId')?.toString();
		if (!imageId || !productId) return fail(400, { message: 'Datos incompletos' });

		await db.update(productImages).set({ isPrimary: false }).where(eq(productImages.productId, productId));
		await db.update(productImages).set({ isPrimary: true }).where(eq(productImages.id, imageId));
	},

	deleteImage: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		if (!id) return fail(400, { message: 'ID requerido' });
		await db.delete(productImages).where(eq(productImages.id, id));
	},
};
