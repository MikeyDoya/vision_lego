<script lang="ts">
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();
</script>

<svelte:head>
	<title>Pedido confirmado — Visión Lego</title>
</svelte:head>

<div class="mx-auto max-w-lg px-4 py-20 text-center">
	<div class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
		<svg class="h-8 w-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
		</svg>
	</div>

	<h1 class="text-2xl font-bold text-gray-900 dark:text-white">¡Pedido recibido!</h1>
	<p class="mt-3 text-gray-600 dark:text-gray-400">
		Tu pedido ha sido registrado correctamente. Nos pondremos en contacto contigo pronto para coordinar el pago y la entrega.
	</p>

	<p class="mt-4 text-sm text-gray-500 dark:text-gray-500">
		Número de pedido: <span class="font-mono font-medium text-gray-700 dark:text-gray-300">{data.orderId.slice(0, 8).toUpperCase()}</span>
	</p>

	<div class="mt-8 flex flex-col items-center gap-3">
		<a
			href="/productos"
			class="inline-block rounded-lg bg-brand-orange px-8 py-3 text-sm font-semibold text-gray-950 transition hover:bg-brand-orange-light"
		>
			Seguir comprando
		</a>
		<a href="/" class="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white">
			Volver al inicio
		</a>
	</div>
</div>
