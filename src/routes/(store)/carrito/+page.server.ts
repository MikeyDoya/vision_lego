import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { cartItems, productVariants, products, productImages } from '$lib/server/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { redirect, fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(302, '/iniciar-sesion');
	}

	const items = await db
		.select({
			cartItemId: cartItems.id,
			quantity: cartItems.quantity,
			variantId: cartItems.variantId,
			variantColor: productVariants.color,
			variantSize: productVariants.size,
			variantMaterial: productVariants.material,
			variantPrice: productVariants.price,
			variantStock: productVariants.stock,
			productId: products.id,
			productName: products.name,
			productSlug: products.slug,
			basePrice: products.basePrice,
		})
		.from(cartItems)
		.innerJoin(productVariants, eq(cartItems.variantId, productVariants.id))
		.innerJoin(products, eq(productVariants.productId, products.id))
		.where(eq(cartItems.userId, locals.user.id));

	// Fetch primary images for cart products
	const productIds = [...new Set(items.map((i) => i.productId))];
	const primaryImages = productIds.length
		? await db
				.select({ productId: productImages.productId, url: productImages.url })
				.from(productImages)
				.where(and(eq(productImages.isPrimary, true), inArray(productImages.productId, productIds)))
		: [];

	const imageMap = new Map(primaryImages.map((img) => [img.productId, img.url]));

	const cartData = items.map((item) => {
		const unitPrice = item.variantPrice ? Number(item.variantPrice) : Number(item.basePrice);
		const variantParts = [item.variantColor, item.variantSize, item.variantMaterial].filter(Boolean);
		return {
			cartItemId: item.cartItemId,
			variantId: item.variantId,
			productId: item.productId,
			productName: item.productName,
			productSlug: item.productSlug,
			variantLabel: variantParts.join(' / '),
			unitPrice,
			quantity: item.quantity,
			subtotal: unitPrice * item.quantity,
			stock: item.variantStock,
			primaryImage: imageMap.get(item.productId) ?? null,
		};
	});

	const total = cartData.reduce((sum, item) => sum + item.subtotal, 0);

	return { cart: cartData, total };
};

export const actions: Actions = {
	updateQuantity: async ({ request, locals }) => {
		if (!locals.user) redirect(302, '/iniciar-sesion');

		const data = await request.formData();
		const cartItemId = data.get('cartItemId') as string;
		const quantity = Number(data.get('quantity'));

		if (!cartItemId || isNaN(quantity) || quantity < 1) return fail(400, { error: 'Datos inválidos' });

		// Verify ownership
		const item = await db
			.select({ id: cartItems.id, variantId: cartItems.variantId })
			.from(cartItems)
			.where(and(eq(cartItems.id, cartItemId), eq(cartItems.userId, locals.user.id)))
			.limit(1);

		if (!item.length) return fail(404, { error: 'Ítem no encontrado' });

		const variant = await db
			.select({ stock: productVariants.stock })
			.from(productVariants)
			.where(eq(productVariants.id, item[0].variantId))
			.limit(1);

		if (!variant.length || quantity > variant[0].stock) {
			return fail(400, { error: 'Stock insuficiente' });
		}

		await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, cartItemId));

		return { success: true };
	},

	removeItem: async ({ request, locals }) => {
		if (!locals.user) redirect(302, '/iniciar-sesion');

		const data = await request.formData();
		const cartItemId = data.get('cartItemId') as string;

		await db
			.delete(cartItems)
			.where(and(eq(cartItems.id, cartItemId), eq(cartItems.userId, locals.user.id)));

		return { success: true };
	},
};
