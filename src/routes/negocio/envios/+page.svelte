<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { ActionData, PageServerData } from './$types';

	let { data, form }: { data: PageServerData; form: ActionData } = $props();
	let showForm = $state(false);
	let editingId = $state<string | null>(null);
</script>

<svelte:head>
	<title>Métodos de envío — Vision Lego</title>
</svelte:head>

<div class="mb-6 flex flex-wrap items-center justify-between gap-4">
	<h1 class="text-2xl font-bold text-gray-900 dark:text-white">Métodos de envío</h1>
	<button
		onclick={() => (showForm = !showForm)}
		class="cursor-pointer rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-semibold text-gray-950 transition hover:bg-amber-300"
	>
		{showForm ? 'Cancelar' : '+ Nuevo método'}
	</button>
</div>

{#if showForm}
	<div class="mb-6 rounded-xl bg-white p-6 ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
		{#if form?.message}
			<p class="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200 dark:bg-red-900/40 dark:text-red-300 dark:ring-red-800">{form.message}</p>
		{/if}
		<form method="post" action="?/create" use:enhance={() => async ({ result, update }) => { if (result.type === 'success') { showForm = false; await invalidateAll(); } else { await update(); } }} class="grid grid-cols-1 gap-4 sm:grid-cols-3">
			<div>
				<label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
				<input id="name" name="name" type="text" required placeholder="Domicilio Medellín" class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-600" />
			</div>
			<div>
				<label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
				<input id="description" name="description" type="text" class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
			</div>
			<div>
				<label for="cost" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Costo (COP)</label>
				<input id="cost" name="cost" type="number" required min="0" value="0" class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
			</div>
			<div>
				<button type="submit" class="cursor-pointer rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-semibold text-gray-950 transition hover:bg-amber-300">Crear</button>
			</div>
		</form>
	</div>
{/if}

<div class="overflow-hidden rounded-xl bg-white ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
	{#if data.methods.length === 0}
		<div class="py-16 text-center text-gray-500">Sin métodos de envío configurados.</div>
	{:else}
		<table class="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
			<thead class="bg-gray-100/80 dark:bg-gray-800/50">
				<tr>
					<th class="px-4 py-3 text-left font-medium text-gray-500">Nombre</th>
					<th class="px-4 py-3 text-left font-medium text-gray-500">Descripción</th>
					<th class="px-4 py-3 text-left font-medium text-gray-500">Costo</th>
					<th class="px-4 py-3 text-left font-medium text-gray-500">Estado</th>
					<th class="px-4 py-3"></th>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-200 dark:divide-gray-800">
				{#each data.methods as method (method.id)}
					<tr class="hover:bg-gray-50 dark:hover:bg-gray-800/40">
						<td class="px-4 py-3 font-medium text-gray-900 dark:text-white">{method.name}</td>
						<td class="px-4 py-3 text-gray-600 dark:text-gray-400">{method.description ?? '—'}</td>
						<td class="px-4 py-3 text-gray-700 dark:text-gray-300">
							{#if editingId === method.id}
								<form method="post" action="?/update" use:enhance={() => async ({ result, update }) => { editingId = null; if (result.type === 'success') { await invalidateAll(); } else { await update(); } }} class="flex gap-1">
									<input type="hidden" name="id" value={method.id} />
									<input type="number" name="cost" min="0" value={method.cost} class="w-24 rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 focus:border-amber-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
									<button type="submit" class="rounded bg-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">OK</button>
								</form>
							{:else}
								{method.costFormatted}
								<button onclick={() => (editingId = method.id)} class="ml-2 cursor-pointer text-xs text-gray-400 hover:text-amber-500 dark:text-gray-600 dark:hover:text-amber-400">Editar</button>
							{/if}
						</td>
						<td class="px-4 py-3">
							<form method="post" action="?/toggleActive" use:enhance={() => async ({ result, update }) => { if (result.type === 'success') { await invalidateAll(); } else { await update(); } }}>
								<input type="hidden" name="id" value={method.id} />
								<input type="hidden" name="isActive" value={String(method.isActive)} />
								<button type="submit" class="cursor-pointer rounded-full px-2 py-1 text-xs font-medium {method.isActive
									? 'bg-green-100 text-green-700 ring-1 ring-green-200 dark:bg-green-900/50 dark:text-green-300 dark:ring-green-700'
									: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500'}">
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
