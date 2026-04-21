import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { APIError } from 'better-auth/api';

export const load: PageServerLoad = (event) => {
	if (event.locals.user) redirect(302, '/');
	return {};
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const name = formData.get('name')?.toString() ?? '';
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';

		if (!name || !email || !password) {
			return fail(400, { message: 'Completa todos los campos.' });
		}
		if (password.length < 8) {
			return fail(400, { message: 'La contraseña debe tener al menos 8 caracteres.' });
		}

		try {
			await auth.api.signUpEmail({ body: { name, email, password } });
		} catch (error) {
			console.error('[registrarse] sign-up error:', error);
			if (error instanceof APIError) {
				return fail(400, { message: 'Este correo ya está registrado.' });
			}
			return fail(500, { message: 'Error inesperado. Intenta de nuevo.' });
		}

		redirect(302, '/');
	}
};
