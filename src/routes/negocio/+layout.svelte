<script lang="ts">
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import type { LayoutServerData } from './$types';
	import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte';
	import Logo from '$lib/components/ui/Logo.svelte';

	let { children, data }: { children: import('svelte').Snippet; data: LayoutServerData } = $props();

	const navItems = [
		{ href: '/negocio', label: 'Inicio', icon: 'home' },
		{ href: '/negocio/productos', label: 'Productos', icon: 'tag' },
		{ href: '/negocio/inventario', label: 'Inventario', icon: 'box' },
		{ href: '/negocio/pedidos', label: 'Pedidos', icon: 'clipboard' },
		{ href: '/negocio/gastos', label: 'Gastos', icon: 'wallet' },
		{ href: '/negocio/cuentas-por-cobrar', label: 'Cuentas', icon: 'users' },
		{ href: '/negocio/analiticas', label: 'Analíticas', icon: 'chart' },
		{ href: '/negocio/envios', label: 'Envíos', icon: 'truck' },
	];

	function isActive(href: string) {
		if (href === '/negocio') return page.url.pathname === '/negocio';
		return page.url.pathname.startsWith(href);
	}
</script>

<div class="flex min-h-screen bg-gray-50 dark:bg-gray-950">
	<!-- Sidebar desktop -->
	<aside class="hidden w-56 shrink-0 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 lg:flex">
		<div class="flex h-16 items-center border-b border-gray-200 px-6 dark:border-gray-800">
			<a href="/negocio" aria-label="Visión Lego — Panel">
				<Logo width={100} />
			</a>
		</div>
		<nav class="flex flex-col gap-1 p-3">
			{#each navItems as item (item.href)}
				<a
					href={item.href}
					class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition {isActive(item.href)
						? 'bg-brand-orange text-gray-950'
						: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white'}"
				>
					{item.label}
				</a>
			{/each}
		</nav>
		<div class="mt-auto border-t border-gray-200 p-4 dark:border-gray-800">
			<p class="mb-2 truncate text-xs text-gray-400 dark:text-gray-600">{data.user.name}</p>
			<div class="mb-2 flex items-center justify-between">
				<span class="text-xs text-gray-500">Tema</span>
				<ThemeToggle />
			</div>
			<form method="post" action="/negocio?/salir" use:enhance>
				<button
					type="submit"
					class="w-full cursor-pointer rounded-lg bg-gray-100 px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-200 hover:text-gray-900 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
				>
					Cerrar sesión
				</button>
			</form>
		</div>
	</aside>

	<!-- Main content -->
	<div class="flex min-w-0 flex-1 flex-col">
		<header class="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-950 lg:hidden">
			<a href="/negocio" aria-label="Visión Lego — Panel">
				<Logo width={100} />
			</a>
			<ThemeToggle />
		</header>

		<main class="flex-1 px-4 py-6 sm:px-6">
			{@render children()}
		</main>

		<!-- Bottom nav mobile -->
		<nav class="fixed bottom-0 left-0 right-0 z-50 flex border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 lg:hidden">
			{#each navItems.slice(0, 5) as item (item.href)}
				<a
					href={item.href}
					class="flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium {isActive(item.href)
						? 'text-brand-orange dark:text-brand-orange'
						: 'text-gray-400 dark:text-gray-600'}"
				>
					<span class="text-base">{item.label.charAt(0)}</span>
					<span class="text-[10px]">{item.label}</span>
				</a>
			{/each}
		</nav>
		<div class="h-16 lg:hidden"></div>
	</div>
</div>
