import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = (event) => {
	const user = event.locals.user ?? null;
	const role = (user as { role?: string } | null)?.role ?? null;
	return { user, role };
};
