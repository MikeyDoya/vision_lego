<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();

	let deletingId = $state<string | null>(null);
</script>

<svelte:head>
	<title>Productos — Vision Lego</title>
</svelte:head>

<div class="mb-6 flex flex-wrap items-center justify-between gap-4">
	<h1 class="text-2xl font-bold text-white">Productos</h1>
	<a
		href="/negocio/productos/nuevo"
		class="rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-semibold text-gray-950 transition hover:bg-amber-300"
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
		class="flex-1 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
	/>
	<select
		name="categoria"
		class="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-300 focus:border-amber-400 focus:outline-none"
	>
		<option value="">Todas las categorías</option>
		<option value="sunglasses" selected={data.category === 'sunglasses'}>Gafas de sol</option>
		<option value="optical" selected={data.category === 'optical'}>Monturas ópticas</option>
	</select>
	<button type="submit" class="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700">
		Filtrar
	</button>
</form>

<div class="overflow-hidden rounded-xl bg-gray-900 ring-1 ring-gray-800">
	{#if data.products.length === 0}
		<div class="py-16 text-center text-gray-500">
			<p>No hay productos todavía.</p>
			<a href="/negocio/productos/nuevo" class="mt-2 inline-block text-sm font-medium text-amber-400 underline hover:text-amber-300">
				Crear el primero
			</a>
		</div>
	{:else}
		<div class="overflow-x-auto">
			<table class="min-w-full divide-y divide-gray-800 text-sm">
				<thead class="bg-gray-800/50">
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
				<tbody class="divide-y divide-gray-800">
					{#each data.products as product (product.id)}
						<tr class="hover:bg-gray-800/40">
							<td class="px-4 py-3 font-medium text-white">
								{product.name}
								{#if product.brandName}
									<span class="ml-1 text-xs text-gray-600">({product.brandName})</span>
								{/if}
							</td>
							<td class="px-4 py-3 text-gray-400">
								{product.category === 'sunglasses' ? 'Gafas de sol' : 'Montura óptica'}
							</td>
							<td class="px-4 py-3 text-gray-400">{product.basePriceFormatted}</td>
							<td class="px-4 py-3 {Number(product.totalStock) <= 3 ? 'font-medium text-red-400' : 'text-gray-400'}">
								{product.totalStock}
							</td>
							<td class="px-4 py-3">
								<form method="post" action="?/toggleActive" use:enhance>
									<input type="hidden" name="id" value={product.id} />
									<input type="hidden" name="isActive" value={String(product.isActive)} />
									<button
										type="submit"
										class="cursor-pointer rounded-full px-2 py-1 text-xs font-medium {product.isActive
											? 'bg-green-900/50 text-green-400 ring-1 ring-green-700'
											: 'bg-gray-800 text-gray-500'}"
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
										class="cursor-pointer rounded-full px-2 py-1 text-xs font-medium {product.isFeatured
											? 'bg-amber-900/50 text-amber-400 ring-1 ring-amber-700'
											: 'bg-gray-800 text-gray-500'}"
									>
										{product.isFeatured ? 'Destacado' : 'Normal'}
									</button>
								</form>
							</td>
							<td class="px-4 py-3 text-right">
								<div class="flex items-center justify-end gap-3">
									<a href="/negocio/productos/{product.id}" class="text-sm font-medium text-gray-300 hover:text-white hover:underline">
										Editar
									</a>
									{#if deletingId === product.id}
										<form method="post" action="?/deleteProduct" use:enhance={() => () => { deletingId = null; }}>
											<input type="hidden" name="id" value={product.id} />
											<button type="submit" class="text-sm font-medium text-red-400 hover:underline">
												Confirmar
											</button>
										</form>
										<button
											type="button"
											onclick={() => (deletingId = null)}
											class="text-sm text-gray-600 hover:text-gray-400"
										>
											Cancelar
										</button>
									{:else}
										<button
											type="button"
											onclick={() => (deletingId = product.id)}
											class="text-sm text-gray-700 hover:text-red-400"
										>
											Eliminar
										</button>
									{/if}
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
