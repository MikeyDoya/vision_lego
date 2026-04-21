import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { APIError } from 'better-auth/api';

export const load: PageServerLoad = (event) => {
	if (event.locals.user) {
		const role = (event.locals.user as { role?: string }).role;
		if (role === 'owner' || role === 'staff') {
			redirect(302, '/negocio');
		}
		redirect(302, '/');
	}
	return {};
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';

		if (!email || !password) {
			return fail(400, { message: 'Completa todos los campos.' });
		}

		try {
			await auth.api.signInEmail({ body: { email, password } });
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { message: 'Credenciales incorrectas.' });
			}
			return fail(500, { message: 'Error inesperado. Intenta de nuevo.' });
		}

		const session = await auth.api.getSession({ headers: event.request.headers });
		const role = (session?.user as { role?: string } | undefined)?.role;
		if (role === 'owner' || role === 'staff') {
			redirect(302, '/negocio');
		}
		redirect(302, '/');
	}
};
