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
		paid: 'bg-green-100 text-green-700',
		partial: 'bg-yellow-100 text-yellow-700',
		pending: 'bg-gray-100 text-gray-600',
	};
</script>

<svelte:head>
	<title>Cuentas por cobrar — Vision Lego</title>
</svelte:head>

<div class="mb-6 flex flex-wrap items-center justify-between gap-4">
	<h1 class="text-2xl font-bold text-gray-900">Cuentas por cobrar</h1>
	<button
		onclick={() => (showForm = !showForm)}
		class="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700"
	>
		{showForm ? 'Cancelar' : '+ Nueva cuenta'}
	</button>
</div>

{#if showForm}
	<div class="mb-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
		{#if form?.message}
			<p class="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{form.message}</p>
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
				<label for="customerName" class="block text-sm font-medium text-gray-700">Nombre del cliente</label>
				<input id="customerName" name="customerName" type="text" required class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900" />
			</div>
			<div>
				<label for="customerPhone" class="block text-sm font-medium text-gray-700">Teléfono</label>
				<input id="customerPhone" name="customerPhone" type="tel" class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900" />
			</div>
			<div class="sm:col-span-2">
				<label for="description" class="block text-sm font-medium text-gray-700">Descripción</label>
				<input id="description" name="description" type="text" required class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900" />
			</div>
			<div>
				<label for="amount" class="block text-sm font-medium text-gray-700">Monto total (COP)</label>
				<input id="amount" name="amount" type="number" required min="1" class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900" />
			</div>
			<div>
				<label for="dueDate" class="block text-sm font-medium text-gray-700">Fecha límite</label>
				<input id="dueDate" name="dueDate" type="date" class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900" />
			</div>
			<div>
				<button type="submit" disabled={saving} class="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-60">
					{saving ? 'Guardando…' : 'Guardar'}
				</button>
			</div>
		</form>
	</div>
{/if}

<div class="space-y-4">
	{#if data.receivables.length === 0}
		<div class="rounded-xl bg-white py-16 text-center text-gray-500 shadow-sm ring-1 ring-gray-200">Sin cuentas registradas.</div>
	{:else}
		{#each data.receivables as rec (rec.id)}
			<div class="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200 {rec.isOverdue ? 'border-l-4 border-red-500' : ''}">
				<div class="flex flex-wrap items-start justify-between gap-3">
					<div>
						<p class="font-semibold text-gray-900">{rec.customerName}</p>
						{#if rec.customerPhone}<p class="text-sm text-gray-500">{rec.customerPhone}</p>{/if}
						<p class="mt-1 text-sm text-gray-700">{rec.description}</p>
						{#if rec.dueDate}
							<p class="mt-1 text-xs {rec.isOverdue ? 'font-medium text-red-600' : 'text-gray-500'}">
								Vence: {rec.dueDate}{rec.isOverdue ? ' · Vencida' : ''}
							</p>
						{/if}
					</div>
					<div class="text-right">
						<span class="rounded-full px-2 py-1 text-xs font-medium {statusColors[rec.paymentStatus]}">
							{statusLabels[rec.paymentStatus]}
						</span>
						<p class="mt-2 text-lg font-bold text-gray-900">{rec.amountFormatted}</p>
						{#if rec.paymentStatus !== 'paid'}
							<p class="text-sm text-gray-500">Pendiente: {rec.remainingFormatted}</p>
						{/if}
					</div>
				</div>

				{#if !rec.isPaid}
					{#if payingId === rec.id}
						<form method="post" action="?/recordPayment" use:enhance class="mt-4 flex gap-2">
							<input type="hidden" name="id" value={rec.id} />
							<input type="number" name="payment" min="1" placeholder="Monto recibido" class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none" />
							<button type="submit" class="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700">Registrar</button>
							<button type="button" onclick={() => (payingId = null)} class="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50">Cancelar</button>
						</form>
					{:else}
						<button onclick={() => (payingId = rec.id)} class="mt-3 text-sm font-medium text-gray-900 underline">
							Registrar pago
						</button>
					{/if}
				{/if}
			</div>
		{/each}
	{/if}
</div>
