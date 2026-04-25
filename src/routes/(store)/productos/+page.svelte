<script lang="ts">
	import type { PageServerData } from './$types';
	import { formatCOP } from '$lib/utils/currency';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	let { data }: { data: PageServerData } = $props();

	let filtersOpen = $state(false);

	function buildUrl(overrides: Record<string, string | null>) {
		const params = new URLSearchParams(page.url.searchParams);
		for (const [key, val] of Object.entries(overrides)) {
			if (val === null || val === '') {
				params.delete(key);
			} else {
				params.set(key, val);
			}
		}
		return `/productos?${params.toString()}`;
	}

	function setFilter(key: string, val: string) {
		goto(buildUrl({ [key]: val || null }));
	}

	function clearFilters() {
		goto('/productos');
	}

	const categoryLabels: Record<string, string> = {
		sunglasses: 'Gafas de sol',
		optical: 'Monturas ópticas',
	};

	const genderLabels: Record<string, string> = {
		hombre: 'Hombre',
		mujer: 'Mujer',
		unisex: 'Unisex',
		'niño': 'Niño',
	};

	const sortLabels: Record<string, string> = {
		newest: 'Más recientes',
		featured: 'Destacados',
		'price-asc': 'Menor precio',
		'price-desc': 'Mayor precio',
	};

	let hasFilters = $derived(
		!!(data.filters.category || data.filters.brandId || data.filters.gender ||
			data.filters.color || data.filters.material || data.filters.size ||
			data.filters.minPrice || data.filters.maxPrice)
	);
</script>

