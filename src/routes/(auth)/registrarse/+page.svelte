<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let loading = $state(false);
</script>

<svelte:head>
	<title>Crear cuenta — Vision Lego</title>
</svelte:head>

<div class="rounded-xl bg-white px-8 py-10 shadow-sm ring-1 ring-gray-200">
	<h1 class="mb-6 text-xl font-semibold text-gray-900">Crear cuenta</h1>

	{#if form?.message}
		<p class="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{form.message}</p>
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
			<label for="name" class="block text-sm font-medium text-gray-700">Nombre completo</label>
			<input
				id="name"
				name="name"
				type="text"
				required
				autocomplete="name"
				class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
			/>
		</div>

		<div>
			<label for="email" class="block text-sm font-medium text-gray-700">Correo electrónico</label>
			<input
				id="email"
				name="email"
				type="email"
				required
				autocomplete="email"
				class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
			/>
		</div>

		<div>
			<label for="password" class="block text-sm font-medium text-gray-700">Contraseña</label>
			<input
				id="password"
				name="password"
				type="password"
				required
				autocomplete="new-password"
				minlength="8"
				class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
			/>
			<p class="mt-1 text-xs text-gray-500">Mínimo 8 caracteres</p>
		</div>

		<button
			type="submit"
			disabled={loading}
			class="flex w-full items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-700 disabled:opacity-60"
		>
			{loading ? 'Creando cuenta…' : 'Crear cuenta'}
		</button>
	</form>

	<p class="mt-6 text-center text-sm text-gray-600">
		¿Ya tienes cuenta?
		<a href="/iniciar-sesion" class="font-medium text-gray-900 underline">Inicia sesión</a>
	</p>
</div>
