<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageServerData } from './$types';

	let { data, form }: { data: PageServerData; form: ActionData } = $props();
	let showForm = $state(false);
	let saving = $state(false);

	const today = new Date().toISOString().slice(0, 10);
</script>

<svelte:head>
	<title>Gastos — Vision Lego</title>
</svelte:head>

<div class="mb-6 flex flex-wrap items-center justify-between gap-4">
	<div>
		<h1 class="text-2xl font-bold text-white">Gastos</h1>
		<p class="mt-1 text-sm text-gray-500">Total del mes: <span class="font-semibold text-amber-400">{data.monthTotal}</span></p>
	</div>
	<button
		onclick={() => (showForm = !showForm)}
		class="cursor-pointer rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-semibold text-gray-950 transition hover:bg-amber-300"
	>
		{showForm ? 'Cancelar' : '+ Registrar gasto'}
	</button>
</div>

{#if showForm}
	<div class="mb-6 rounded-xl bg-gray-900 p-6 ring-1 ring-gray-800">
		{#if form?.message}
			<p class="mb-4 rounded-lg bg-red-900/40 px-4 py-3 text-sm text-red-300 ring-1 ring-red-800">{form.message}</p>
		{/if}
		<form
			method="post"
			action="?/create"
			use:enhance={() => {
				saving = true;
				return async ({ update }) => {
					saving = false;
					showForm = false;
					update();
				};
			}}
			class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
		>
			<div class="lg:col-span-2">
				<label for="description" class="block text-sm font-medium text-gray-300">Descripción</label>
				<input id="description" name="description" type="text" required placeholder="Pago de arriendo…" class="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400" />
			</div>
			<div>
				<label for="amount" class="block text-sm font-medium text-gray-300">Monto (COP)</label>
				<input id="amount" name="amount" type="number" required min="1" class="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400" />
			</div>
			<div>
				<label for="category" class="block text-sm font-medium text-gray-300">Categoría</label>
				<select id="category" name="category" required class="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none">
					<option value="">Seleccionar…</option>
					{#each Object.entries(data.categoryLabels) as [val, label] (val)}
						<option value={val}>{label}</option>
					{/each}
				</select>
			</div>
			<div>
				<label for="date" class="block text-sm font-medium text-gray-300">Fecha</label>
				<input id="date" name="date" type="date" required value={today} class="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400" />
			</div>
			<div>
				<label for="notes" class="block text-sm font-medium text-gray-300">Notas (opcional)</label>
				<input id="notes" name="notes" type="text" class="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400" />
			</div>
			<div class="flex items-end">
				<button type="submit" disabled={saving} class="cursor-pointer rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-semibold text-gray-950 transition hover:bg-amber-300 disabled:opacity-60">
					{saving ? 'Guardando…' : 'Guardar'}
				</button>
			</div>
		</form>
	</div>
{/if}

<form method="get" class="mb-6 flex flex-wrap gap-3">
	<input name="mes" type="month" value={data.month} class="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none" />
	<select name="categoria" class="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-300 focus:border-amber-400 focus:outline-none">
		<option value="">Todas las categorías</option>
		{#each Object.entries(data.categoryLabels) as [val, label] (val)}
			<option value={val} selected={data.category === val}>{label}</option>
		{/each}
	</select>
	<button type="submit" class="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700">Filtrar</button>
</form>

<div class="overflow-hidden rounded-xl bg-gray-900 ring-1 ring-gray-800">
	{#if data.expenses.length === 0}
		<div class="py-16 text-center text-gray-500">Sin gastos registrados este mes.</div>
	{:else}
		<div class="overflow-x-auto">
			<table class="min-w-full divide-y divide-gray-800 text-sm">
				<thead class="bg-gray-800/50">
					<tr>
						<th class="px-4 py-3 text-left font-medium text-gray-500">Descripción</th>
						<th class="px-4 py-3 text-left font-medium text-gray-500">Categoría</th>
						<th class="px-4 py-3 text-left font-medium text-gray-500">Monto</th>
						<th class="px-4 py-3 text-left font-medium text-gray-500">Fecha</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-800">
					{#each data.expenses as expense (expense.id)}
						<tr class="hover:bg-gray-800/40">
							<td class="px-4 py-3 font-medium text-white">
								{expense.description}
								{#if expense.notes}<p class="text-xs text-gray-500">{expense.notes}</p>{/if}
							</td>
							<td class="px-4 py-3 text-gray-400">{expense.categoryLabel}</td>
							<td class="px-4 py-3 font-medium text-amber-400">{expense.amountFormatted}</td>
							<td class="px-4 py-3 text-gray-500">{expense.date}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
