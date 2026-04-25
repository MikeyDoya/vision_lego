import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import {
	cartItems, productVariants, products, shippingMethods, orders, orderItems,
} from '$lib/server/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { redirect, fail } from '@sveltejs/kit';
import { readGuestCart, writeGuestCart } from '$lib/server/cartCookie';

export const load: PageServerLoad = async ({ locals, cookies }) => {
	const availableShipping = await db
		.select()
		.from(shippingMethods)
		.where(eq(shippingMethods.isActive, true));

	const shippingData = availableShipping.map((s) => ({
		id: s.id,
		name: s.name,
		description: s.description,
		cost: Number(s.cost),
	}));

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
				productName: products.name,
				basePrice: products.basePrice,
			})
			.from(cartItems)
			.innerJoin(productVariants, eq(cartItems.variantId, productVariants.id))
			.innerJoin(products, eq(productVariants.productId, products.id))
			.where(eq(cartItems.userId, locals.user.id));

		if (!items.length) redirect(302, '/carrito');

		const cartData = items.map((item) => {
			const unitPrice = item.variantPrice ? Number(item.variantPrice) : Number(item.basePrice);
			const variantParts = [item.variantColor, item.variantSize, item.variantMaterial].filter(Boolean);
			return {
				cartItemId: item.cartItemId,
				variantId: item.variantId,
				productName: item.productName,
				variantLabel: variantParts.join(' / '),
				unitPrice,
				quantity: item.quantity,
				subtotal: unitPrice * item.quantity,
				stock: item.variantStock,
			};
		});

		return {
			cart: cartData,
			subtotal: cartData.reduce((sum, i) => sum + i.subtotal, 0),
			shipping: shippingData,
			user: { name: locals.user.name, email: locals.user.email },
		};
	}

	// Guest cart from cookie
	const guestCart = readGuestCart(cookies);
	if (!guestCart.length) redirect(302, '/carrito');

	const variantIds = guestCart.map((i) => i.variantId);
	const rows = await db
		.select({
			variantId: productVariants.id,
			variantColor: productVariants.color,
			variantSize: productVariants.size,
			variantMaterial: productVariants.material,
			variantPrice: productVariants.price,
			variantStock: productVariants.stock,
			productName: products.name,
			basePrice: products.basePrice,
		})
		.from(productVariants)
		.innerJoin(products, eq(productVariants.productId, products.id))
		.where(inArray(productVariants.id, variantIds));

	const cartData = guestCart.flatMap((guestItem) => {
		const row = rows.find((r) => r.variantId === guestItem.variantId);
		if (!row) return [];
		const unitPrice = row.variantPrice ? Number(row.variantPrice) : Number(row.basePrice);
		const variantParts = [row.variantColor, row.variantSize, row.variantMaterial].filter(Boolean);
		return [{
			cartItemId: guestItem.variantId,
			variantId: guestItem.variantId,
			productName: row.productName,
			variantLabel: variantParts.join(' / '),
			unitPrice,
			quantity: guestItem.quantity,
			subtotal: unitPrice * guestItem.quantity,
			stock: row.variantStock,
		}];
	});

	return {
		cart: cartData,
		subtotal: cartData.reduce((sum, i) => sum + i.subtotal, 0),
		shipping: shippingData,
		user: { name: '', email: '' },
	};
};

