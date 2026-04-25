import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { APIError } from 'better-auth/api';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

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
		const email = formData.get('email')?.toString().trim().toLowerCase() ?? '';
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

		// getSession uses the original request headers which don't contain the new
		// session cookie yet — query the role directly from the DB instead.
		const [user] = await db.select({ role: users.role }).from(users).where(eq(users.email, email)).limit(1);
		if (user?.role === 'owner' || user?.role === 'staff') {
			redirect(302, '/negocio');
		}
		redirect(302, '/');
	}
};
