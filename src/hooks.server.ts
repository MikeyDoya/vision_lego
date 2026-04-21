import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { building } from '$app/environment';
import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';

const handleBetterAuth: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({ headers: event.request.headers });

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	return svelteKitHandler({ event, resolve, auth, building });
};

const handleNegocioGuard: Handle = async ({ event, resolve }) => {
	if (event.url.pathname.startsWith('/negocio')) {
		if (!event.locals.user) {
			redirect(302, '/iniciar-sesion');
		}
		const role = (event.locals.user as { role?: string }).role;
		if (role !== 'owner' && role !== 'staff') {
			redirect(302, '/');
		}
	}
	return resolve(event);
};

export const handle: Handle = async ({ event, resolve }) => {
	return handleBetterAuth({
		event,
		resolve: (e) => handleNegocioGuard({ event: e, resolve }),
	});
};
