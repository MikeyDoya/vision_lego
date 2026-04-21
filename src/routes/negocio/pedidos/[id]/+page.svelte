<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageServerData } from './$types';

	let { data, form }: { data: PageServerData; form: ActionData } = $props();

	const statusColors: Record<string, string> = {
		pending: 'bg-yellow-100 text-yellow-700',
		paid: 'bg-green-100 text-green-700',
		processing: 'bg-blue-100 text-blue-700',
		shipped: 'bg-purple-100 text-purple-700',
		delivered: 'bg-gray-100 text-gray-700',
		cancelled: 'bg-red-100 text-red-700',
		refunded: 'bg-orange-100 text-orange-700',
	};
</script>

<svelte:head>
	<title>Pedido — Vision Lego</title>
</svelte:head>

<div class="mb-6 flex items-center gap-4">
	<a href="/negocio/pedidos" class="text-sm text-gray-500 hover:text-gray-900">← Pedidos</a>
	<h1 class="text-2xl font-bold text-gray-900">Pedido</h1>
</div>

{#if form?.message}
	<p class="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{form.message}</p>
{/if}

<div class="grid gap-6 lg:grid-cols-3">
	<div class="lg:col-span-2 space-y-6">
		<!-- Items -->
		<section class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
			<h2 class="mb-4 text-lg font-semibold text-gray-900">Productos</h2>
			<table class="min-w-full divide-y divide-gray-200 text-sm">
				<thead class="bg-gray-50">
					<tr>
						<th class="px-3 py-2 text-left font-medium text-gray-500">Producto</th>
						<th class="px-3 py-2 text-left font-medium text-gray-500">Cant.</th>
						<th class="px-3 py-2 text-left font-medium text-gray-500">Precio unit.</th>
						<th class="px-3 py-2 text-left font-medium text-gray-500">Subtotal</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100">
					{#each data.order.items as item (item.id)}
						<tr>
							<td class="px-3 py-2">
								<p class="font-medium text-gray-900">{item.productName}</p>
								{#if item.variantLabel}<p class="text-xs text-gray-500">{item.variantLabel}</p>{/if}
							</td>
							<td class="px-3 py-2 text-gray-700">{item.quantity}</td>
							<td class="px-3 py-2 text-gray-700">{item.unitPriceFormatted}</td>
							<td class="px-3 py-2 font-medium text-gray-900">{item.subtotalFormatted}</td>
						</tr>
					{/each}
				</tbody>
			</table>
			<div class="mt-4 border-t border-gray-200 pt-4 text-right text-sm">
				<p class="text-gray-600">Envío: {data.order.shippingCostFormatted}</p>
				<p class="mt-1 text-lg font-bold text-gray-900">Total: {data.order.totalFormatted}</p>
			</div>
		</section>

		<!-- Shipping address -->
		<section class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
			<h2 class="mb-3 text-lg font-semibold text-gray-900">Dirección de entrega</h2>
			<p class="text-sm text-gray-700">{data.order.shippingAddress}</p>
			<p class="text-sm text-gray-700">{data.order.shippingCity}, {data.order.shippingDept} {data.order.shippingZip ?? ''}</p>
			{#if data.order.shippingMethod}
				<p class="mt-2 text-sm text-gray-500">Método: {data.order.shippingMethod.name}</p>
			{/if}
		</section>
	</div>

	<div class="space-y-6">
		<!-- Customer -->
		<section class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
			<h2 class="mb-3 text-lg font-semibold text-gray-900">Cliente</h2>
			<p class="font-medium text-gray-900">{data.order.customerName}</p>
			<p class="text-sm text-gray-600">{data.order.customerEmail}</p>
			{#if data.order.customerPhone}<p class="text-sm text-gray-600">{data.order.customerPhone}</p>{/if}
		</section>

		<!-- Status -->
		<section class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
			<h2 class="mb-3 text-lg font-semibold text-gray-900">Estado del pedido</h2>
			<span class="rounded-full px-3 py-1.5 text-sm font-medium {statusColors[data.order.status]}">
				{data.order.statusLabel}
			</span>

			<form method="post" action="?/updateStatus" use:enhance class="mt-4 space-y-2">
				<label for="status" class="block text-sm font-medium text-gray-700">Cambiar estado</label>
				<select
					id="status"
					name="status"
					class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
				>
					{#each Object.entries(data.statusLabels) as [val, label] (val)}
						<option value={val} selected={data.order.status === val}>{label}</option>
					{/each}
				</select>
				<button type="submit" class="w-full rounded-lg bg-gray-900 py-2 text-sm font-medium text-white hover:bg-gray-700">
					Actualizar estado
				</button>
			</form>

			{#if data.order.mpPaymentId}
				<div class="mt-4 border-t border-gray-200 pt-4 text-xs text-gray-500">
					<p>MP ID: {data.order.mpPaymentId}</p>
					<p>MP Estado: {data.order.mpStatus}</p>
				</div>
			{/if}
		</section>

		{#if data.order.notes}
			<section class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
				<h2 class="mb-2 text-sm font-semibold text-gray-900">Notas del cliente</h2>
				<p class="text-sm text-gray-700">{data.order.notes}</p>
			</section>
		{/if}
	</div>
</div>
