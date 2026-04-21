<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageServerData } from './$types';

	let { data, form }: { data: PageServerData; form: ActionData } = $props();

	let saving = $state(false);
	let addingVariant = $state(false);
	let uploadingImages = $state(false);
	let imagePreviews = $state<string[]>([]);

	function handleImageSelect(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		imagePreviews = [];
		if (!input.files) return;
		for (const file of Array.from(input.files)) {
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
	<a href="/negocio/productos" class="text-sm text-gray-500 hover:text-gray-900">← Productos</a>
	<h1 class="text-2xl font-bold text-gray-900">{data.product.name}</h1>
</div>

{#if form?.message}
	<p class="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{form.message}</p>
{/if}

<div class="grid gap-6 lg:grid-cols-2">
	<!-- Product info -->
	<section class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
		<h2 class="mb-4 text-lg font-semibold text-gray-900">Información del producto</h2>
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
				<label for="name" class="block text-sm font-medium text-gray-700">Nombre</label>
				<input
					id="name"
					name="name"
					type="text"
					required
					value={data.product.name}
					class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
				/>
			</div>

			<div class="grid grid-cols-2 gap-3">
				<div>
					<label for="category" class="block text-sm font-medium text-gray-700">Categoría</label>
					<select
						id="category"
						name="category"
						class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none"
					>
						<option value="sunglasses" selected={data.product.category === 'sunglasses'}>Gafas de sol</option>
						<option value="optical" selected={data.product.category === 'optical'}>Montura óptica</option>
					</select>
				</div>
				<div>
					<label for="gender" class="block text-sm font-medium text-gray-700">Género</label>
					<select
						id="gender"
						name="gender"
						class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none"
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
				<label for="brandId" class="block text-sm font-medium text-gray-700">Marca</label>
				<select
					id="brandId"
					name="brandId"
					class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none"
				>
					<option value="">Sin marca</option>
					{#each data.brands as brand (brand.id)}
						<option value={brand.id} selected={data.product.brandId === brand.id}>{brand.name}</option>
					{/each}
				</select>
			</div>

			<div>
				<label for="basePrice" class="block text-sm font-medium text-gray-700">Precio base (COP)</label>
				<input
					id="basePrice"
					name="basePrice"
					type="number"
					required
					min="1"
					value={data.product.basePrice}
					class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
				/>
			</div>

			<div>
				<label for="description" class="block text-sm font-medium text-gray-700">Descripción</label>
				<textarea
					id="description"
					name="description"
					rows="3"
					class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
				>{data.product.description ?? ''}</textarea>
			</div>

			<div class="flex gap-4">
				<label class="flex items-center gap-2 text-sm">
					<input type="checkbox" name="isActive" value="true" checked={data.product.isActive} class="rounded border-gray-300" />
					Activo
				</label>
				<label class="flex items-center gap-2 text-sm">
					<input type="checkbox" name="isFeatured" value="true" checked={data.product.isFeatured} class="rounded border-gray-300" />
					Destacado
				</label>
			</div>

			<button
				type="submit"
				disabled={saving}
				class="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-60"
			>
				{saving ? 'Guardando…' : 'Guardar cambios'}
			</button>
		</form>
	</section>

	<!-- Images -->
	<section class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
		<h2 class="mb-4 text-lg font-semibold text-gray-900">Imágenes</h2>

		{#if data.product.images.length > 0}
			<div class="mb-4 grid grid-cols-3 gap-2">
				{#each data.product.images as image (image.id)}
					<div class="group relative aspect-square overflow-hidden rounded-lg bg-gray-100">
						<img src={image.url} alt={image.altText ?? ''} class="h-full w-full object-cover" />
						{#if image.isPrimary}
							<span class="absolute left-1 top-1 rounded bg-gray-900 px-1.5 py-0.5 text-xs text-white">
								Principal
							</span>
						{/if}
						<div class="absolute inset-0 flex items-end gap-1 bg-black/40 p-2 opacity-0 transition group-hover:opacity-100">
							{#if !image.isPrimary}
								<form method="post" action="?/setPrimaryImage" use:enhance class="flex-1">
									<input type="hidden" name="imageId" value={image.id} />
									<input type="hidden" name="productId" value={data.product.id} />
									<button type="submit" class="w-full rounded bg-white px-1 py-1 text-xs font-medium">
										Principal
									</button>
								</form>
							{/if}
							<form method="post" action="?/deleteImage" use:enhance>
								<input type="hidden" name="id" value={image.id} />
								<button type="submit" class="rounded bg-red-600 px-1 py-1 text-xs font-medium text-white">
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
					update();
				};
			}}
			class="space-y-3"
		>
			<div class="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
				<input
					name="images"
					type="file"
					multiple
					accept="image/jpeg,image/jpg,image/png,image/webp"
					onchange={handleImageSelect}
					class="block w-full text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-gray-200"
				/>
				<p class="mt-2 text-xs text-gray-400">JPG, PNG, WEBP — máx. 5 MB por imagen</p>
			</div>

			{#if imagePreviews.length > 0}
				<div class="grid grid-cols-4 gap-2">
					{#each imagePreviews as preview, i (i)}
						<img src={preview} alt="Vista previa" class="aspect-square rounded-lg object-cover" />
					{/each}
				</div>
			{/if}

			<button
				type="submit"
				disabled={uploadingImages}
				class="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-60"
			>
				{uploadingImages ? 'Subiendo…' : 'Subir imágenes'}
			</button>
		</form>
	</section>

	<!-- Variants -->
	<section class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 lg:col-span-2">
		<h2 class="mb-4 text-lg font-semibold text-gray-900">Variantes</h2>

		{#if data.product.variants.length > 0}
			<div class="mb-4 overflow-x-auto">
				<table class="min-w-full divide-y divide-gray-200 text-sm">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-3 py-2 text-left font-medium text-gray-500">Color</th>
							<th class="px-3 py-2 text-left font-medium text-gray-500">Talla</th>
							<th class="px-3 py-2 text-left font-medium text-gray-500">Material</th>
							<th class="px-3 py-2 text-left font-medium text-gray-500">SKU</th>
							<th class="px-3 py-2 text-left font-medium text-gray-500">Precio</th>
							<th class="px-3 py-2 text-left font-medium text-gray-500">Stock</th>
							<th class="px-3 py-2"></th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100">
						{#each data.product.variants as variant (variant.id)}
							<tr>
								<td class="px-3 py-2 text-gray-700">{variant.color ?? '—'}</td>
								<td class="px-3 py-2 text-gray-700">{variant.size ?? '—'}</td>
								<td class="px-3 py-2 text-gray-700">{variant.material ?? '—'}</td>
								<td class="px-3 py-2 text-gray-500">{variant.sku ?? '—'}</td>
								<td class="px-3 py-2 text-gray-700">{variant.price ?? 'Base'}</td>
								<td class="px-3 py-2">
									<form method="post" action="?/updateStock" use:enhance class="flex items-center gap-1">
										<input type="hidden" name="id" value={variant.id} />
										<input
											type="number"
											name="stock"
											value={variant.stock}
											min="0"
											class="w-16 rounded border border-gray-300 px-2 py-1 text-sm {variant.stock <= 3 ? 'border-red-300 text-red-600' : ''}"
										/>
										<button type="submit" class="rounded bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200">
											OK
										</button>
									</form>
								</td>
								<td class="px-3 py-2">
									<form method="post" action="?/deleteVariant" use:enhance>
										<input type="hidden" name="id" value={variant.id} />
										<button type="submit" class="text-sm text-red-600 hover:underline">Borrar</button>
									</form>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<p class="mb-4 text-sm text-gray-500">Sin variantes todavía.</p>
		{/if}

		<button
			type="button"
			onclick={() => (addingVariant = !addingVariant)}
			class="text-sm font-medium text-gray-900 underline"
		>
			{addingVariant ? 'Cancelar' : '+ Agregar variante'}
		</button>

		{#if addingVariant}
			<form method="post" action="?/addVariant" use:enhance class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
				<div>
					<label for="v-color" class="block text-xs font-medium text-gray-600">Color</label>
					<input id="v-color" name="color" type="text" placeholder="Negro" class="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm" />
				</div>
				<div>
					<label for="v-size" class="block text-xs font-medium text-gray-600">Talla</label>
					<input id="v-size" name="size" type="text" placeholder="M" class="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm" />
				</div>
				<div>
					<label for="v-material" class="block text-xs font-medium text-gray-600">Material</label>
					<input id="v-material" name="material" type="text" placeholder="Acetato" class="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm" />
				</div>
				<div>
					<label for="v-sku" class="block text-xs font-medium text-gray-600">SKU</label>
					<input id="v-sku" name="sku" type="text" placeholder="VL-001" class="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm" />
				</div>
				<div>
					<label for="v-price" class="block text-xs font-medium text-gray-600">Precio (COP)</label>
					<input id="v-price" name="price" type="number" min="0" placeholder="Usar base" class="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm" />
				</div>
				<div>
					<label for="v-stock" class="block text-xs font-medium text-gray-600">Stock</label>
					<input id="v-stock" name="stock" type="number" min="0" value="0" class="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm" />
				</div>
				<div class="col-span-full">
					<button type="submit" class="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700">
						Agregar variante
					</button>
				</div>
			</form>
		{/if}
	</section>
</div>
