<script lang="ts">
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();

	const maxSale = $derived(Math.max(...data.salesByDay.map((d) => d.total), 1));
</script>

<svelte:head>
	<title>Analíticas — Vision Lego</title>
</svelte:head>

<h1 class="mb-6 text-2xl font-bold text-gray-900">Analíticas</h1>

<form method="get" class="mb-6 flex flex-wrap items-end gap-3">
	<div>
		<label for="desde" class="block text-sm font-medium text-gray-700">Desde</label>
		<input id="desde" name="desde" type="date" value={data.from} class="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none" />
	</div>
	<div>
		<label for="hasta" class="block text-sm font-medium text-gray-700">Hasta</label>
		<input id="hasta" name="hasta" type="date" value={data.to} class="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none" />
	</div>
	<button type="submit" class="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700">Ver</button>
</form>

<!-- Summary cards -->
<div class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
	<div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
		<p class="text-sm font-medium text-gray-500">Ingresos totales</p>
		<p class="mt-2 text-2xl font-bold text-gray-900">{data.summary.totalIncome}</p>
	</div>
	<div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
		<p class="text-sm font-medium text-gray-500">Gastos totales</p>
		<p class="mt-2 text-2xl font-bold text-gray-900">{data.summary.totalExpenses}</p>
	</div>
	<div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
		<p class="text-sm font-medium text-gray-500">Utilidad neta</p>
		<p class="mt-2 text-2xl font-bold {data.summary.netProfitRaw >= 0 ? 'text-green-600' : 'text-red-600'}">
			{data.summary.netProfit}
		</p>
	</div>
</div>

<!-- Sales chart -->
<section class="mb-8 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
	<h2 class="mb-4 text-lg font-semibold text-gray-900">Ventas por día</h2>
	{#if data.salesByDay.length === 0}
		<p class="text-sm text-gray-500">Sin ventas en este período.</p>
	{:else}
		<div class="flex h-48 items-end gap-1 overflow-x-auto">
			{#each data.salesByDay as day (day.day)}
				{@const height = (day.total / maxSale) * 100}
				<div class="flex min-w-[28px] flex-1 flex-col items-center gap-1">
					<div
						class="w-full rounded-t bg-gray-800"
						style="height: {Math.max(height, 2)}%"
						title="{day.day}: {day.total.toLocaleString('es-CO')}"
					></div>
					<span class="text-[10px] text-gray-400 rotate-45 origin-left">{day.day.slice(5)}</span>
				</div>
			{/each}
		</div>
	{/if}
</section>

<!-- Top products -->
<section class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
	<h2 class="mb-4 text-lg font-semibold text-gray-900">Top 5 productos más vendidos</h2>
	{#if data.topProducts.length === 0}
		<p class="text-sm text-gray-500">Sin datos en este período.</p>
	{:else}
		<div class="space-y-3">
			{#each data.topProducts as product, i (product.name)}
				<div class="flex items-center justify-between gap-4">
					<div class="flex items-center gap-3">
						<span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
							{i + 1}
						</span>
						<span class="text-sm font-medium text-gray-900">{product.name}</span>
					</div>
					<div class="text-right">
						<p class="text-sm font-semibold text-gray-900">{product.revenue}</p>
						<p class="text-xs text-gray-500">{product.qty} vendidos</p>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</section>
