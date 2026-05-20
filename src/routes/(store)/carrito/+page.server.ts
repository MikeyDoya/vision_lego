import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { cartItems, productVariants, products, productImages } from '$lib/server/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { readGuestCart, writeGuestCart } from '$lib/server/cartCookie';

export const load: PageServerLoad = async ({ locals, cookies }) => {
	if (locals.user) {
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

		return { cart: cartData, total: cartData.reduce((sum, i) => sum + i.subtotal, 0) };
	}

	// Guest cart from cookie
	const guestCart = readGuestCart(cookies);
	if (!guestCart.length) return { cart: [], total: 0 };

	const variantIds = guestCart.map((i) => i.variantId);
	const rows = await db
		.select({
			variantId: productVariants.id,
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
		.from(productVariants)
		.innerJoin(products, eq(productVariants.productId, products.id))
		.where(inArray(productVariants.id, variantIds));

	const productIds = [...new Set(rows.map((r) => r.productId))];
	const primaryImages = productIds.length
		? await db
				.select({ productId: productImages.productId, url: productImages.url })
				.from(productImages)
				.where(and(eq(productImages.isPrimary, true), inArray(productImages.productId, productIds)))
		: [];
	const imageMap = new Map(primaryImages.map((img) => [img.productId, img.url]));

	const cartData = guestCart.flatMap((guestItem) => {
		const row = rows.find((r) => r.variantId === guestItem.variantId);
		if (!row) return [];
		const unitPrice = row.variantPrice ? Number(row.variantPrice) : Number(row.basePrice);
		const variantParts = [row.variantColor, row.variantSize, row.variantMaterial].filter(Boolean);
		return [{
			cartItemId: guestItem.variantId, // variantId doubles as item ID for guests
			variantId: guestItem.variantId,
			productId: row.productId,
			productName: row.productName,
			productSlug: row.productSlug,
			variantLabel: variantParts.join(' / '),
			unitPrice,
			quantity: guestItem.quantity,
			subtotal: unitPrice * guestItem.quantity,
			stock: row.variantStock,
			primaryImage: imageMap.get(row.productId) ?? null,
		}];
	});

	return { cart: cartData, total: cartData.reduce((sum, i) => sum + i.subtotal, 0) };
};

export const actions: Actions = {
	updateQuantity: async ({ request, locals, cookies }) => {
		const data = await request.formData();
		const cartItemId = data.get('cartItemId') as string;
		const quantity = Number(data.get('quantity'));

		if (!cartItemId || isNaN(quantity) || quantity < 1) return fail(400, { error: 'Datos inválidos' });

		if (locals.user) {
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
		} else {
			// For guests, cartItemId === variantId
			const variant = await db
				.select({ stock: productVariants.stock })
				.from(productVariants)
				.where(eq(productVariants.id, cartItemId))
				.limit(1);

			if (!variant.length || quantity > variant[0].stock) {
				return fail(400, { error: 'Stock insuficiente' });
			}

			const cart = readGuestCart(cookies);
			const idx = cart.findIndex((i) => i.variantId === cartItemId);
			if (idx < 0) return fail(404, { error: 'Ítem no encontrado' });
			cart[idx].quantity = quantity;
			writeGuestCart(cookies, cart);
		}

		return { success: true };
	},

	removeItem: async ({ request, locals, cookies }) => {
		const data = await request.formData();
		const cartItemId = data.get('cartItemId') as string;

		console.log('[removeItem] cartItemId received:', JSON.stringify(cartItemId));

		if (!cartItemId) return fail(400, { error: 'Datos inválidos' });

		if (locals.user) {
			await db
				.delete(cartItems)
				.where(and(eq(cartItems.id, cartItemId), eq(cartItems.userId, locals.user.id)));
		} else {
			const rawCookie = cookies.get('guest_cart');
			console.log('[removeItem] raw cookie:', JSON.stringify(rawCookie));
			const cart = readGuestCart(cookies);
			console.log('[removeItem] parsed cart:', JSON.stringify(cart));
			const next = cart.filter((i) => i.variantId !== cartItemId);
			console.log('[removeItem] filtered array to write:', JSON.stringify(next));
			writeGuestCart(cookies, next);
			console.log('[removeItem] done');
		}

		return { success: true };
	},
};
