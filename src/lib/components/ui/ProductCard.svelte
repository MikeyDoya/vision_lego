<script lang="ts">
	import ProductImage from '$lib/components/ui/ProductImage.svelte';
	import { formatCOP, applyDiscount } from '$lib/utils/currency';

	let { product }: {
		product: {
			id: string;
			name: string;
			slug: string;
			basePrice: number;
			category: string;
			primaryImage: string | null;
			isOnSale?: boolean;
			discountPercent?: number | null;
		};
	} = $props();

	const categoryLabels: Record<string, string> = {
		sunglasses: 'Gafas de sol',
		optical: 'Monturas ópticas',
		accessories: 'Accesorios',
	};

	const hasDiscount = $derived(!!product.isOnSale && !!product.discountPercent && product.discountPercent > 0);
	const finalPrice = $derived(hasDiscount ? applyDiscount(product.basePrice, product.discountPercent!) : product.basePrice);
</script>

<a href="/productos/{product.slug}" class="group flex flex-col">
	<div class="relative aspect-square overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-900">
		{#if product.primaryImage}
			<ProductImage
				basePath={product.primaryImage}
				alt={product.name}
				size="thumb"
				class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
				loading="lazy"
			/>
		{:else}
			<div class="flex h-full items-center justify-center">
				<svg class="h-12 w-12 text-gray-400 dark:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
				</svg>
			</div>
		{/if}
		{#if hasDiscount}
			<span class="absolute left-2 top-2 rounded-md bg-brand-orange px-2 py-0.5 text-xs font-bold text-white shadow">-{product.discountPercent}%</span>
		{/if}
	</div>
	<div class="mt-3 flex flex-col gap-1">
		<p class="text-xs font-medium uppercase tracking-wide text-gray-500">
			{categoryLabels[product.category] ?? product.category}
		</p>
		<p class="line-clamp-2 text-sm font-semibold leading-tight text-gray-900 dark:text-white">{product.name}</p>
		{#if hasDiscount}
			<div class="flex items-baseline gap-2">
				<span class="text-sm font-bold text-brand-orange">{formatCOP(finalPrice)}</span>
				<span class="text-xs text-gray-400 line-through dark:text-gray-500">{formatCOP(product.basePrice)}</span>
			</div>
		{:else}
			<p class="text-sm font-bold text-brand-orange">{formatCOP(product.basePrice)}</p>
		{/if}
	</div>
</a>
