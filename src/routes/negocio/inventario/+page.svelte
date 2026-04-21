<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();
</script>

<svelte:head>
	<title>Inventario — Vision Lego</title>
</svelte:head>

<div class="mb-6 flex flex-wrap items-center justify-between gap-4">
	<h1 class="text-2xl font-bold text-gray-900">Inventario</h1>
	<a
		href="/negocio/inventario{data.onlyLow ? '' : '?bajostock=1'}"
		class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium {data.onlyLow ? 'bg-red-50 text-red-700 border-red-300' : 'text-gray-700 hover:bg-gray-50'}"
	>
		{data.onlyLow ? 'Mostrar todo' : 'Solo stock bajo'}
	</a>
</div>

<div class="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
	{#if data.variants.length === 0}
		<div class="py-16 text-center text-gray-500">No hay variantes{data.onlyLow ? ' con stock bajo' : ''}.</div>
	{:else}
		<div class="overflow-x-auto">
			<table class="min-w-full divide-y divide-gray-200 text-sm">
				<thead class="bg-gray-50">
					<tr>
						<th class="px-4 py-3 text-left font-medium text-gray-500">Producto</th>
						<th class="px-4 py-3 text-left font-medium text-gray-500">Variante</th>
						<th class="px-4 py-3 text-left font-medium text-gray-500">SKU</th>
						<th class="px-4 py-3 text-left font-medium text-gray-500">Stock</th>
						<th class="px-4 py-3"></th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100">
					{#each data.variants as v (v.id)}
						<tr class="{v.stock <= data.threshold ? 'bg-red-50' : ''}">
							<td class="px-4 py-3 font-medium text-gray-900">
								<a href="/negocio/productos/{v.productId}" class="hover:underline">{v.productName}</a>
							</td>
							<td class="px-4 py-3 text-gray-600">
								{[v.color, v.size, v.material].filter(Boolean).join(' / ') || '—'}
							</td>
							<td class="px-4 py-3 text-gray-500">{v.sku ?? '—'}</td>
							<td class="px-4 py-3">
								<span class="font-semibold {v.stock <= data.threshold ? 'text-red-600' : 'text-gray-900'}">
									{v.stock}
								</span>
								{#if v.stock <= data.threshold}
									<span class="ml-1 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">Bajo</span>
								{/if}
							</td>
							<td class="px-4 py-3">
								<form method="post" action="?/updateStock" use:enhance class="flex items-center gap-1">
									<input type="hidden" name="id" value={v.id} />
									<input
										type="number"
										name="stock"
										value={v.stock}
										min="0"
										class="w-16 rounded border border-gray-300 px-2 py-1 text-sm"
									/>
									<button type="submit" class="rounded bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200">
										OK
									</button>
								</form>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
