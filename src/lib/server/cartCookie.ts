import type { Cookies } from '@sveltejs/kit';

export interface GuestCartItem {
	variantId: string;
	quantity: number;
}

const NAME = 'guest_cart';
const OPTS = { path: '/', maxAge: 60 * 60 * 24 * 30, sameSite: 'lax' as const, secure: false };

export function readGuestCart(cookies: Cookies): GuestCartItem[] {
	try {
		const raw = cookies.get(NAME);
		return raw ? (JSON.parse(raw) as GuestCartItem[]) : [];
	} catch {
		return [];
	}
}

export function writeGuestCart(cookies: Cookies, items: GuestCartItem[]): void {
	if (items.length === 0) {
		cookies.delete(NAME, { path: '/', secure: false, sameSite: 'lax' });
	} else {
		cookies.set(NAME, JSON.stringify(items), OPTS);
	}
}
