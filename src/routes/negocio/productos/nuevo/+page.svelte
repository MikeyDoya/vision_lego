<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageServerData } from './$types';

	let { data, form }: { data: PageServerData; form: ActionData } = $props();
	let loading = $state(false);
	let showNewBrand = $state(false);

	function clampDiscount(e: Event) {
		const el = e.currentTarget as HTMLInputElement;
		if (el.value === '') return;
		const n = Number(el.value);
		if (Number.isNaN(n)) { el.value = ''; return; }
		el.value = String(Math.min(100, Math.max(0, Math.round(n))));
	}
</script>

<svelte:head>
	<title>Nuevo producto — Visión Lego</title>
</svelte:head>

<div class="mb-6 flex items-center gap-4">
	<a href="/negocio/productos" class="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white">← Productos</a>
	<h1 class="text-2xl font-bold text-gray-900 dark:text-white">Nuevo producto</h1>
</div>

{#if form?.message}
	<p class="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200 dark:bg-red-900/40 dark:text-red-300 dark:ring-red-800">{form.message}</p>
{/if}

<form
	method="post"
	use:enhance={() => {
		loading = true;
		return async ({ update }) => {
			loading = false;
			update();
		};
	}}
	class="max-w-2xl space-y-6 rounded-xl bg-white p-6 ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800"
>
	<div>
		<label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre del producto <span class="text-red-500">*</span></label>
		<input
			id="name"
			name="name"
			type="text"
			required
			placeholder="Marco Aviador Negro Mate"
			class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
		/>
	</div>

	<div class="grid grid-cols-2 gap-4">
		<div>
			<label for="category" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoría <span class="text-red-500">*</span></label>
			<select
				id="category"
				name="category"
				required
				class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-brand-orange focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
			>
				<option value="">Seleccionar…</option>
				<option value="sunglasses">Gafas de sol</option>
				<option value="optical">Montura óptica</option>
				<option value="accessories">Accesorios</option>
			</select>
		</div>

		<div>
			<label for="gender" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Género</label>
			<select
				id="gender"
				name="gender"
				class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-brand-orange focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
			>
				<option value="">Sin especificar</option>
				<option value="hombre">Hombre</option>
				<option value="mujer">Mujer</option>
				<option value="unisex">Unisex</option>
				<option value="niño">Niño</option>
			</select>
		</div>
	</div>

	<div>
		<label for="brandId" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Marca</label>
		{#if !showNewBrand}
			<div class="mt-1 flex gap-2">
				<select
					name="brandId"
					class="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-brand-orange focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
				>
					<option value="">Sin marca</option>
					{#each data.brands as brand (brand.id)}
						<option value={brand.id}>{brand.name}</option>
					{/each}
				</select>
				<button
					type="button"
					onclick={() => (showNewBrand = true)}
					class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
				>
					+ Nueva
				</button>
			</div>
		{:else}
			<div class="mt-1 flex gap-2">
				<input
					name="newBrandName"
					type="text"
					placeholder="Nombre de la marca"
					class="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
				/>
				<button
					type="button"
					onclick={() => (showNewBrand = false)}
					class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
				>
					Cancelar
				</button>
			</div>
		{/if}
	</div>

	<div>
		<label for="basePrice" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Precio base (COP) <span class="text-red-500">*</span></label>
		<input
			id="basePrice"
			name="basePrice"
			type="number"
			required
			min="1"
			placeholder="150000"
			class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
		/>
	</div>

	<div class="flex flex-wrap gap-4">
		<label class="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
			<input type="checkbox" name="isOnSale" value="true" class="rounded border-gray-300 bg-white accent-brand-orange dark:border-gray-600 dark:bg-gray-800" />
			En promoción
		</label>
	</div>

	<div>
		<label for="discountPercent" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Descuento (%)</label>
		<input
			id="discountPercent"
			name="discountPercent"
			type="number"
			min="0"
			max="100"
			step="1"
			placeholder="0"
			oninput={clampDiscount}
			class="mt-1 block w-32 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
		/>
		<p class="mt-1 text-xs text-gray-400 dark:text-gray-500">Entre 0 y 100. Déjalo vacío si no hay descuento.</p>
	</div>

	<div>
		<label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
		<textarea
			id="description"
			name="description"
			rows="4"
			placeholder="Describe el producto…"
			class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
		></textarea>
	</div>

	<div class="flex gap-3">
		<button
			type="submit"
			disabled={loading}
			class="rounded-lg bg-brand-orange px-6 py-2.5 text-sm font-medium text-gray-950 transition hover:bg-brand-orange-light disabled:opacity-60"
		>
			{loading ? 'Guardando…' : 'Crear producto'}
		</button>
		<a href="/negocio/productos" class="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white">
			Cancelar
		</a>
	</div>
</form>
