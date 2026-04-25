<script lang="ts">
	import { enhance } from '$app/forms';
	import { SvelteSet } from 'svelte/reactivity';
	import type { ActionData, PageServerData } from './$types';

	let { data, form }: { data: PageServerData; form: ActionData } = $props();

	let saving = $state(false);
	let addingVariant = $state(false);
	let uploadingImages = $state(false);
	let imagePreviews = $state<string[]>([]);
	let fileNames = $state<string[]>([]);

	const variantGroups = $derived.by(() => {
		const seen = new SvelteSet<string>();
		const groups: { label: string; variantId: string }[] = [];
		for (const v of data.product.variants) {
			const key = `${v.color ?? ''}|${v.material ?? ''}`;
			if (!seen.has(key)) {
				seen.add(key);
				const parts = [v.color, v.material].filter(Boolean);
				groups.push({
					label: parts.length ? parts.join(' / ') : 'Sin color/material',
					variantId: v.id,
				});
			}
		}
		return groups;
	});

	let editingVariantId = $state<string | null>(null);
	let editColor = $state('');
	let editSize = $state('');
	let editMaterial = $state('');
	let editSku = $state('');
	let editPrice = $state('');
	let editStock = $state(0);

	function startEdit(variant: { id: string; color: string | null; size: string | null; material: string | null; sku: string | null; price: string | null; stock: number }) {
		editingVariantId = variant.id;
		editColor = variant.color ?? '';
		editSize = variant.size ?? '';
		editMaterial = variant.material ?? '';
		editSku = variant.sku ?? '';
		editPrice = variant.price ?? '';
		editStock = variant.stock;
	}

	function cancelEdit() {
		editingVariantId = null;
	}

	function handleImageSelect(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		imagePreviews = [];
		fileNames = [];
		if (!input.files) return;
		for (const file of Array.from(input.files)) {
			fileNames = [...fileNames, file.name];
			const reader = new FileReader();
			reader.onload = (ev) => {
				imagePreviews = [...imagePreviews, ev.target?.result as string];
			};
			reader.readAsDataURL(file);
		}
	}
</script>

<svelte:head>
	<title>{data.product.name} — Vision Lego</title>
</svelte:head>

<div class="mb-6 flex items-center gap-4">
	<a href="/negocio/productos" class="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white">← Productos</a>
	<h1 class="text-2xl font-bold text-gray-900 dark:text-white">{data.product.name}</h1>
</div>

