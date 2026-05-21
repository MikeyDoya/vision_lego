<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();

	let editingVariantId = $state<string | null>(null);
	let editColor = $state('');
	let editSize = $state('');
	let editMaterial = $state('');
	let editSku = $state('');
	let editStock = $state(0);

	function startEdit(v: { id: string; color: string | null; size: string | null; material: string | null; sku: string | null; stock: number }) {
		editingVariantId = v.id;
		editColor = v.color ?? '';
		editSize = v.size ?? '';
		editMaterial = v.material ?? '';
		editSku = v.sku ?? '';
		editStock = v.stock;
	}

	function cancelEdit() {
		editingVariantId = null;
	}
</script>

<svelte:head>
	<title>Inventario — Visión Lego</title>
</svelte:head>

<div class="mb-6">
	<h1 class="text-2xl font-bold text-gray-900 dark:text-white">Inventario</h1>
</div>

<div class="overflow-hidden rounded-xl bg-white ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
	{#if data.variants.length === 0}
		<div class="py-16 text-center text-gray-500">No hay variantes.</div>
	{:else}
		<div class="overflow-x-auto">
			<table class="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
				<thead class="bg-gray-100/80 dark:bg-gray-800/50">
					<tr>
						<th class="px-4 py-3 text-left font-medium text-gray-500">Producto</th>
						<th class="px-4 py-3 text-left font-medium text-gray-500">Variante</th>
						<th class="px-4 py-3 text-left font-medium text-gray-500">SKU</th>
						<th class="px-4 py-3 text-left font-medium text-gray-500">Stock</th>
						<th class="px-4 py-3"></th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200 dark:divide-gray-800">
					{#each data.variants as v (v.id)}
						{#if editingVariantId === v.id}
							<tr>
								<td class="px-4 py-3 font-medium text-gray-900 dark:text-white">
									<a href="/negocio/productos/{v.productId}" class="hover:text-brand-orange hover:underline dark:hover:text-brand-orange">{v.productName}</a>
								</td>
								<td class="px-4 py-3">
									<div class="flex flex-col gap-1">
										<input type="text" name="color" value={editColor} oninput={(e) => (editColor = (e.target as HTMLInputElement).value)} form="edit-inv-{v.id}" placeholder="Color" class="w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-900 focus:border-brand-orange focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
										<input type="text" name="size" value={editSize} oninput={(e) => (editSize = (e.target as HTMLInputElement).value)} form="edit-inv-{v.id}" placeholder="Talla" class="w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-900 focus:border-brand-orange focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
										<input type="text" name="material" value={editMaterial} oninput={(e) => (editMaterial = (e.target as HTMLInputElement).value)} form="edit-inv-{v.id}" placeholder="Material" class="w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-900 focus:border-brand-orange focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
									</div>
								</td>
								<td class="px-4 py-3">
									<input type="text" name="sku" value={editSku} oninput={(e) => (editSku = (e.target as HTMLInputElement).value)} form="edit-inv-{v.id}" placeholder="SKU" class="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 focus:border-brand-orange focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
								</td>
								<td class="px-4 py-3">
									<input type="number" name="stock" value={editStock} oninput={(e) => (editStock = Number((e.target as HTMLInputElement).value))} form="edit-inv-{v.id}" min="0" class="w-16 rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 focus:border-brand-orange focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
								</td>
								<td class="w-px whitespace-nowrap px-4 py-3">
									<form id="edit-inv-{v.id}" method="post" action="?/updateVariant" use:enhance={() => async ({ result, update }) => { editingVariantId = null; if (result.type === 'success') { await invalidateAll(); } else { await update({ reset: false }); } }}>
										<input type="hidden" name="id" value={v.id} />
										<div class="flex items-center gap-1">
											<button type="submit" class="cursor-pointer rounded bg-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
												Guardar
											</button>
											<button type="button" onclick={cancelEdit} class="cursor-pointer rounded bg-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
												Cancelar
											</button>
										</div>
									</form>
								</td>
							</tr>
						{:else}
							<tr>
								<td class="px-4 py-3 font-medium text-gray-900 dark:text-white">
									<a href="/negocio/productos/{v.productId}" class="hover:text-brand-orange hover:underline dark:hover:text-brand-orange">{v.productName}</a>
								</td>
								<td class="px-4 py-3 text-gray-600 dark:text-gray-400">
									{[v.color, v.size, v.material].filter(Boolean).join(' / ') || '—'}
								</td>
								<td class="px-4 py-3 text-gray-400 dark:text-gray-600">{v.sku ?? '—'}</td>
								<td class="px-4 py-3">
									<span class="font-semibold text-gray-900 dark:text-white">
										{v.stock}
									</span>
								</td>
								<td class="w-px whitespace-nowrap px-4 py-3">
									<div class="flex items-center gap-1">
										<form method="post" action="?/updateStock" use:enhance={() => async ({ result, update }) => { if (result.type === 'success') { await invalidateAll(); } else { await update({ reset: false }); } }} class="flex items-center gap-1">
											<input type="hidden" name="id" value={v.id} />
											<input
												type="number"
												name="stock"
												value={v.stock}
												min="0"
												class="w-16 rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 focus:border-brand-orange focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
											/>
											<button type="submit" class="cursor-pointer rounded bg-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
												OK
											</button>
										</form>
										<button type="button" onclick={() => startEdit(v)} class="cursor-pointer rounded bg-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
											Editar
										</button>
									</div>
								</td>
							</tr>
						{/if}
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
