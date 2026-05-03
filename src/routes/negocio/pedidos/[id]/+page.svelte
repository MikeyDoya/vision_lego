<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { ActionData, PageServerData } from './$types';

	let { data, form }: { data: PageServerData; form: ActionData } = $props();

	const statusColors: Record<string, string> = {
		pending:    'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:ring-yellow-700',
		paid:       'bg-green-100 text-green-700 ring-1 ring-green-200 dark:bg-green-900/50 dark:text-green-300 dark:ring-green-700',
		processing: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:ring-blue-700',
		shipped:    'bg-purple-100 text-purple-700 ring-1 ring-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:ring-purple-700',
		delivered:  'bg-gray-100 text-gray-700 ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700',
		cancelled:  'bg-red-100 text-red-700 ring-1 ring-red-200 dark:bg-red-900/50 dark:text-red-300 dark:ring-red-700',
		refunded:   'bg-orange-100 text-orange-700 ring-1 ring-orange-200 dark:bg-orange-900/50 dark:text-orange-300 dark:ring-orange-700',
	};
</script>

<svelte:head>
	<title>Pedido — Vision Lego</title>
</svelte:head>

<div class="mb-6 flex items-center gap-4">
	<a href="/negocio/pedidos" class="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white">← Pedidos</a>
	<h1 class="text-2xl font-bold text-gray-900 dark:text-white">Pedido</h1>
</div>

{#if form?.message}
	<p class="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200 dark:bg-red-900/40 dark:text-red-300 dark:ring-red-800">{form.message}</p>
{/if}

<div class="grid gap-6 lg:grid-cols-3">
	<div class="space-y-6 lg:col-span-2">
		<!-- Items -->
		<section class="rounded-xl bg-white p-6 ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
			<h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Productos</h2>
			<table class="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
				<thead class="bg-gray-100/80 dark:bg-gray-800/50">
					<tr>
						<th class="px-3 py-2 text-left font-medium text-gray-500">Producto</th>
						<th class="px-3 py-2 text-left font-medium text-gray-500">Cant.</th>
						<th class="px-3 py-2 text-left font-medium text-gray-500">Precio unit.</th>
						<th class="px-3 py-2 text-left font-medium text-gray-500">Subtotal</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200 dark:divide-gray-800">
					{#each data.order.items as item (item.id)}
						<tr>
							<td class="px-3 py-2">
								<p class="font-medium text-gray-900 dark:text-white">{item.productName}</p>
								{#if item.variantLabel}<p class="text-xs text-gray-500">{item.variantLabel}</p>{/if}
							</td>
							<td class="px-3 py-2 text-gray-600 dark:text-gray-400">{item.quantity}</td>
							<td class="px-3 py-2 text-gray-600 dark:text-gray-400">{item.unitPriceFormatted}</td>
							<td class="px-3 py-2 font-medium text-gray-900 dark:text-white">{item.subtotalFormatted}</td>
						</tr>
					{/each}
				</tbody>
			</table>
			<div class="mt-4 border-t border-gray-200 pt-4 text-right text-sm dark:border-gray-800">
				<p class="text-gray-500">Envío: {data.order.shippingCostFormatted}</p>
				<p class="mt-1 text-lg font-bold text-amber-500 dark:text-amber-400">Total: {data.order.totalFormatted}</p>
			</div>
		</section>

		<!-- Shipping address -->
		<section class="rounded-xl bg-white p-6 ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
			<h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Dirección de entrega</h2>
			<p class="text-sm text-gray-700 dark:text-gray-300">{data.order.shippingAddress}</p>
			<p class="text-sm text-gray-700 dark:text-gray-300">{data.order.shippingCity}, {data.order.shippingDept} {data.order.shippingZip ?? ''}</p>
			{#if data.order.shippingMethod}
				<p class="mt-2 text-sm text-gray-500">Método: {data.order.shippingMethod.name}</p>
			{/if}
		</section>
	</div>

	<div class="space-y-6">
		<!-- Customer -->
		<section class="rounded-xl bg-white p-6 ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
			<h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Cliente</h2>
			<p class="font-medium text-gray-900 dark:text-white">{data.order.customerName}</p>
			<p class="text-sm text-gray-600 dark:text-gray-400">{data.order.customerEmail}</p>
			{#if data.order.customerPhone}<p class="text-sm text-gray-600 dark:text-gray-400">{data.order.customerPhone}</p>{/if}
		</section>

		<!-- Status -->
		<section class="rounded-xl bg-white p-6 ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
			<h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Estado del pedido</h2>
			<span class="rounded-full px-3 py-1.5 text-sm font-medium {statusColors[data.order.status] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'}">
				{data.order.statusLabel}
			</span>

			<form method="post" action="?/updateStatus" use:enhance={() => async ({ result, update }) => { if (result.type === 'success') { await invalidateAll(); } else { await update(); } }} class="mt-4 space-y-2">
				<label for="status" class="block text-sm font-medium text-gray-600 dark:text-gray-400">Cambiar estado</label>
				<select
					id="status"
					name="status"
					class="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-amber-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
				>
					{#each Object.entries(data.statusLabels) as [val, label] (val)}
						<option value={val} selected={data.order.status === val}>{label}</option>
					{/each}
				</select>
				<button type="submit" class="w-full cursor-pointer rounded-lg bg-amber-400 py-2 text-sm font-semibold text-gray-950 transition hover:bg-amber-300">
					Actualizar estado
				</button>
			</form>

			{#if data.order.wompiPaymentId}
				<div class="mt-4 border-t border-gray-200 pt-4 text-xs text-gray-400 dark:border-gray-800 dark:text-gray-600">
					<p>Wompi ID: {data.order.wompiPaymentId}</p>
					<p>Wompi Estado: {data.order.wompiStatus}</p>
				</div>
			{/if}
		</section>

		{#if data.order.notes}
			<section class="rounded-xl bg-white p-6 ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
				<h2 class="mb-2 text-sm font-semibold text-gray-600 dark:text-gray-400">Notas del cliente</h2>
				<p class="text-sm text-gray-700 dark:text-gray-300">{data.order.notes}</p>
			</section>
		{/if}
	</div>
</div>
