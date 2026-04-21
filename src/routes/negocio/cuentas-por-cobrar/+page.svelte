<script lang="ts">
	import { enhance } from '$app/forms';
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
		paid:    'bg-green-900/50 text-green-300 ring-1 ring-green-700',
		partial: 'bg-yellow-900/50 text-yellow-300 ring-1 ring-yellow-700',
		pending: 'bg-gray-800 text-gray-400 ring-1 ring-gray-700',
	};
</script>

<svelte:head>
	<title>Cuentas por cobrar — Vision Lego</title>
</svelte:head>

<div class="mb-6 flex flex-wrap items-center justify-between gap-4">
	<h1 class="text-2xl font-bold text-white">Cuentas por cobrar</h1>
	<button
		onclick={() => (showForm = !showForm)}
		class="cursor-pointer rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-semibold text-gray-950 transition hover:bg-amber-300"
	>
		{showForm ? 'Cancelar' : '+ Nueva cuenta'}
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
			class="grid grid-cols-1 gap-4 sm:grid-cols-2"
		>
			<div>
				<label for="customerName" class="block text-sm font-medium text-gray-300">Nombre del cliente</label>
				<input id="customerName" name="customerName" type="text" required class="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400" />
			</div>
			<div>
				<label for="customerPhone" class="block text-sm font-medium text-gray-300">Teléfono</label>
				<input id="customerPhone" name="customerPhone" type="tel" class="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400" />
			</div>
			<div class="sm:col-span-2">
				<label for="description" class="block text-sm font-medium text-gray-300">Descripción</label>
				<input id="description" name="description" type="text" required class="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400" />
			</div>
			<div>
				<label for="amount" class="block text-sm font-medium text-gray-300">Monto total (COP)</label>
				<input id="amount" name="amount" type="number" required min="1" class="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400" />
			</div>
			<div>
				<label for="dueDate" class="block text-sm font-medium text-gray-300">Fecha límite</label>
				<input id="dueDate" name="dueDate" type="date" class="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400" />
			</div>
			<div>
				<button type="submit" disabled={saving} class="cursor-pointer rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-semibold text-gray-950 transition hover:bg-amber-300 disabled:opacity-60">
					{saving ? 'Guardando…' : 'Guardar'}
				</button>
			</div>
		</form>
	</div>
{/if}

<div class="space-y-4">
	{#if data.receivables.length === 0}
		<div class="rounded-xl bg-gray-900 py-16 text-center text-gray-500 ring-1 ring-gray-800">Sin cuentas registradas.</div>
	{:else}
		{#each data.receivables as rec (rec.id)}
			<div class="rounded-xl bg-gray-900 p-5 ring-1 ring-gray-800 {rec.isOverdue ? 'border-l-4 border-red-500' : ''}">
				<div class="flex flex-wrap items-start justify-between gap-3">
					<div>
						<p class="font-semibold text-white">{rec.customerName}</p>
						{#if rec.customerPhone}<p class="text-sm text-gray-500">{rec.customerPhone}</p>{/if}
						<p class="mt-1 text-sm text-gray-300">{rec.description}</p>
						{#if rec.dueDate}
							<p class="mt-1 text-xs {rec.isOverdue ? 'font-medium text-red-400' : 'text-gray-500'}">
								Vence: {rec.dueDate}{rec.isOverdue ? ' · Vencida' : ''}
							</p>
						{/if}
					</div>
					<div class="text-right">
						<span class="rounded-full px-2 py-1 text-xs font-medium {statusColors[rec.paymentStatus] ?? 'bg-gray-800 text-gray-400'}">
							{statusLabels[rec.paymentStatus]}
						</span>
						<p class="mt-2 text-lg font-bold text-amber-400">{rec.amountFormatted}</p>
						{#if rec.paymentStatus !== 'paid'}
							<p class="text-sm text-gray-500">Pendiente: {rec.remainingFormatted}</p>
						{/if}
					</div>
				</div>

				{#if !rec.isPaid}
					{#if payingId === rec.id}
						<form method="post" action="?/recordPayment" use:enhance class="mt-4 flex gap-2">
							<input type="hidden" name="id" value={rec.id} />
							<input type="number" name="payment" min="1" placeholder="Monto recibido" class="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-amber-400 focus:outline-none" />
							<button type="submit" class="cursor-pointer rounded-lg bg-green-700 px-3 py-2 text-sm font-medium text-white hover:bg-green-600">Registrar</button>
							<button type="button" onclick={() => (payingId = null)} class="cursor-pointer rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-400 hover:bg-gray-800">Cancelar</button>
						</form>
					{:else}
						<button onclick={() => (payingId = rec.id)} class="mt-3 cursor-pointer text-sm font-medium text-amber-400 underline hover:text-amber-300">
							Registrar pago
						</button>
					{/if}
				{/if}
			</div>
		{/each}
	{/if}
</div>
