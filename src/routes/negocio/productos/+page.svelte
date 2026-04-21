<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();
</script>

<svelte:head>
	<title>Productos — Vision Lego</title>
</svelte:head>

<div class="mb-6 flex flex-wrap items-center justify-between gap-4">
	<h1 class="text-2xl font-bold text-gray-900">Productos</h1>
	<a
		href="/negocio/productos/nuevo"
		class="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700"
	>
		+ Nuevo producto
	</a>
</div>

<form method="get" class="mb-6 flex flex-wrap gap-3">
	<input
		name="q"
		type="search"
		value={data.search}
		placeholder="Buscar producto…"
		class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
	/>
	<select
		name="categoria"
		class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
	>
		<option value="">Todas las categorías</option>
		<option value="sunglasses" selected={data.category === 'sunglasses'}>Gafas de sol</option>
		<option value="optical" selected={data.category === 'optical'}>Monturas ópticas</option>
	</select>
	<button type="submit" class="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium hover:bg-gray-200">
		Filtrar
	</button>
</form>

<div class="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
	{#if data.products.length === 0}
		<div class="py-16 text-center text-gray-500">
			<p>No hay productos todavía.</p>
			<a href="/negocio/productos/nuevo" class="mt-2 inline-block text-sm font-medium text-gray-900 underline">
				Crear el primero
			</a>
		</div>
	{:else}
		<div class="overflow-x-auto">
			<table class="min-w-full divide-y divide-gray-200 text-sm">
				<thead class="bg-gray-50">
					<tr>
						<th class="px-4 py-3 text-left font-medium text-gray-500">Nombre</th>
						<th class="px-4 py-3 text-left font-medium text-gray-500">Categoría</th>
						<th class="px-4 py-3 text-left font-medium text-gray-500">Precio base</th>
						<th class="px-4 py-3 text-left font-medium text-gray-500">Stock</th>
						<th class="px-4 py-3 text-left font-medium text-gray-500">Activo</th>
						<th class="px-4 py-3 text-left font-medium text-gray-500">Destacado</th>
						<th class="px-4 py-3"></th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100">
					{#each data.products as product (product.id)}
						<tr class="hover:bg-gray-50">
							<td class="px-4 py-3 font-medium text-gray-900">
								{product.name}
								{#if product.brandName}
									<span class="ml-1 text-xs text-gray-400">({product.brandName})</span>
								{/if}
							</td>
							<td class="px-4 py-3 text-gray-600">
								{product.category === 'sunglasses' ? 'Gafas de sol' : 'Montura óptica'}
							</td>
							<td class="px-4 py-3 text-gray-600">{product.basePriceFormatted}</td>
							<td class="px-4 py-3 {Number(product.totalStock) <= 3 ? 'font-medium text-red-600' : 'text-gray-600'}">
								{product.totalStock}
							</td>
							<td class="px-4 py-3">
								<form method="post" action="?/toggleActive" use:enhance>
									<input type="hidden" name="id" value={product.id} />
									<input type="hidden" name="isActive" value={String(product.isActive)} />
									<button
										type="submit"
										class="rounded-full px-2 py-1 text-xs font-medium {product.isActive
											? 'bg-green-100 text-green-700'
											: 'bg-gray-100 text-gray-500'}"
									>
										{product.isActive ? 'Activo' : 'Inactivo'}
									</button>
								</form>
							</td>
							<td class="px-4 py-3">
								<form method="post" action="?/toggleFeatured" use:enhance>
									<input type="hidden" name="id" value={product.id} />
									<input type="hidden" name="isFeatured" value={String(product.isFeatured)} />
									<button
										type="submit"
										class="rounded-full px-2 py-1 text-xs font-medium {product.isFeatured
											? 'bg-yellow-100 text-yellow-700'
											: 'bg-gray-100 text-gray-500'}"
									>
										{product.isFeatured ? 'Destacado' : 'Normal'}
									</button>
								</form>
							</td>
							<td class="px-4 py-3 text-right">
								<a href="/negocio/productos/{product.id}" class="text-sm font-medium text-gray-900 hover:underline">
									Editar
								</a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
