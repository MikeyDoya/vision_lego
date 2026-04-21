<script lang="ts">
	import type { PageServerData } from './$types';
	import { formatCOP } from '$lib/utils/currency';
	import { enhance } from '$app/forms';

	let { data }: { data: PageServerData } = $props();
</script>

<svelte:head>
	<title>Lista de deseos — Vision Lego</title>
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-8 sm:px-6">
	<nav class="mb-6 flex items-center gap-2 text-sm text-gray-500">
		<a href="/cuenta" class="hover:text-gray-900">Mi cuenta</a>
		<span>/</span>
		<span class="text-gray-900">Lista de deseos</span>
	</nav>

	<h1 class="mb-8 text-2xl font-bold text-gray-900">Lista de deseos</h1>

	{#if data.items.length === 0}
		<div class="flex flex-col items-center py-16 text-center">
			<svg class="h-14 w-14 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
			</svg>
			<p class="mt-4 font-medium text-gray-900">Tu lista de deseos está vacía</p>
			<a href="/productos" class="mt-3 text-sm text-gray-500 underline hover:text-gray-900">
				Explorar productos
			</a>
		</div>
	{:else}
		<div class="grid gap-4 sm:grid-cols-2">
			{#each data.items as item (item.productId)}
				<div class="group relative flex gap-4 rounded-xl border border-gray-200 p-4">
					<a href="/productos/{item.slug}" class="shrink-0">
						{#if item.primaryImage}
							<img
								src={item.primaryImage}
								alt={item.name}
								class="h-24 w-24 rounded-lg object-cover"
							/>
						{:else}
							<div class="flex h-24 w-24 items-center justify-center rounded-lg bg-gray-100">
								<svg class="h-8 w-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01" />
								</svg>
							</div>
						{/if}
					</a>

					<div class="flex flex-1 flex-col justify-between">
						<div>
							<a href="/productos/{item.slug}" class="text-sm font-medium text-gray-900 hover:text-gray-700 line-clamp-2">
								{item.name}
							</a>
							<p class="mt-1 text-sm font-bold text-gray-900">{formatCOP(item.basePrice)}</p>
							{#if !item.isActive || !item.hasStock}
								<span class="mt-1 inline-block rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
									Agotado
								</span>
							{/if}
						</div>

						<div class="mt-3 flex items-center gap-3">
							{#if item.isActive && item.hasStock}
								<a
									href="/productos/{item.slug}"
									class="flex h-9 flex-1 items-center justify-center rounded-lg bg-gray-900 text-xs font-medium text-white hover:bg-gray-700"
								>
									Ver producto
								</a>
							{/if}
							<form method="post" action="?/remove" use:enhance>
								<input type="hidden" name="productId" value={item.productId} />
								<button
									type="submit"
									class="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-500"
									aria-label="Quitar de lista de deseos"
								>
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</form>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