{#if form?.message}
	<p class="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200 dark:bg-red-900/40 dark:text-red-300 dark:ring-red-800">{form.message}</p>
{/if}

<div class="grid gap-6 lg:grid-cols-2">
	<!-- Product info -->
	<section class="rounded-xl bg-white p-6 ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
		<h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Información del producto</h2>
		<form
			method="post"
			action="?/updateProduct"
			use:enhance={() => {
				saving = true;
				return async ({ update }) => {
					saving = false;
					update();
				};
			}}
			class="space-y-4"
		>
			<div>
				<label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
				<input
					id="name"
					name="name"
					type="text"
					required
					value={data.product.name}
					class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
				/>
			</div>

			<div class="grid grid-cols-2 gap-3">
				<div>
					<label for="category" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoría</label>
					<select
						id="category"
						name="category"
						class="mt-1 block w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-amber-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
					>
						<option value="sunglasses" selected={data.product.category === 'sunglasses'}>Gafas de sol</option>
						<option value="optical" selected={data.product.category === 'optical'}>Montura óptica</option>
					</select>
				</div>
				<div>
					<label for="gender" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Género</label>
					<select
						id="gender"
						name="gender"
						class="mt-1 block w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-amber-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
					>
						<option value="" selected={!data.product.gender}>Sin especificar</option>
						<option value="hombre" selected={data.product.gender === 'hombre'}>Hombre</option>
						<option value="mujer" selected={data.product.gender === 'mujer'}>Mujer</option>
						<option value="unisex" selected={data.product.gender === 'unisex'}>Unisex</option>
						<option value="niño" selected={data.product.gender === 'niño'}>Niño</option>
					</select>
				</div>
			</div>

			<div>
				<label for="brandId" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Marca</label>
				<select
					id="brandId"
					name="brandId"
					class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-amber-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
				>
					<option value="">Sin marca</option>
					{#each data.brands as brand (brand.id)}
						<option value={brand.id} selected={data.product.brandId === brand.id}>{brand.name}</option>
					{/each}
				</select>
			</div>

			<div>
				<label for="basePrice" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Precio base (COP)</label>
				<input
					id="basePrice"
					name="basePrice"
					type="number"
					required
					min="1"
					value={data.product.basePrice}
					class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
				/>
			</div>

			<div>
				<label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
				<textarea
					id="description"
					name="description"
					rows="3"
					class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
				>{data.product.description ?? ''}</textarea>
			</div>

			<div class="flex gap-4">
				<label class="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
					<input type="checkbox" name="isActive" value="true" checked={data.product.isActive} class="rounded border-gray-300 bg-white accent-amber-400 dark:border-gray-600 dark:bg-gray-800" />
					Activo
				</label>
				<label class="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
					<input type="checkbox" name="isFeatured" value="true" checked={data.product.isFeatured} class="rounded border-gray-300 bg-white accent-amber-400 dark:border-gray-600 dark:bg-gray-800" />
					Destacado
				</label>
			</div>

			<button
				type="submit"
				disabled={saving}
				class="cursor-pointer rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-semibold text-gray-950 transition hover:bg-amber-300 disabled:opacity-60"
			>
				{saving ? 'Guardando…' : 'Guardar cambios'}
			</button>
		</form>
	</section>

	<!-- Images -->
	<section class="rounded-xl bg-white p-6 ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
		<h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Imágenes</h2>

		{#if data.product.images.length > 0}
			<div class="mb-4 grid grid-cols-3 gap-2">
				{#each data.product.images as image (image.id)}
					<div class="group relative aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
						<img src={image.url} alt={image.altText ?? ''} class="h-full w-full object-cover" />
						{#if image.isPrimary}
							<span class="absolute left-1 top-1 rounded bg-amber-400 px-1.5 py-0.5 text-xs font-medium text-gray-950">
								Principal
							</span>
						{/if}
						<div class="absolute inset-0 flex items-end gap-1 bg-black/50 p-2 opacity-0 transition group-hover:opacity-100">
							{#if !image.isPrimary}
								<form method="post" action="?/setPrimaryImage" use:enhance class="flex-1">
									<input type="hidden" name="imageId" value={image.id} />
									<input type="hidden" name="productId" value={data.product.id} />
									<button type="submit" class="w-full rounded bg-gray-700 px-1 py-1 text-xs font-medium text-white hover:bg-gray-600">
										Principal
									</button>
								</form>
							{/if}
							<form method="post" action="?/deleteImage" use:enhance>
								<input type="hidden" name="id" value={image.id} />
								<button type="submit" class="cursor-pointer rounded bg-red-600 px-1 py-1 text-xs font-medium text-white hover:bg-red-500">
									Borrar
								</button>
							</form>
						</div>
					</div>
				{/each}
			</div>
		{/if}

		<form
			method="post"
			action="?/uploadImages"
			enctype="multipart/form-data"
			use:enhance={() => {
				uploadingImages = true;
				return async ({ update }) => {
					uploadingImages = false;
					imagePreviews = [];
					fileNames = [];
					update();
				};
			}}
			class="space-y-3"
		>
			<div class="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center dark:border-gray-700">
				<input
					id="image-upload"
					name="images"
					type="file"
					multiple
					accept="image/jpeg,image/jpg,image/png,image/webp"
					onchange={handleImageSelect}
					class="sr-only"
				/>
				<label
					for="image-upload"
					class="inline-block cursor-pointer rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
				>
					Seleccionar archivos
				</label>
				<p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
					{fileNames.length > 0
						? fileNames.length === 1
							? fileNames[0]
							: `${fileNames.length} archivos seleccionados`
						: 'Ningún archivo seleccionado'}
				</p>
				<p class="mt-1 text-xs text-gray-400 dark:text-gray-500">JPG, PNG, WEBP — máx. 5 MB por imagen</p>
			</div>

			{#if imagePreviews.length > 0}
				<div class="grid grid-cols-4 gap-2">
					{#each imagePreviews as preview, i (i)}
						<img src={preview} alt="Vista previa" class="aspect-square rounded-lg object-cover" />
					{/each}
				</div>
			{/if}

			{#if variantGroups.length > 0}
				<div>
					<label for="img-variant" class="block text-xs font-medium text-gray-600 dark:text-gray-400">
						Variante (Color / Material)
					</label>
					<select
						id="img-variant"
						name="variantId"
						class="mt-1 w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-amber-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
					>
						<option value="">Imagen general (todas las variantes)</option>
						{#each variantGroups as group (group.variantId)}
							<option value={group.variantId}>{group.label}</option>
						{/each}
					</select>
				</div>
			{/if}

			<button
				type="submit"
				disabled={uploadingImages}
				class="cursor-pointer rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 hover:text-gray-900 disabled:opacity-60 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
			>
				{uploadingImages ? 'Subiendo…' : 'Subir imágenes'}
			</button>
		</form>
	</section>

	<!-- Variants -->
	<section class="rounded-xl bg-white p-6 ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800 lg:col-span-2">
		<h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Variantes</h2>

		{#if data.product.variants.length > 0}
			<div class="mb-4 overflow-x-auto">
				<table class="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
					<thead class="bg-gray-100 dark:bg-gray-800">
						<tr>
							<th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Color</th>
							<th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Talla</th>
							<th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Material</th>
							<th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">SKU</th>
							<th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Precio</th>
							<th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Stock</th>
							<th class="w-px px-3 py-2"></th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200 dark:divide-gray-800">
						{#each data.product.variants as variant (variant.id)}
							{#if editingVariantId === variant.id}
								<tr class="bg-amber-50 dark:bg-amber-950/20">
									<td class="px-3 py-2"><input form="edit-{variant.id}" name="color" bind:value={editColor} placeholder="—" class="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 focus:border-amber-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white" /></td>
									<td class="px-3 py-2"><input form="edit-{variant.id}" name="size" bind:value={editSize} placeholder="—" class="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 focus:border-amber-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white" /></td>
									<td class="px-3 py-2"><input form="edit-{variant.id}" name="material" bind:value={editMaterial} placeholder="—" class="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 focus:border-amber-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white" /></td>
									<td class="px-3 py-2"><input form="edit-{variant.id}" name="sku" bind:value={editSku} placeholder="—" class="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 focus:border-amber-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white" /></td>
									<td class="px-3 py-2"><input form="edit-{variant.id}" name="price" type="number" min="0" value={editPrice} placeholder="Base" class="w-24 rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 focus:border-amber-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white" /></td>
									<td class="px-3 py-2"><input form="edit-{variant.id}" name="stock" type="number" min="0" bind:value={editStock} class="w-16 rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 focus:border-amber-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white" /></td>
									<td class="w-px whitespace-nowrap px-3 py-2">
										<form
											id="edit-{variant.id}"
											method="post"
											action="?/updateVariant"
											use:enhance={() => async ({ update }) => {
												editingVariantId = null;
												await update({ reset: false });
											}}
										>
											<input type="hidden" name="id" value={variant.id} />
											<div class="flex gap-1">
												<button type="submit" class="cursor-pointer rounded bg-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white">Guardar</button>
												<button type="button" onclick={cancelEdit} class="cursor-pointer rounded bg-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white">Cancelar</button>
											</div>
										</form>
									</td>
								</tr>
							{:else}
								<tr>
									<td class="px-3 py-2 text-gray-700 dark:text-gray-300">{variant.color ?? '—'}</td>
									<td class="px-3 py-2 text-gray-700 dark:text-gray-300">{variant.size ?? '—'}</td>
									<td class="px-3 py-2 text-gray-700 dark:text-gray-300">{variant.material ?? '—'}</td>
									<td class="px-3 py-2 text-gray-500">{variant.sku ?? '—'}</td>
									<td class="px-3 py-2 text-gray-700 dark:text-gray-300">{variant.price ?? 'Base'}</td>
									<td class="px-3 py-2">
										<form method="post" action="?/updateStock" use:enhance={() => async ({ update }) => { update({ reset: false }); }} class="flex items-center gap-1">
											<input type="hidden" name="id" value={variant.id} />
											<input
												type="number"
												name="stock"
												value={variant.stock}
												min="0"
												class="w-16 rounded border bg-white px-2 py-1 text-sm text-gray-900 dark:bg-gray-800 dark:text-white {variant.stock <= 3 ? 'border-red-400 text-red-600 dark:border-red-500 dark:text-red-400' : 'border-gray-300 dark:border-gray-700'}"
											/>
											<button type="submit" class="cursor-pointer rounded bg-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white">OK</button>
										</form>
									</td>
									<td class="w-px whitespace-nowrap px-3 py-2">
										<div class="flex items-center gap-2">
											<button type="button" onclick={() => startEdit(variant)} class="cursor-pointer rounded bg-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white">Editar</button>
											<form method="post" action="?/deleteVariant" use:enhance>
												<input type="hidden" name="id" value={variant.id} />
												<button type="submit" class="cursor-pointer text-sm text-red-500 hover:underline dark:text-red-400">Borrar</button>
											</form>
										</div>
									</td>
								</tr>
							{/if}
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<p class="mb-4 text-sm text-gray-500">Sin variantes todavía.</p>
		{/if}

		{#if !addingVariant}
			<button
				type="button"
				onclick={() => (addingVariant = true)}
				class="cursor-pointer rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-gray-950 transition hover:bg-amber-300"
			>
				Agregar variante
			</button>
		{/if}

		{#if addingVariant}
			<form method="post" action="?/addVariant" use:enhance class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
				<div>
					<label for="v-color" class="block text-xs font-medium text-gray-600 dark:text-gray-400">Color</label>
					<input id="v-color" name="color" type="text" placeholder="Negro" class="mt-1 w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:border-amber-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500" />
				</div>
				<div>
					<label for="v-size" class="block text-xs font-medium text-gray-600 dark:text-gray-400">Talla</label>
					<input id="v-size" name="size" type="text" placeholder="M" class="mt-1 w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:border-amber-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500" />
				</div>
				<div>
					<label for="v-material" class="block text-xs font-medium text-gray-600 dark:text-gray-400">Material</label>
					<input id="v-material" name="material" type="text" placeholder="Acetato" class="mt-1 w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:border-amber-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500" />
				</div>
				<div>
					<label for="v-sku" class="block text-xs font-medium text-gray-600 dark:text-gray-400">SKU</label>
					<input id="v-sku" name="sku" type="text" placeholder="VL-001" class="mt-1 w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:border-amber-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500" />
				</div>
				<div>
					<label for="v-price" class="block text-xs font-medium text-gray-600 dark:text-gray-400">Precio (COP)</label>
					<input id="v-price" name="price" type="number" min="0" placeholder="Usar base" class="mt-1 w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:border-amber-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500" />
				</div>
				<div>
					<label for="v-stock" class="block text-xs font-medium text-gray-600 dark:text-gray-400">Stock</label>
					<input id="v-stock" name="stock" type="number" min="0" value="0" class="mt-1 w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 focus:border-amber-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
				</div>
				<div class="col-span-full flex gap-3">
					<button type="submit" class="cursor-pointer rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-gray-950 transition hover:bg-amber-300">
						Agregar variante
					</button>
					<button type="button" onclick={() => (addingVariant = false)} class="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
						Cancelar
					</button>
				</div>
			</form>
		{/if}
	</section>
</div>
