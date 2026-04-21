<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let loading = $state(false);
</script>

<svelte:head>
	<title>Iniciar sesión — Vision Lego</title>
</svelte:head>

<div class="rounded-xl bg-gray-900 px-8 py-10 ring-1 ring-gray-800">
	<h1 class="mb-6 text-xl font-semibold text-white">Iniciar sesión</h1>

	{#if form?.message}
		<p class="mb-4 rounded-lg bg-red-900/40 px-4 py-3 text-sm text-red-300 ring-1 ring-red-800">{form.message}</p>
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
			<label for="email" class="block text-sm font-medium text-gray-300">Correo electrónico</label>
			<input
				id="email"
				name="email"
				type="email"
				required
				autocomplete="email"
				class="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
			/>
		</div>

		<div>
			<label for="password" class="block text-sm font-medium text-gray-300">Contraseña</label>
			<input
				id="password"
				name="password"
				type="password"
				required
				autocomplete="current-password"
				class="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
			/>
		</div>

		<button
			type="submit"
			disabled={loading}
			class="flex w-full cursor-pointer items-center justify-center rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-semibold text-gray-950 transition hover:bg-amber-300 hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
		>
			{loading ? 'Entrando…' : 'Entrar'}
		</button>
	</form>

	<p class="mt-6 text-center text-sm text-gray-500">
		¿No tienes cuenta?
		<a href="/registrarse" class="font-medium text-amber-400 hover:text-amber-300">Regístrate</a>
	</p>
</div>
