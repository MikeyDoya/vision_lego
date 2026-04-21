<script lang="ts">
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();
</script>

<svelte:head>
	<title>Vision Lego — Gafas de Sol y Monturas Ópticas</title>
</svelte:head>

<section class="bg-gray-50 py-20 text-center">
	<div class="mx-auto max-w-3xl px-4">
		<h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
			Tu estilo, tu visión
		</h1>
		<p class="mt-4 text-lg text-gray-600">
			Gafas de sol y monturas ópticas para cada personalidad.
		</p>
		<a
			href="/productos"
			class="mt-8 inline-block rounded-lg bg-gray-900 px-8 py-3 text-base font-medium text-white hover:bg-gray-700"
		>
			Ver productos
		</a>
	</div>
</section>

{#if data.featured.length > 0}
	<section class="mx-auto max-w-7xl px-4 py-16 sm:px-6">
		<h2 class="mb-8 text-2xl font-bold text-gray-900">Productos destacados</h2>
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
			{#each data.featured as product}
				<a href="/productos/{product.slug}" class="group">
					<div class="aspect-square overflow-hidden rounded-xl bg-gray-100">
						{#if product.primaryImage}
							<img
								src={product.primaryImage}
								alt={product.name}
								class="h-full w-full object-cover transition group-hover:scale-105"
								loading="lazy"
							/>
						{:else}
							<div class="flex h-full items-center justify-center text-gray-400">
								<svg class="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
								</svg>
							</div>
						{/if}
					</div>
					<div class="mt-3">
						<p class="text-sm font-medium text-gray-900 group-hover:underline">{product.name}</p>
						<p class="mt-1 text-sm text-gray-600">{product.price}</p>
					</div>
				</a>
			{/each}
		</div>
	</section>
{/if}

<section class="border-t border-gray-200 bg-white py-10">
	<div class="mx-auto max-w-7xl px-4 sm:px-6">
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
			<div class="flex items-center gap-3">
				<svg class="h-8 w-8 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
				</svg>
				<div>
					<p class="font-medium text-gray-900">Envío a todo Colombia</p>
					<p class="text-sm text-gray-500">Rápido y seguro</p>
				</div>
			</div>
			<div class="flex items-center gap-3">
				<svg class="h-8 w-8 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
				</svg>
				<div>
					<p class="font-medium text-gray-900">Pago seguro</p>
					<p class="text-sm text-gray-500">Procesado con MercadoPago</p>
				</div>
			</div>
			<div class="flex items-center gap-3">
				<svg class="h-8 w-8 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
				</svg>
				<div>
					<p class="font-medium text-gray-900">Cambios sin complicaciones</p>
					<p class="text-sm text-gray-500">Fácil y sin costo</p>
				</div>
			</div>
		</div>
	</div>
</section>
