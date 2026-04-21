<script lang="ts">
	import { enhance } from '$app/forms';
	import type { LayoutServerData } from './$types';

	let { children, data }: { children: import('svelte').Snippet; data: LayoutServerData } = $props();
	let mobileMenuOpen = $state(false);

	const isStaff = $derived(data.role === 'owner' || data.role === 'staff');
</script>

<div class="flex min-h-screen flex-col bg-gray-950">
	<header class="sticky top-0 z-40 border-b border-gray-800 bg-gray-950/95 backdrop-blur">
		<div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
			<a href="/" class="text-xl font-bold tracking-tight text-white">Vision Lego</a>

			<nav class="hidden items-center gap-6 md:flex">
				<a
					href="/productos"
					class="text-sm font-semibold text-amber-400 transition hover:text-amber-300"
				>
					Productos
				</a>
				{#if isStaff}
					<a href="/negocio" class="text-sm font-medium text-gray-300 transition hover:text-white">Panel</a>
					<form method="post" action="/cuenta?/salir" use:enhance>
						<button type="submit" class="cursor-pointer text-sm font-medium text-gray-500 transition hover:text-white">Salir</button>
					</form>
				{:else if data.user}
					<a href="/carrito" class="text-sm font-medium text-gray-300 transition hover:text-white">Carrito</a>
					<a href="/cuenta" class="text-sm font-medium text-gray-300 transition hover:text-white">Mi cuenta</a>
					<form method="post" action="/cuenta?/salir" use:enhance>
						<button type="submit" class="cursor-pointer text-sm font-medium text-gray-500 transition hover:text-white">Salir</button>
					</form>
				{:else}
					<a href="/iniciar-sesion" class="text-sm font-medium text-gray-300 transition hover:text-white">Iniciar sesión</a>
					<a href="/registrarse" class="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-gray-950 transition hover:bg-amber-300">Registrarse</a>
				{/if}
			</nav>

			<button
				class="flex h-11 w-11 items-center justify-center rounded-lg text-gray-300 hover:text-white md:hidden"
				onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
				aria-label="Menú"
			>
				<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					{#if mobileMenuOpen}
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					{:else}
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
					{/if}
				</svg>
			</button>
		</div>

		{#if mobileMenuOpen}
			<div class="border-t border-gray-800 bg-gray-950 px-4 py-4 md:hidden">
				<nav class="flex flex-col gap-4">
					<a href="/productos" class="text-sm font-semibold text-amber-400">Productos</a>
					{#if isStaff}
						<a href="/negocio" class="text-sm font-medium text-gray-300">Panel</a>
						<form method="post" action="/cuenta?/salir" use:enhance>
							<button type="submit" class="cursor-pointer text-sm font-medium text-gray-500">Salir</button>
						</form>
					{:else if data.user}
						<a href="/carrito" class="text-sm font-medium text-gray-300">Carrito</a>
						<a href="/cuenta" class="text-sm font-medium text-gray-300">Mi cuenta</a>
						<form method="post" action="/cuenta?/salir" use:enhance>
							<button type="submit" class="cursor-pointer text-sm font-medium text-gray-500">Salir</button>
						</form>
					{:else}
						<a href="/iniciar-sesion" class="text-sm font-medium text-gray-300">Iniciar sesión</a>
						<a href="/registrarse" class="inline-block rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-gray-950">Registrarse</a>
					{/if}
				</nav>
			</div>
		{/if}
	</header>

	<main class="flex-1">
		{@render children()}
	</main>

	<footer class="border-t border-gray-800 bg-gray-950 py-8 text-center text-sm text-gray-500">
		<p>&copy; {new Date().getFullYear()} Vision Lego. Todos los derechos reservados.</p>
	</footer>
</div>
