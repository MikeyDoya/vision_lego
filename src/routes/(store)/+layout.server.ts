import type { LayoutServerLoad } from './$types';
import { readGuestCart } from '$lib/server/cartCookie';
import { db } from '$lib/server/db';
import { cartItems } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: LayoutServerLoad = async (event) => {
	const user = event.locals.user ?? null;
	const role = (user as { role?: string } | null)?.role ?? null;

	let cartCount = 0;
	if (user) {
		const rows = await db
			.select({ quantity: cartItems.quantity })
			.from(cartItems)
			.where(eq(cartItems.userId, user.id));
		cartCount = rows.reduce((acc, r) => acc + r.quantity, 0);
	} else {
		const guestCart = readGuestCart(event.cookies);
		cartCount = guestCart.reduce((acc, i) => acc + i.quantity, 0);
	}

	return { user, role, cartCount };
};
