<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let loading = $state(false);
</script>

<svelte:head>
	<title>Crear cuenta — Visión Lego</title>
</svelte:head>

<div class="rounded-xl bg-white px-8 py-10 ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
	<h1 class="mb-6 text-xl font-bold text-gray-900 dark:text-white">Crear cuenta</h1>

	{#if form?.message}
		<p class="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200 dark:bg-red-900/40 dark:text-red-300 dark:ring-red-800">{form.message}</p>
	{/if}

	<form
		method="post"
		use:enhance={() => {
			loading = true;
			return async ({ update }) => {
				loading = false;
				update();
			};
		}}
		class="space-y-5"
	>
		<div>
			<label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre completo</label>
			<input
				id="name"
				name="name"
				type="text"
				required
				autocomplete="name"
				class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
			/>
		</div>

		<div>
			<label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Correo electrónico</label>
			<input
				id="email"
				name="email"
				type="email"
				required
				autocomplete="email"
				class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
			/>
		</div>

		<div>
			<label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Contraseña</label>
			<input
				id="password"
				name="password"
				type="password"
				required
				autocomplete="new-password"
				minlength="8"
				class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
			/>
			<p class="mt-1 text-xs text-gray-500 dark:text-gray-600">Mínimo 8 caracteres</p>
		</div>

		<button
			type="submit"
			disabled={loading}
			class="flex w-full cursor-pointer items-center justify-center rounded-lg bg-brand-orange px-4 py-2.5 text-sm font-semibold text-gray-950 transition hover:bg-brand-orange-light hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
		>
			{loading ? 'Creando cuenta…' : 'Crear cuenta'}
		</button>
	</form>

	<p class="mt-6 text-center text-sm text-gray-500">
		¿Ya tienes cuenta?
		<a href="/iniciar-sesion" class="font-medium text-brand-orange hover:text-brand-orange dark:text-brand-orange dark:hover:text-brand-orange-light">Inicia sesión</a>
	</p>
</div>
