import type { Cookies } from '@sveltejs/kit';
import { dev } from '$app/environment';

export interface GuestCartItem {
	variantId: string;
	quantity: number;
}

const NAME = 'guest_cart';
const OPTS = { path: '/', maxAge: 60 * 60 * 24 * 30, sameSite: 'lax' as const, secure: !dev };

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
		cookies.delete(NAME, { path: '/', sameSite: 'lax', secure: !dev });
	} else {
		cookies.set(NAME, JSON.stringify(items), OPTS);
	}
}
