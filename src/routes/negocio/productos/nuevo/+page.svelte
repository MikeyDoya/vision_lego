<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageServerData } from './$types';

	let { data, form }: { data: PageServerData; form: ActionData } = $props();
	let loading = $state(false);
	let showNewBrand = $state(false);
</script>

<svelte:head>
	<title>Nuevo producto — Vision Lego</title>
</svelte:head>

<div class="mb-6 flex items-center gap-4">
	<a href="/negocio/productos" class="text-sm text-gray-500 hover:text-gray-900">← Productos</a>
	<h1 class="text-2xl font-bold text-gray-900">Nuevo producto</h1>
</div>

{#if form?.message}
	<p class="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{form.message}</p>
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
	class="max-w-2xl space-y-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
>
	<div>
		<label for="name" class="block text-sm font-medium text-gray-700">Nombre del producto <span class="text-red-500">*</span></label>
		<input
			id="name"
			name="name"
			type="text"
			required
			placeholder="Marco Aviador Negro Mate"
			class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
		/>
	</div>

	<div class="grid grid-cols-2 gap-4">
		<div>
			<label for="category" class="block text-sm font-medium text-gray-700">Categoría <span class="text-red-500">*</span></label>
			<select
				id="category"
				name="category"
				required
				class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none"
			>
				<option value="">Seleccionar…</option>
				<option value="sunglasses">Gafas de sol</option>
				<option value="optical">Montura óptica</option>
			</select>
		</div>

		<div>
			<label for="gender" class="block text-sm font-medium text-gray-700">Género</label>
			<select
				id="gender"
				name="gender"
				class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none"
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
		<label for="brandId" class="block text-sm font-medium text-gray-700">Marca</label>
		{#if !showNewBrand}
			<div class="mt-1 flex gap-2">
				<select
					name="brandId"
					class="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none"
				>
					<option value="">Sin marca</option>
					{#each data.brands as brand (brand.id)}
						<option value={brand.id}>{brand.name}</option>
					{/each}
				</select>
				<button
					type="button"
					onclick={() => (showNewBrand = true)}
					class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
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
					class="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
				/>
				<button
					type="button"
					onclick={() => (showNewBrand = false)}
					class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
				>
					Cancelar
				</button>
			</div>
		{/if}
	</div>

	<div>
		<label for="basePrice" class="block text-sm font-medium text-gray-700">Precio base (COP) <span class="text-red-500">*</span></label>
		<input
			id="basePrice"
			name="basePrice"
			type="number"
			required
			min="1"
			placeholder="150000"
			class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
		/>
	</div>

	<div>
		<label for="description" class="block text-sm font-medium text-gray-700">Descripción</label>
		<textarea
			id="description"
			name="description"
			rows="4"
			placeholder="Describe el producto…"
			class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
		></textarea>
	</div>

	<div class="flex gap-3">
		<button
			type="submit"
			disabled={loading}
			class="rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-60"
		>
			{loading ? 'Guardando…' : 'Crear producto'}
		</button>
		<a href="/negocio/productos" class="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
			Cancelar
		</a>
	</div>
</form>
