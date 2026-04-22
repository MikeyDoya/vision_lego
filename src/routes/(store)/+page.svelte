<script lang="ts">
	import type { PageServerData } from './$types';
	import { formatCOP } from '$lib/utils/currency';

	let { data }: { data: PageServerData } = $props();

	const categoryLabels: Record<string, string> = {
		sunglasses: 'Gafas de sol',
		optical: 'Monturas ópticas',
	};
</script>

<svelte:head>
	<title>Vision Lego — Gafas de Sol y Monturas Ópticas</title>
</svelte:head>

<!-- Hero -->
<section class="relative overflow-hidden bg-gray-950 text-white">
	<!-- Warm gradient layer -->
	<div class="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-900/40 via-gray-950 to-gray-900"></div>
	<!-- Subtle texture dots -->
	<div
		class="pointer-events-none absolute inset-0 opacity-[0.04]"
		style="background-image: radial-gradient(circle, #fff 1px, transparent 1px); background-size: 28px 28px;"
	></div>

	<div class="relative mx-auto max-w-5xl px-6 py-28 sm:py-36 text-center">
		<p class="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-amber-400">Óptica & Estilo</p>
		<h1 class="text-5xl font-bold leading-tight tracking-tight sm:text-7xl">
			Tu visión,<br />
			<span class="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">tu identidad.</span>
		</h1>
		<p class="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-gray-300">
			Gafas de sol y monturas ópticas seleccionadas para cada personalidad. Calidad premium, precios reales.
		</p>
		<div class="mt-10 flex flex-wrap items-center justify-center gap-4">
			<a
				href="/productos"
				class="rounded-xl bg-amber-400 px-8 py-3.5 text-sm font-semibold text-gray-950 transition hover:bg-amber-300"
			>
				Ver colección
			</a>
			<a
				href="/productos?categoria=sunglasses"
				class="rounded-xl border border-white/20 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
			>
				Gafas de sol
			</a>
		</div>
	</div>
</section>

<!-- Featured products -->
{#if data.featured.length > 0}
	<section class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
		<div class="mb-8 flex items-end justify-between">
			<div>
				<p class="text-xs font-semibold uppercase tracking-widest text-amber-400">Selección</p>
				<h2 class="mt-1 text-2xl font-bold text-white">Productos destacados</h2>
			</div>
			<a href="/productos" class="text-sm font-medium text-gray-500 hover:text-white">
				Ver todos →
			</a>
		</div>
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
			{#each data.featured as product (product.id)}
				<a href="/productos/{product.slug}" class="group flex flex-col">
					<div class="aspect-square overflow-hidden rounded-2xl bg-gray-800">
						{#if product.primaryImage}
							<img
								src={product.primaryImage}
								alt={product.name}
								class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
								loading="lazy"
							/>
						{:else}
							<div class="flex h-full items-center justify-center">
								<svg class="h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
								</svg>
							</div>
						{/if}
					</div>
					<div class="mt-3 flex flex-col gap-0.5">
						<p class="text-xs font-medium uppercase tracking-wide text-gray-400">
							{categoryLabels[product.category] ?? product.category}
						</p>
						<p class="text-sm font-semibold leading-tight text-gray-100 line-clamp-2 group-hover:underline">
							{product.name}
						</p>
						<p class="text-sm font-bold text-amber-400">{formatCOP(product.basePrice)}</p>
					</div>
				</a>
			{/each}
		</div>
	</section>
{/if}

<!-- Category blocks -->
<section class="bg-gray-950 py-14">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="grid gap-4 sm:grid-cols-2">
			<a
				href="/productos?categoria=sunglasses"
				class="group relative overflow-hidden rounded-2xl bg-gray-900 p-8 text-white"
			>
				<div class="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-800/50 to-transparent"></div>
				<p class="relative text-xs font-semibold uppercase tracking-widest text-amber-400">Categoría</p>
				<h3 class="relative mt-2 text-2xl font-bold">Gafas de sol</h3>
				<p class="relative mt-1 text-sm text-gray-300">Protección UV · Diseño · Estilo</p>
				<span class="relative mt-6 inline-block text-sm font-medium text-amber-300 group-hover:translate-x-1 transition-transform">
					Explorar →
				</span>
			</a>
			<a
				href="/productos?categoria=optical"
				class="group relative overflow-hidden rounded-2xl bg-gray-800 p-8 text-white"
			>
				<div class="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-900/40 to-transparent"></div>
				<p class="relative text-xs font-semibold uppercase tracking-widest text-blue-300">Categoría</p>
				<h3 class="relative mt-2 text-2xl font-bold">Monturas ópticas</h3>
				<p class="relative mt-1 text-sm text-gray-300">Acetato · Metal · TR90</p>
				<span class="relative mt-6 inline-block text-sm font-medium text-blue-300 group-hover:translate-x-1 transition-transform">
					Explorar →
				</span>
			</a>
		</div>
	</div>
</section>

<!-- Trust signals -->
<section class="bg-gray-950 py-12 border-t border-gray-800">
	<div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
		<div class="grid grid-cols-1 gap-8 sm:grid-cols-3">
			<div class="flex flex-col items-center gap-3 text-center">
				<div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/10">
					<svg class="h-7 w-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
					</svg>
				</div>
				<div>
					<p class="font-semibold text-white">Envío a todo Colombia</p>
					<p class="mt-0.5 text-sm text-gray-500">Rápido y con seguimiento</p>
				</div>
			</div>
			<div class="flex flex-col items-center gap-3 text-center">
				<div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-400/10">
					<svg class="h-7 w-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
					</svg>
				</div>
				<div>
					<p class="font-semibold text-white">Pago seguro</p>
					<p class="mt-0.5 text-sm text-gray-500">Procesado con MercadoPago</p>
				</div>
			</div>
			<div class="flex flex-col items-center gap-3 text-center">
				<div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-400/10">
					<svg class="h-7 w-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
					</svg>
				</div>
				<div>
					<p class="font-semibold text-white">Cambios sin complicaciones</p>
					<p class="mt-0.5 text-sm text-gray-500">Fácil y sin costo adicional</p>
				</div>
			</div>
		</div>
	</div>
</section>
