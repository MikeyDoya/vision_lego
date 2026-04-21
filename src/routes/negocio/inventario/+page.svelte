<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();
</script>

<svelte:head>
	<title>Inventario — Vision Lego</title>
</svelte:head>

<div class="mb-6 flex flex-wrap items-center justify-between gap-4">
	<h1 class="text-2xl font-bold text-white">Inventario</h1>
	<a
		href="/negocio/inventario{data.onlyLow ? '' : '?bajostock=1'}"
		class="rounded-lg border px-4 py-2 text-sm font-medium transition {data.onlyLow
			? 'border-red-700 bg-red-900/40 text-red-400 hover:bg-red-900/60'
			: 'border-gray-700 text-gray-300 hover:bg-gray-800'}"
	>
		{data.onlyLow ? 'Mostrar todo' : 'Solo stock bajo'}
	</a>
</div>

<div class="overflow-hidden rounded-xl bg-gray-900 ring-1 ring-gray-800">
	{#if data.variants.length === 0}
		<div class="py-16 text-center text-gray-500">No hay variantes{data.onlyLow ? ' con stock bajo' : ''}.</div>
	{:else}
		<div class="overflow-x-auto">
			<table class="min-w-full divide-y divide-gray-800 text-sm">
				<thead class="bg-gray-800/50">
					<tr>
						<th class="px-4 py-3 text-left font-medium text-gray-500">Producto</th>
						<th class="px-4 py-3 text-left font-medium text-gray-500">Variante</th>
						<th class="px-4 py-3 text-left font-medium text-gray-500">SKU</th>
						<th class="px-4 py-3 text-left font-medium text-gray-500">Stock</th>
						<th class="px-4 py-3"></th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-800">
					{#each data.variants as v (v.id)}
						<tr class="{v.stock <= data.threshold ? 'bg-red-950/30' : ''}">
							<td class="px-4 py-3 font-medium text-white">
								<a href="/negocio/productos/{v.productId}" class="hover:text-amber-400 hover:underline">{v.productName}</a>
							</td>
							<td class="px-4 py-3 text-gray-400">
								{[v.color, v.size, v.material].filter(Boolean).join(' / ') || '—'}
							</td>
							<td class="px-4 py-3 text-gray-600">{v.sku ?? '—'}</td>
							<td class="px-4 py-3">
								<span class="font-semibold {v.stock <= data.threshold ? 'text-red-400' : 'text-white'}">
									{v.stock}
								</span>
								{#if v.stock <= data.threshold}
									<span class="ml-1 rounded-full bg-red-900/50 px-2 py-0.5 text-xs text-red-400 ring-1 ring-red-700">Bajo</span>
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
										class="w-16 rounded border border-gray-700 bg-gray-800 px-2 py-1 text-sm text-white focus:border-amber-400 focus:outline-none"
									/>
									<button type="submit" class="rounded bg-gray-700 px-2 py-1 text-xs text-gray-300 hover:bg-gray-600">
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
