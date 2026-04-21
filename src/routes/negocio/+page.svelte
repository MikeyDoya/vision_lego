<script lang="ts">
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();

	const shortcuts = [
		{ href: '/negocio/productos/nuevo', label: 'Nuevo producto', desc: 'Agregar producto al catálogo' },
		{ href: '/negocio/pedidos', label: 'Ver pedidos', desc: 'Gestionar pedidos pendientes' },
		{ href: '/negocio/inventario', label: 'Inventario', desc: 'Revisar stock y alertas' },
		{ href: '/negocio/gastos', label: 'Registrar gasto', desc: 'Anotar un gasto del negocio' },
	];
</script>

<svelte:head>
	<title>Dashboard — Vision Lego</title>
</svelte:head>

<h1 class="mb-6 text-2xl font-bold text-white">Dashboard</h1>

<div class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
	<div class="rounded-xl bg-gray-900 p-6 ring-1 ring-gray-800">
		<p class="text-sm font-medium text-gray-500">Ventas hoy</p>
		<p class="mt-2 text-3xl font-bold text-amber-400">{data.todaySales}</p>
	</div>
	<div class="rounded-xl bg-gray-900 p-6 ring-1 ring-gray-800">
		<p class="text-sm font-medium text-gray-500">Pedidos pendientes</p>
		<p class="mt-2 text-3xl font-bold text-white">{data.pendingOrders}</p>
	</div>
	<div class="rounded-xl bg-gray-900 p-6 ring-1 ring-gray-800">
		<p class="text-sm font-medium text-gray-500">Productos con stock bajo</p>
		<p class="mt-2 text-3xl font-bold {data.lowStockCount > 0 ? 'text-red-400' : 'text-white'}">{data.lowStockCount}</p>
	</div>
</div>

<h2 class="mb-4 text-lg font-semibold text-white">Accesos rápidos</h2>
<div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
	{#each shortcuts as s (s.href)}
		<a
			href={s.href}
			class="rounded-xl bg-gray-900 p-5 ring-1 ring-gray-800 transition hover:bg-gray-800 hover:ring-amber-400/30"
		>
			<p class="font-semibold text-white">{s.label}</p>
			<p class="mt-1 text-sm text-gray-500">{s.desc}</p>
		</a>
	{/each}
</div>
