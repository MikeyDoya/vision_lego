<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { ActionData, PageServerData } from './$types';

	let { data, form }: { data: PageServerData; form: ActionData } = $props();
	let showForm = $state(false);
	let saving = $state(false);
	let payingId = $state<string | null>(null);

	const statusLabels: Record<string, string> = {
		paid: 'Pagada',
		partial: 'Parcial',
		pending: 'Pendiente',
	};
	const statusColors: Record<string, string> = {
		paid:    'bg-green-100 text-green-700 ring-1 ring-green-200 dark:bg-green-900/50 dark:text-green-300 dark:ring-green-700',
		partial: 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:ring-yellow-700',
		pending: 'bg-gray-100 text-gray-700 ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700',
	};
</script>

<svelte:head>
	<title>Cuentas por cobrar — Visión Lego</title>
</svelte:head>

<div class="mb-6 flex flex-wrap items-center justify-between gap-4">
	<h1 class="text-2xl font-bold text-gray-900 dark:text-white">Cuentas por cobrar</h1>
	<button
		onclick={() => (showForm = !showForm)}
		class="cursor-pointer rounded-lg bg-brand-orange px-4 py-2.5 text-sm font-semibold text-gray-950 transition hover:bg-brand-orange-light"
	>
		{showForm ? 'Cancelar' : '+ Nueva cuenta'}
	</button>
</div>

{#if showForm}
	<div class="mb-6 rounded-xl bg-white p-6 ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
		{#if form?.message}
			<p class="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200 dark:bg-red-900/40 dark:text-red-300 dark:ring-red-800">{form.message}</p>
		{/if}
		<form
			method="post"
			action="?/create"
			use:enhance={() => {
				saving = true;
				return async ({ result, update }) => {
					saving = false;
					if (result.type === 'success') {
						showForm = false;
						await invalidateAll();
					} else {
						await update();
					}
				};
			}}
			class="grid grid-cols-1 gap-4 sm:grid-cols-2"
		>
			<div>
				<label for="customerName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre del cliente</label>
				<input id="customerName" name="customerName" type="text" required class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
			</div>
			<div>
				<label for="customerPhone" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono</label>
				<input id="customerPhone" name="customerPhone" type="tel" class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
			</div>
			<div class="sm:col-span-2">
				<label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
				<input id="description" name="description" type="text" required class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
			</div>
			<div>
				<label for="amount" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Monto total (COP)</label>
				<input id="amount" name="amount" type="number" required min="1" class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
			</div>
			<div>
				<label for="dueDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha límite</label>
				<input id="dueDate" name="dueDate" type="date" class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
			</div>
			<div>
				<button type="submit" disabled={saving} class="cursor-pointer rounded-lg bg-brand-orange px-4 py-2.5 text-sm font-medium text-gray-950 transition hover:bg-brand-orange-light disabled:opacity-60">
					{saving ? 'Guardando…' : 'Guardar'}
				</button>
			</div>
		</form>
	</div>
{/if}

<div class="space-y-4">
	{#if data.receivables.length === 0}
		<div class="rounded-xl bg-white py-16 text-center text-gray-500 ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">Sin cuentas registradas.</div>
	{:else}
		{#each data.receivables as rec (rec.id)}
			<div class="rounded-xl bg-white p-5 ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800 {rec.isOverdue ? 'border-l-4 border-red-500' : ''}">
				<div class="flex flex-wrap items-start justify-between gap-3">
					<div>
						<p class="font-semibold text-gray-900 dark:text-white">{rec.customerName}</p>
						{#if rec.customerPhone}<p class="text-sm text-gray-500">{rec.customerPhone}</p>{/if}
						<p class="mt-1 text-sm text-gray-700 dark:text-gray-300">{rec.description}</p>
						{#if rec.dueDate}
							<p class="mt-1 text-xs {rec.isOverdue ? 'font-medium text-red-500 dark:text-red-400' : 'text-gray-500'}">
								Vence: {rec.dueDate}{rec.isOverdue ? ' · Vencida' : ''}
							</p>
						{/if}
					</div>
					<div class="text-right">
						<span class="rounded-full px-2 py-1 text-xs font-medium {statusColors[rec.paymentStatus] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'}">
							{statusLabels[rec.paymentStatus]}
						</span>
						<p class="mt-2 text-lg font-bold text-brand-orange dark:text-brand-orange">{rec.amountFormatted}</p>
						{#if rec.paymentStatus !== 'paid'}
							<p class="text-sm text-gray-500">Pendiente: {rec.remainingFormatted}</p>
						{/if}
					</div>
				</div>

				{#if !rec.isPaid}
					{#if payingId === rec.id}
						<form method="post" action="?/recordPayment" use:enhance={() => async ({ result, update }) => { if (result.type === 'success') { await invalidateAll(); } else { await update(); } }} class="mt-4 flex gap-2">
							<input type="hidden" name="id" value={rec.id} />
							<input type="number" name="payment" min="1" placeholder="Monto recibido" class="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-orange focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-600" />
							<button type="submit" class="cursor-pointer rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-500">Registrar</button>
							<button type="button" onclick={() => (payingId = null)} class="cursor-pointer rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800">Cancelar</button>
						</form>
					{:else}
						<button onclick={() => (payingId = rec.id)} class="mt-3 cursor-pointer text-sm font-medium text-brand-orange underline hover:text-brand-orange dark:text-brand-orange dark:hover:text-brand-orange-light">
							Registrar pago
						</button>
					{/if}
				{/if}
			</div>
		{/each}
	{/if}
</div>
