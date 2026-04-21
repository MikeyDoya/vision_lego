<script lang="ts">
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();

	const statusColors: Record<string, string> = {
		pending:    'bg-yellow-900/50 text-yellow-300 ring-1 ring-yellow-700',
		paid:       'bg-green-900/50 text-green-300 ring-1 ring-green-700',
		processing: 'bg-blue-900/50 text-blue-300 ring-1 ring-blue-700',
		shipped:    'bg-purple-900/50 text-purple-300 ring-1 ring-purple-700',
		delivered:  'bg-gray-800 text-gray-300 ring-1 ring-gray-700',
		cancelled:  'bg-red-900/50 text-red-300 ring-1 ring-red-700',
		refunded:   'bg-orange-900/50 text-orange-300 ring-1 ring-orange-700',
	};
</script>

<svelte:head>
	<title>Pedidos — Vision Lego</title>
</svelte:head>

<div class="mb-6 flex items-center justify-between">
	<h1 class="text-2xl font-bold text-white">Pedidos</h1>
</div>

<form method="get" class="mb-6 flex flex-wrap gap-3">
	<select
		name="estado"
		class="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-300 focus:border-amber-400 focus:outline-none"
		onchange={(e) => (e.currentTarget.form as HTMLFormElement)?.submit()}
	>
		<option value="">Todos los estados</option>
		{#each Object.entries(data.statusLabels) as [val, label] (val)}
			<option value={val} selected={data.status === val}>{label}</option>
		{/each}
	</select>
</form>

<div class="overflow-hidden rounded-xl bg-gray-900 ring-1 ring-gray-800">
	{#if data.orders.length === 0}
		<div class="py-16 text-center text-gray-500">No hay pedidos{data.status ? ' con este estado' : ''}.</div>
	{:else}
		<div class="overflow-x-auto">
			<table class="min-w-full divide-y divide-gray-800 text-sm">
				<thead class="bg-gray-800/50">
					<tr>
						<th class="px-4 py-3 text-left font-medium text-gray-500">Cliente</th>
						<th class="px-4 py-3 text-left font-medium text-gray-500">Estado</th>
						<th class="px-4 py-3 text-left font-medium text-gray-500">Total</th>
						<th class="px-4 py-3 text-left font-medium text-gray-500">Fecha</th>
						<th class="px-4 py-3"></th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-800">
					{#each data.orders as order (order.id)}
						<tr class="hover:bg-gray-800/40">
							<td class="px-4 py-3">
								<p class="font-medium text-white">{order.customerName}</p>
								<p class="text-xs text-gray-500">{order.customerEmail}</p>
							</td>
							<td class="px-4 py-3">
								<span class="rounded-full px-2 py-1 text-xs font-medium {statusColors[order.status] ?? 'bg-gray-800 text-gray-400'}">
									{order.statusLabel}
								</span>
							</td>
							<td class="px-4 py-3 font-medium text-amber-400">{order.totalFormatted}</td>
							<td class="px-4 py-3 text-gray-500">
								{new Date(order.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
							</td>
							<td class="px-4 py-3 text-right">
								<a href="/negocio/pedidos/{order.id}" class="text-sm font-medium text-gray-300 hover:text-white hover:underline">
									Ver detalle
								</a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