export const actions: Actions = {
	placeOrder: async ({ request, locals, cookies }) => {
		const data = await request.formData();
		const customerName = (data.get('nombre') as string)?.trim();
		const customerEmail = (data.get('email') as string)?.trim();
		const customerPhone = (data.get('telefono') as string)?.trim() || null;
		const shippingAddress = (data.get('direccion') as string)?.trim();
		const shippingCity = (data.get('ciudad') as string)?.trim();
		const shippingDept = (data.get('departamento') as string)?.trim();
		const shippingZip = (data.get('codigoPostal') as string)?.trim() || null;
		const shippingMethodId = (data.get('metodEnvio') as string)?.trim() || null;
		const notes = (data.get('notas') as string)?.trim() || null;

		if (!customerName || !customerEmail || !shippingAddress || !shippingCity || !shippingDept) {
			return fail(400, { error: 'Por favor completa todos los campos obligatorios' });
		}

		// Calculate shipping cost
		let shippingCost = 0;
		if (shippingMethodId) {
			const method = await db
				.select({ cost: shippingMethods.cost })
				.from(shippingMethods)
				.where(and(eq(shippingMethods.id, shippingMethodId), eq(shippingMethods.isActive, true)))
				.limit(1);
			if (method.length) shippingCost = Number(method[0].cost);
		}

		if (locals.user) {
			const cartData = await db
				.select({
					cartItemId: cartItems.id,
					quantity: cartItems.quantity,
					variantId: cartItems.variantId,
					variantColor: productVariants.color,
					variantSize: productVariants.size,
					variantMaterial: productVariants.material,
					variantPrice: productVariants.price,
					variantStock: productVariants.stock,
					productName: products.name,
					basePrice: products.basePrice,
				})
				.from(cartItems)
				.innerJoin(productVariants, eq(cartItems.variantId, productVariants.id))
				.innerJoin(products, eq(productVariants.productId, products.id))
				.where(eq(cartItems.userId, locals.user.id));

			if (!cartData.length) return fail(400, { error: 'Tu carrito está vacío' });

			for (const item of cartData) {
				if (item.quantity > item.variantStock) {
					return fail(400, { error: `Stock insuficiente para ${item.productName}` });
				}
			}

			const subtotal = cartData.reduce((sum, item) => {
				const unitPrice = item.variantPrice ? Number(item.variantPrice) : Number(item.basePrice);
				return sum + unitPrice * item.quantity;
			}, 0);

			const orderId = crypto.randomUUID();
			await db.insert(orders).values({
				id: orderId,
				userId: locals.user.id,
				customerName,
				customerEmail,
				customerPhone,
				shippingAddress,
				shippingCity,
				shippingDept,
				shippingZip,
				shippingMethodId: shippingMethodId || null,
				shippingCost: String(shippingCost),
				status: 'pending',
				total: String(subtotal + shippingCost),
				notes,
			});

			for (const item of cartData) {
				const unitPrice = item.variantPrice ? Number(item.variantPrice) : Number(item.basePrice);
				const variantParts = [item.variantColor, item.variantSize, item.variantMaterial].filter(Boolean);
				await db.insert(orderItems).values({
					id: crypto.randomUUID(),
					orderId,
					variantId: item.variantId,
					productName: item.productName,
					variantLabel: variantParts.join(' / ') || null,
					unitPrice: String(unitPrice),
					quantity: item.quantity,
					subtotal: String(unitPrice * item.quantity),
				});
			}

			await db.delete(cartItems).where(eq(cartItems.userId, locals.user.id));
			redirect(302, `/cuenta?pedido=${orderId}`);
		}

		// Guest order
		const guestCart = readGuestCart(cookies);
		if (!guestCart.length) return fail(400, { error: 'Tu carrito está vacío' });

		const variantIds = guestCart.map((i) => i.variantId);
		const rows = await db
			.select({
				variantId: productVariants.id,
				variantColor: productVariants.color,
				variantSize: productVariants.size,
				variantMaterial: productVariants.material,
				variantPrice: productVariants.price,
				variantStock: productVariants.stock,
				productName: products.name,
				basePrice: products.basePrice,
			})
			.from(productVariants)
			.innerJoin(products, eq(productVariants.productId, products.id))
			.where(inArray(productVariants.id, variantIds));

		for (const guestItem of guestCart) {
			const row = rows.find((r) => r.variantId === guestItem.variantId);
			if (!row || guestItem.quantity > row.variantStock) {
				return fail(400, { error: `Stock insuficiente${row ? ` para ${row.productName}` : ''}` });
			}
		}

		const subtotal = guestCart.reduce((sum, guestItem) => {
			const row = rows.find((r) => r.variantId === guestItem.variantId)!;
			const unitPrice = row.variantPrice ? Number(row.variantPrice) : Number(row.basePrice);
			return sum + unitPrice * guestItem.quantity;
		}, 0);

		const orderId = crypto.randomUUID();
		await db.insert(orders).values({
			id: orderId,
			userId: null,
			customerName,
			customerEmail,
			customerPhone,
			shippingAddress,
			shippingCity,
			shippingDept,
			shippingZip,
			shippingMethodId: shippingMethodId || null,
			shippingCost: String(shippingCost),
			status: 'pending',
			total: String(subtotal + shippingCost),
			notes,
		});

		for (const guestItem of guestCart) {
			const row = rows.find((r) => r.variantId === guestItem.variantId)!;
			const unitPrice = row.variantPrice ? Number(row.variantPrice) : Number(row.basePrice);
			const variantParts = [row.variantColor, row.variantSize, row.variantMaterial].filter(Boolean);
			await db.insert(orderItems).values({
				id: crypto.randomUUID(),
				orderId,
				variantId: guestItem.variantId,
				productName: row.productName,
				variantLabel: variantParts.join(' / ') || null,
				unitPrice: String(unitPrice),
				quantity: guestItem.quantity,
				subtotal: String(unitPrice * guestItem.quantity),
			});
		}

		writeGuestCart(cookies, []);
		redirect(302, `/pedido/${orderId}`);
	},
};