<svelte:head>
	<title>Productos — Vision Lego</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
	<div class="flex items-center justify-between gap-4 pb-6">
		<h1 class="text-2xl font-bold text-gray-900 dark:text-white">Productos</h1>
		<div class="flex items-center gap-3">
			<button
				class="flex h-11 items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 hover:border-gray-400 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:text-white lg:hidden"
				onclick={() => (filtersOpen = !filtersOpen)}
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h18M7 8h10M11 12h4" />
				</svg>
				Filtros
				{#if hasFilters}
					<span class="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-gray-950">!</span>
				{/if}
			</button>
			<label for="orden" class="sr-only">Ordenar por</label>
			<select
				id="orden"
				class="h-11 cursor-pointer rounded-lg border-gray-300 bg-white text-sm text-gray-700 focus:border-amber-400 focus:ring-amber-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
				value={data.filters.sort}
				onchange={(e) => setFilter('orden', (e.target as HTMLSelectElement).value)}
			>
				{#each Object.entries(sortLabels) as [val, label] (val)}
					<option value={val}>{label}</option>
				{/each}
			</select>
		</div>
	</div>

	<div class="flex gap-8">
		<!-- Filter sidebar -->
		<aside
			class={[
				'shrink-0 lg:block lg:w-56',
				filtersOpen ? 'block w-full' : 'hidden',
			].join(' ')}
		>
			<div class="sticky top-24 space-y-6">
				{#if hasFilters}
					<button
						onclick={clearFilters}
						class="cursor-pointer text-sm font-medium text-amber-500 underline underline-offset-2 hover:text-amber-400 dark:text-amber-400 dark:hover:text-amber-300"
					>
						Limpiar filtros
					</button>
				{/if}

				<!-- Category -->
				<div>
					<p class="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Categoría</p>
					<div class="space-y-1">
						{#each Object.entries(categoryLabels) as [val, label] (val)}
							<label class="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
								<input
									type="radio"
									name="categoria"
									value={val}
									checked={data.filters.category === val}
									onchange={() => setFilter('categoria', data.filters.category === val ? '' : val)}
									class="rounded-full accent-amber-400"
								/>
								{label}
							</label>
						{/each}
					</div>
				</div>

				<!-- Brand -->
				{#if data.brands.length > 0}
					<div>
						<p class="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Marca</p>
						<div class="space-y-1">
							{#each data.brands as brand (brand.id)}
								<label class="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
									<input
										type="radio"
										name="marca"
										value={brand.id}
										checked={data.filters.brandId === brand.id}
										onchange={() => setFilter('marca', data.filters.brandId === brand.id ? '' : brand.id)}
										class="rounded-full accent-amber-400"
									/>
									{brand.name}
								</label>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Gender -->
				<div>
					<p class="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Género</p>
					<div class="space-y-1">
						{#each Object.entries(genderLabels) as [val, label] (val)}
							<label class="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
								<input
									type="radio"
									name="genero"
									value={val}
									checked={data.filters.gender === val}
									onchange={() => setFilter('genero', data.filters.gender === val ? '' : val)}
									class="rounded-full accent-amber-400"
								/>
								{label}
							</label>
						{/each}
					</div>
				</div>

				<!-- Color -->
				{#if data.distinctColors.length > 0}
					<div>
						<p class="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Color</p>
						<div class="space-y-1">
							{#each data.distinctColors as color (color)}
								<label class="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
									<input
										type="radio"
										name="color"
										value={color}
										checked={data.filters.color === color}
										onchange={() => setFilter('color', data.filters.color === color ? '' : color)}
										class="rounded-full accent-amber-400"
									/>
									{color}
								</label>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Material -->
				{#if data.distinctMaterials.length > 0}
					<div>
						<p class="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Material</p>
						<div class="space-y-1">
							{#each data.distinctMaterials as material (material)}
								<label class="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
									<input
										type="radio"
										name="material"
										value={material}
										checked={data.filters.material === material}
										onchange={() => setFilter('material', data.filters.material === material ? '' : material)}
										class="rounded-full accent-amber-400"
									/>
									{material}
								</label>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Talla -->
				{#if data.distinctSizes.length > 0}
					<div>
						<p class="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Talla</p>
						<div class="space-y-1">
							{#each data.distinctSizes as size (size)}
								<label class="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
									<input
										type="radio"
										name="talla"
										value={size}
										checked={data.filters.size === size}
										onchange={() => setFilter('talla', data.filters.size === size ? '' : size)}
										class="rounded-full accent-amber-400"
									/>
									{size}
								</label>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Price range -->
				<div>
					<p class="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Precio (COP)</p>
					<div class="flex gap-2">
						<div class="flex-1">
							<label for="precioMin" class="sr-only">Precio mínimo</label>
							<input
								id="precioMin"
								type="number"
								placeholder="Mín"
								min="0"
								step="10000"
								value={data.filters.minPrice ?? ''}
								onblur={(e) => setFilter('precioMin', (e.target as HTMLInputElement).value)}
								class="w-full rounded-lg border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-400 focus:border-amber-400 focus:ring-amber-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-600"
							/>
						</div>
						<div class="flex-1">
							<label for="precioMax" class="sr-only">Precio máximo</label>
							<input
								id="precioMax"
								type="number"
								placeholder="Máx"
								min="0"
								step="10000"
								value={data.filters.maxPrice ?? ''}
								onblur={(e) => setFilter('precioMax', (e.target as HTMLInputElement).value)}
								class="w-full rounded-lg border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-400 focus:border-amber-400 focus:ring-amber-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-600"
							/>
						</div>
					</div>
				</div>

				<button
					onclick={() => (filtersOpen = false)}
					class="h-11 w-full rounded-lg bg-amber-400 text-sm font-semibold text-gray-950 hover:bg-amber-300 lg:hidden"
				>
					Ver {data.products.length} producto{data.products.length !== 1 ? 's' : ''}
				</button>
			</div>
		</aside>

		<!-- Product grid -->
		<div class={filtersOpen ? 'hidden lg:block lg:flex-1' : 'flex-1'}>
			{#if data.products.length === 0}
				<div class="flex flex-col items-center justify-center py-24 text-center">
					<p class="text-lg font-medium text-gray-900 dark:text-white">No encontramos productos</p>
					<p class="mt-1 text-sm text-gray-500">Intenta cambiar los filtros de búsqueda.</p>
					{#if hasFilters}
						<button onclick={clearFilters} class="mt-4 text-sm font-medium text-amber-500 underline hover:text-amber-400 dark:text-amber-400 dark:hover:text-amber-300">
							Ver todos los productos
						</button>
					{/if}
				</div>
			{:else}
				<div class="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
					{#each data.products as product (product.id)}
						<a href="/productos/{product.slug}" class="group flex flex-col">
							<div class="aspect-square overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-900">
								{#if product.primaryImage}
									<img
										src={product.primaryImage}
										alt={product.name}
										class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
										loading="lazy"
									/>
								{:else}
									<div class="flex h-full items-center justify-center">
										<svg class="h-12 w-12 text-gray-400 dark:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
										</svg>
									</div>
								{/if}
							</div>
							<div class="mt-3 flex flex-col gap-1">
								<p class="text-xs font-medium uppercase tracking-wide text-gray-500">
									{categoryLabels[product.category] ?? product.category}
								</p>
								<p class="line-clamp-2 text-sm font-semibold leading-tight text-gray-900 dark:text-white">{product.name}</p>
								<p class="text-sm font-bold text-amber-500 dark:text-amber-400">{formatCOP(product.basePrice)}</p>
							</div>
						</a>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>
