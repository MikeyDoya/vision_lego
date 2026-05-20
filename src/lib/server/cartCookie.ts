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
		console.log('[writeGuestCart] deleting cookie, opts:', JSON.stringify({ path: '/' }));
		cookies.delete(NAME, { path: '/' });
		console.log('[writeGuestCart] delete called');
	} else {
		console.log('[writeGuestCart] setting cookie, items:', JSON.stringify(items), 'opts:', JSON.stringify(OPTS));
		console.log('[writeGuestCart] caller stack:', new Error().stack?.split('\n').slice(1, 6).join(' | '));
		cookies.set(NAME, JSON.stringify(items), OPTS);
		console.log('[writeGuestCart] set called');
	}
}
