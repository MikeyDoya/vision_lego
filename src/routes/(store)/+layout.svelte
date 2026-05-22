<script lang="ts">
	import { enhance } from '$app/forms';
	import type { LayoutServerData } from './$types';
	import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte';
	import Logo from '$lib/components/ui/Logo.svelte';

	let { children, data }: { children: import('svelte').Snippet; data: LayoutServerData } = $props();
	let mobileMenuOpen = $state(false);

	const isStaff = $derived(data.role === 'owner' || data.role === 'staff');
	const badgeLabel = $derived(data.cartCount > 9 ? '9+' : String(data.cartCount));
</script>

<div class="flex min-h-screen flex-col bg-white dark:bg-gray-950">
	<header class="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-gray-950/95">
		<div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
			<a href="/" aria-label="Visión Lego — Inicio">
				<Logo width={75} />
			</a>

			<!-- Desktop nav -->
			<nav class="hidden items-center gap-6 md:flex">
				<a
					href="/productos"
					class="text-sm font-semibold text-brand-orange transition hover:text-brand-orange dark:text-brand-orange dark:hover:text-brand-orange-light"
				>
					Productos
				</a>

				{#if isStaff}
					<a href="/negocio" class="text-sm font-medium text-gray-600 transition hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Panel</a>
					<form method="post" action="/cuenta?/salir" use:enhance>
						<button type="submit" class="cursor-pointer text-sm font-medium text-gray-400 transition hover:text-gray-900 dark:text-gray-500 dark:hover:text-white">Salir</button>
					</form>
				{:else}
					<!-- Cart icon — visible to guests and logged-in customers -->
					<a
						href="/carrito"
						class="relative cursor-pointer text-gray-600 transition hover:text-brand-orange dark:text-gray-300 dark:hover:text-brand-orange"
						aria-label="Carrito"
					>
						<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-8 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
						</svg>
						{#if data.cartCount > 0}
							<span class="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-orange px-0.5 text-[10px] font-bold leading-none text-gray-950">
								{badgeLabel}
							</span>
						{/if}
					</a>

					{#if data.user}
						<a href="/cuenta" class="text-sm font-medium text-gray-600 transition hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Mi cuenta</a>
						<form method="post" action="/cuenta?/salir" use:enhance>
							<button type="submit" class="cursor-pointer text-sm font-medium text-gray-400 transition hover:text-gray-900 dark:text-gray-500 dark:hover:text-white">Salir</button>
						</form>
					{:else}
						<a href="/iniciar-sesion" class="text-sm font-medium text-gray-600 transition hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Iniciar sesión</a>
						<a href="/registrarse" class="rounded-lg bg-brand-orange px-4 py-2 text-sm font-semibold text-gray-950 transition hover:bg-brand-orange-light">Registrarse</a>
					{/if}
				{/if}

				<ThemeToggle />
			</nav>

			<!-- Mobile header controls -->
			<div class="flex items-center gap-1 md:hidden">
				{#if !isStaff}
					<a
						href="/carrito"
						class="relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg text-gray-600 hover:text-brand-orange dark:text-gray-300 dark:hover:text-brand-orange"
						aria-label="Carrito"
					>
						<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-8 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
						</svg>
						{#if data.cartCount > 0}
							<span class="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-orange px-0.5 text-[10px] font-bold leading-none text-gray-950">
								{badgeLabel}
							</span>
						{/if}
					</a>
				{/if}
				<ThemeToggle />
				<button
					class="flex h-11 w-11 items-center justify-center rounded-lg text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
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
		</div>

		<!-- Mobile dropdown menu -->
		{#if mobileMenuOpen}
			<div class="border-t border-gray-200 bg-white px-4 py-4 dark:border-gray-800 dark:bg-gray-950 md:hidden">
				<nav class="flex flex-col gap-4">
					<a href="/productos" class="text-sm font-semibold text-brand-orange dark:text-brand-orange">Productos</a>
					{#if isStaff}
						<a href="/negocio" class="text-sm font-medium text-gray-700 dark:text-gray-300">Panel</a>
						<form method="post" action="/cuenta?/salir" use:enhance>
							<button type="submit" class="cursor-pointer text-sm font-medium text-gray-500">Salir</button>
						</form>
					{:else if data.user}
						<a href="/cuenta" class="text-sm font-medium text-gray-700 dark:text-gray-300">Mi cuenta</a>
						<form method="post" action="/cuenta?/salir" use:enhance>
							<button type="submit" class="cursor-pointer text-sm font-medium text-gray-500">Salir</button>
						</form>
					{:else}
						<a href="/iniciar-sesion" class="text-sm font-medium text-gray-700 dark:text-gray-300">Iniciar sesión</a>
						<a href="/registrarse" class="inline-block rounded-lg bg-brand-orange px-4 py-2 text-sm font-semibold text-gray-950">Registrarse</a>
					{/if}
				</nav>
			</div>
		{/if}
	</header>

	<main class="flex-1">
		{@render children()}
	</main>

	<footer class="border-t border-gray-200 bg-white py-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-950">
		<p>&copy; {new Date().getFullYear()} Visión Lego. Todos los derechos reservados.</p>
	</footer>
</div>
