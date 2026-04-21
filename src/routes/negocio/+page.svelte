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

<h1 class="mb-6 text-2xl font-bold text-gray-900">Dashboard</h1>

<div class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
	<div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
		<p class="text-sm font-medium text-gray-500">Ventas hoy</p>
		<p class="mt-2 text-3xl font-bold text-gray-900">{data.todaySales}</p>
	</div>
	<div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
		<p class="text-sm font-medium text-gray-500">Pedidos pendientes</p>
		<p class="mt-2 text-3xl font-bold text-gray-900">{data.pendingOrders}</p>
	</div>
	<div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
		<p class="text-sm font-medium text-gray-500">Productos con stock bajo</p>
		<p class="mt-2 text-3xl font-bold {data.lowStockCount > 0 ? 'text-red-600' : 'text-gray-900'}">{data.lowStockCount}</p>
	</div>
</div>

<h2 class="mb-4 text-lg font-semibold text-gray-900">Accesos rápidos</h2>
<div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
	{#each shortcuts as s (s.href)}
		<a
			href={s.href}
			class="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200 hover:ring-gray-400 transition"
		>
			<p class="font-semibold text-gray-900">{s.label}</p>
			<p class="mt-1 text-sm text-gray-500">{s.desc}</p>
		</a>
	{/each}
</div>
