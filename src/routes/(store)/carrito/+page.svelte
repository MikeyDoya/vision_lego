<script lang="ts">
	import type { PageServerData } from './$types';
	import { formatCOP } from '$lib/utils/currency';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';

	let { data }: { data: PageServerData } = $props();
</script>

<svelte:head>
	<title>Carrito — Vision Lego</title>
</svelte:head>

<div class="mx-auto max-w-4xl px-4 py-8 sm:px-6">
	<h1 class="mb-8 text-2xl font-bold text-gray-900">Tu carrito</h1>

	{#if data.cart.length === 0}
		<div class="flex flex-col items-center py-24 text-center">
			<svg class="h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
			</svg>
			<p class="mt-4 text-lg font-medium text-gray-900">Tu carrito está vacío</p>
			<p class="mt-1 text-sm text-gray-500">Explora nuestros productos y agrega algo que te guste.</p>
			<a href="/productos" class="mt-6 inline-block rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-700">
				Ver productos
			</a>
		</div>
	{:else}
		<div class="grid gap-8 lg:grid-cols-3">
			<!-- Cart items -->
			<div class="lg:col-span-2">
				<ul class="divide-y divide-gray-200">
					{#each data.cart as item (item.cartItemId)}
						<li class="flex gap-4 py-6">
							<a href="/productos/{item.productSlug}" class="shrink-0">
								{#if item.primaryImage}
									<img
										src={item.primaryImage}
										alt={item.productName}
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

							<div class="flex flex-1 flex-col gap-1">
								<a href="/productos/{item.productSlug}" class="font-medium text-gray-900 hover:text-gray-700">
									{item.productName}
								</a>
								{#if item.variantLabel}
									<p class="text-sm text-gray-500">{item.variantLabel}</p>
								{/if}
								<p class="text-sm font-semibold text-gray-900">{formatCOP(item.unitPrice)}</p>

								<div class="mt-2 flex items-center gap-4">
									<!-- Quantity update -->
									<form
										method="post"
										action="?/updateQuantity"
										use:enhance={() => ({ update }) => update({ reset: false })}
										class="flex items-center rounded-lg border border-gray-300"
									>
										<input type="hidden" name="cartItemId" value={item.cartItemId} />
										<button
											type="submit"
											name="quantity"
											value={Math.max(1, item.quantity - 1)}
											class="flex h-9 w-9 items-center justify-center text-gray-500 hover:text-gray-900"
											aria-label="Reducir cantidad"
										>−</button>
										<span class="w-8 text-center text-sm">{item.quantity}</span>
										<button
											type="submit"
											name="quantity"
											value={Math.min(item.stock, item.quantity + 1)}
											disabled={item.quantity >= item.stock}
											class="flex h-9 w-9 items-center justify-center text-gray-500 hover:text-gray-900 disabled:opacity-30"
											aria-label="Aumentar cantidad"
										>+</button>
									</form>

									<!-- Remove -->
									<form method="post" action="?/removeItem" use:enhance={() => ({ update }) => update()}>
										<input type="hidden" name="cartItemId" value={item.cartItemId} />
										<button type="submit" class="text-sm text-gray-400 hover:text-red-600">
											Eliminar
										</button>
									</form>
								</div>
							</div>

							<div class="shrink-0 text-right">
								<p class="font-semibold text-gray-900">{formatCOP(item.subtotal)}</p>
							</div>
						</li>
					{/each}
				</ul>
			</div>

			<!-- Order summary -->
			<div class="lg:col-span-1">
				<div class="rounded-2xl bg-gray-50 p-6">
					<h2 class="text-lg font-semibold text-gray-900">Resumen</h2>
					<div class="mt-4 space-y-2">
						{#each data.cart as item (item.cartItemId)}
							<div class="flex justify-between text-sm text-gray-600">
								<span class="line-clamp-1 flex-1 pr-2">{item.productName} ×{item.quantity}</span>
								<span class="shrink-0">{formatCOP(item.subtotal)}</span>
							</div>
						{/each}
					</div>
					<div class="mt-4 border-t border-gray-200 pt-4">
						<div class="flex justify-between font-semibold text-gray-900">
							<span>Subtotal</span>
							<span>{formatCOP(data.total)}</span>
						</div>
						<p class="mt-1 text-xs text-gray-500">Envío calculado al finalizar el pedido</p>
					</div>
					<a
						href="/checkout"
						class="mt-6 block h-12 w-full rounded-xl bg-gray-900 text-center text-sm font-medium leading-[3rem] text-white hover:bg-gray-700"
					>
						Finalizar pedido
					</a>
					<a href="/productos" class="mt-3 block text-center text-sm text-gray-500 hover:text-gray-900">
						Seguir comprando
					</a>
				</div>
			</div>
		</div>
	{/if}
</div>
