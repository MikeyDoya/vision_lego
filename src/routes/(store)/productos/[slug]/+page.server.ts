import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { products, productVariants, productImages, cartItems, wishlistItems } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { error, redirect, fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	const product = await db.query.products.findFirst({
		where: eq(products.slug, params.slug),
		with: {
			variants: true,
			images: true,
		},
	});

	if (!product || !product.isActive) {
		error(404, 'Producto no encontrado');
	}

	// Check wishlist status if logged in
	let isWishlisted = false;
	if (locals.user) {
		const wish = await db
			.select()
			.from(wishlistItems)
			.where(and(eq(wishlistItems.userId, locals.user.id), eq(wishlistItems.productId, product.id)))
			.limit(1);
		isWishlisted = wish.length > 0;
	}

	const activeVariants = product.variants.filter((v) => v.isActive);
	const sortedImages = [...product.images].sort((a, b) => a.position - b.position);

	return {
		product: {
			id: product.id,
			name: product.name,
			slug: product.slug,
			description: product.description,
			category: product.category,
			gender: product.gender,
			basePrice: Number(product.basePrice),
		},
		variants: activeVariants.map((v) => ({
			id: v.id,
			color: v.color,
			size: v.size,
			material: v.material,
			sku: v.sku,
			price: v.price ? Number(v.price) : null,
			stock: v.stock,
		})),
		images: sortedImages.map((img) => ({
			id: img.id,
			url: img.url,
			altText: img.altText,
			isPrimary: img.isPrimary,
			variantId: img.variantId,
		})),
		isWishlisted,
		user: locals.user ?? null,
	};
};

export const actions: Actions = {
	addToCart: async ({ request, locals }) => {
		if (!locals.user) {
			redirect(302, '/iniciar-sesion');
		}

		const data = await request.formData();
		const variantId = data.get('variantId') as string;
		const quantity = Number(data.get('quantity') ?? 1);

		if (!variantId) return fail(400, { error: 'Selecciona una variante' });

		const variant = await db
			.select()
			.from(productVariants)
			.where(and(eq(productVariants.id, variantId), eq(productVariants.isActive, true)))
			.limit(1);

		if (!variant.length || variant[0].stock < quantity) {
			return fail(400, { error: 'Variante no disponible o sin stock' });
		}

		// Check if already in cart — update quantity instead
		const existing = await db
			.select()
			.from(cartItems)
			.where(and(eq(cartItems.userId, locals.user.id), eq(cartItems.variantId, variantId)))
			.limit(1);

		if (existing.length) {
			await db
				.update(cartItems)
				.set({ quantity: existing[0].quantity + quantity })
				.where(eq(cartItems.id, existing[0].id));
		} else {
			await db.insert(cartItems).values({
				id: crypto.randomUUID(),
				userId: locals.user.id,
				variantId,
				quantity,
			});
		}

		return { success: true };
	},

	toggleWishlist: async ({ request, locals }) => {
		if (!locals.user) {
			redirect(302, '/iniciar-sesion');
		}

		const data = await request.formData();
		const productId = data.get('productId') as string;

		if (!productId) return fail(400, { error: 'ID de producto requerido' });

		const existing = await db
			.select()
			.from(wishlistItems)
			.where(and(eq(wishlistItems.userId, locals.user.id), eq(wishlistItems.productId, productId)))
			.limit(1);

		if (existing.length) {
			await db
				.delete(wishlistItems)
				.where(and(eq(wishlistItems.userId, locals.user.id), eq(wishlistItems.productId, productId)));
		} else {
			await db.insert(wishlistItems).values({
				userId: locals.user.id,
				productId,
			});
		}

		return { success: true };
	},
};
