<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageServerData } from './$types';

	let { data, form }: { data: PageServerData; form: ActionData } = $props();
	let showForm = $state(false);
	let editingId = $state<string | null>(null);
</script>

<svelte:head>
	<title>Métodos de envío — Vision Lego</title>
</svelte:head>

<div class="mb-6 flex flex-wrap items-center justify-between gap-4">
	<h1 class="text-2xl font-bold text-gray-900">Métodos de envío</h1>
	<button
		onclick={() => (showForm = !showForm)}
		class="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700"
	>
		{showForm ? 'Cancelar' : '+ Nuevo método'}
	</button>
</div>

{#if showForm}
	<div class="mb-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
		{#if form?.message}
			<p class="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{form.message}</p>
		{/if}
		<form method="post" action="?/create" use:enhance={() => async ({ update }) => { showForm = false; update(); }} class="grid grid-cols-1 gap-4 sm:grid-cols-3">
			<div>
				<label for="name" class="block text-sm font-medium text-gray-700">Nombre</label>
				<input id="name" name="name" type="text" required placeholder="Domicilio Medellín" class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900" />
			</div>
			<div>
				<label for="description" class="block text-sm font-medium text-gray-700">Descripción</label>
				<input id="description" name="description" type="text" class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900" />
			</div>
			<div>
				<label for="cost" class="block text-sm font-medium text-gray-700">Costo (COP)</label>
				<input id="cost" name="cost" type="number" required min="0" value="0" class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900" />
			</div>
			<div>
				<button type="submit" class="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700">Crear</button>
			</div>
		</form>
	</div>
{/if}

<div class="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
	{#if data.methods.length === 0}
		<div class="py-16 text-center text-gray-500">Sin métodos de envío configurados.</div>
	{:else}
		<table class="min-w-full divide-y divide-gray-200 text-sm">
			<thead class="bg-gray-50">
				<tr>
					<th class="px-4 py-3 text-left font-medium text-gray-500">Nombre</th>
					<th class="px-4 py-3 text-left font-medium text-gray-500">Descripción</th>
					<th class="px-4 py-3 text-left font-medium text-gray-500">Costo</th>
					<th class="px-4 py-3 text-left font-medium text-gray-500">Estado</th>
					<th class="px-4 py-3"></th>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-100">
				{#each data.methods as method (method.id)}
					<tr>
						<td class="px-4 py-3 font-medium text-gray-900">{method.name}</td>
						<td class="px-4 py-3 text-gray-600">{method.description ?? '—'}</td>
						<td class="px-4 py-3 text-gray-700">
							{#if editingId === method.id}
								<form method="post" action="?/update" use:enhance={() => async ({ update }) => { editingId = null; update(); }} class="flex gap-1">
									<input type="hidden" name="id" value={method.id} />
									<input type="number" name="cost" min="0" value={method.cost} class="w-24 rounded border border-gray-300 px-2 py-1 text-sm" />
									<button type="submit" class="rounded bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200">OK</button>
								</form>
							{:else}
								{method.costFormatted}
								<button onclick={() => (editingId = method.id)} class="ml-2 text-xs text-gray-400 hover:text-gray-700">Editar</button>
							{/if}
						</td>
						<td class="px-4 py-3">
							<form method="post" action="?/toggleActive" use:enhance>
								<input type="hidden" name="id" value={method.id} />
								<input type="hidden" name="isActive" value={String(method.isActive)} />
								<button type="submit" class="rounded-full px-2 py-1 text-xs font-medium {method.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}">
									{method.isActive ? 'Activo' : 'Inactivo'}
								</button>
							</form>
						</td>
						<td class="px-4 py-3"></td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</div>
