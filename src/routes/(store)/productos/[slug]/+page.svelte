<script lang="ts">
	import type { PageServerData, ActionData } from './$types';
	import { formatCOP } from '$lib/utils/currency';
	import { enhance } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';
	import ProductImage from '$lib/components/ui/ProductImage.svelte';

	let { data, form }: { data: PageServerData; form: ActionData } = $props();

	let quantity = $state(1);
	let _imageIndex = $state(0);
	let submitting = $state(false);
	let wishlistOverride = $state<boolean | null>(null);
	const isWishlisted = $derived(wishlistOverride !== null ? wishlistOverride : data.isWishlisted);

	let touchStartX = $state(0);
	let touchEndX = $state(0);

	const colors = $derived([...new Set(data.variants.filter((v) => v.color).map((v) => v.color!))]);
	const sizes = $derived([...new Set(data.variants.filter((v) => v.size).map((v) => v.size!))]);
	const materials = $derived([...new Set(data.variants.filter((v) => v.material).map((v) => v.material!))]);

	let _selectedColor = $state<string | null>(null);
	let _selectedSize = $state<string | null>(null);
	let _selectedMaterial = $state<string | null>(null);

	const selectedColor = $derived(_selectedColor ?? colors[0] ?? null);
	const selectedSize = $derived(_selectedSize ?? sizes[0] ?? null);
	const selectedMaterial = $derived(_selectedMaterial ?? materials[0] ?? null);

	const selectedVariantId = $derived.by(() => {
		const match = data.variants.find((v) => {
			const colorOk = !colors.length || !selectedColor || v.color === selectedColor;
			const sizeOk = !sizes.length || !selectedSize || v.size === selectedSize;
			const materialOk = !materials.length || !selectedMaterial || v.material === selectedMaterial;
			return colorOk && sizeOk && materialOk;
		});
		return match?.id ?? null;
	});

	const selectedVariant = $derived(data.variants.find((v) => v.id === selectedVariantId) ?? null);
	const displayPrice = $derived(selectedVariant?.price ?? data.product.basePrice);

	const stockStatus = $derived.by(() => {
		if (!selectedVariant) return null;
		if (selectedVariant.stock === 0) return 'agotado';
		if (selectedVariant.stock <= 3) return 'ultimas';
		return 'disponible';
	});

	const displayImages = $derived.by(() => {
		if (!data.images.length) return [];
		if (selectedVariant) {
			const { color, material } = selectedVariant;
			const groupIds = new Set(
				data.variants
					.filter((v) => (!color || v.color === color) && (!material || v.material === material))
					.map((v) => v.id)
			);
			const groupImgs = data.images.filter((img) => img.variantId && groupIds.has(img.variantId));
			if (groupImgs.length) return groupImgs;
		}
		const generalImgs = data.images.filter((img) => !img.variantId);
		return generalImgs.length ? generalImgs : data.images;
	});

	const currentImageIndex = $derived(displayImages.length ? Math.min(_imageIndex, displayImages.length - 1) : 0);

	function prevImage() {
		_imageIndex = (currentImageIndex - 1 + displayImages.length) % displayImages.length;
	}

	function nextImage() {
		_imageIndex = (currentImageIndex + 1) % displayImages.length;
	}

	function handleTouchStart(e: TouchEvent) {
		touchStartX = e.touches[0].clientX;
	}

	function handleTouchEnd(e: TouchEvent) {
		touchEndX = e.changedTouches[0].clientX;
		const diff = touchStartX - touchEndX;
		if (Math.abs(diff) > 50) {
			if (diff > 0) nextImage();
			else prevImage();
		}
	}

	async function openZoom() {
		if (!displayImages.length) return;
		const { default: PhotoSwipe } = await import('photoswipe');
		const dataSource = displayImages.map((img) => ({
			src: img.url + '-large.webp',
			width: 1600,
			height: 1600,
			alt: img.altText ?? data.product.name,
		}));
		const pswp = new PhotoSwipe({ dataSource, index: currentImageIndex });
		pswp.init();
	}

	const categoryLabel: Record<string, string> = {
		sunglasses: 'Gafas de sol',
		optical: 'Monturas ópticas',
	};
</script>

<svelte:head>
	<title>{data.product.name} — Visión Lego</title>
</svelte:head>

<div class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
	<nav class="mb-6 flex items-center gap-2 text-sm text-gray-500">
		<a href="/productos" class="hover:text-gray-900 dark:hover:text-white">Productos</a>
		<span>/</span>
		<span class="text-gray-700 dark:text-gray-300">{data.product.name}</span>
	</nav>

	<div class="grid gap-8 lg:grid-cols-2">
		<!-- Image gallery -->
		<div>
			{#if displayImages.length > 0}
				<div
					class="relative aspect-square overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-900"
					ontouchstart={handleTouchStart}
					ontouchend={handleTouchEnd}
					role="img"
					aria-label="Galería de imágenes del producto"
				>
					<button
						type="button"
						onclick={openZoom}
						class="absolute inset-0 cursor-zoom-in"
						tabindex="-1"
						aria-hidden="true"
					>
						<ProductImage
							basePath={displayImages[currentImageIndex].url}
							alt={displayImages[currentImageIndex].altText ?? data.product.name}
							size="large"
							loading="eager"
							class="h-full w-full object-cover"
						/>
					</button>
					<button
						type="button"
						onclick={openZoom}
						class="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-gray-900 shadow hover:bg-white dark:bg-gray-950/80 dark:text-white dark:hover:bg-gray-950"
						aria-label="Ampliar imagen"
					>
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
						</svg>
					</button>
					{#if displayImages.length > 1}
						<button
							onclick={prevImage}
							class="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-900 shadow hover:bg-white dark:bg-gray-950/80 dark:text-white dark:hover:bg-gray-950"
							aria-label="Imagen anterior"
						>
							<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
							</svg>
						</button>
						<button
							onclick={nextImage}
							class="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-900 shadow hover:bg-white dark:bg-gray-950/80 dark:text-white dark:hover:bg-gray-950"
							aria-label="Imagen siguiente"
						>
							<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
							</svg>
						</button>
					{/if}
				</div>
				{#if displayImages.length > 1}
					<div class="mt-3 flex gap-2 overflow-x-auto pb-1">
						{#each displayImages as img, i (img.id)}
							<button
								onclick={() => (_imageIndex = i)}
								class={[
									'h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors',
									i === currentImageIndex ? 'border-brand-orange' : 'border-gray-200 dark:border-gray-700',
								].join(' ')}
								aria-label="Ver imagen {i + 1}"
							>
								<ProductImage basePath={img.url} alt={img.altText ?? ''} size="thumb" class="h-full w-full object-cover" />
							</button>
						{/each}
					</div>
				{/if}
			{:else}
				<div class="flex aspect-square items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-900">
					<svg class="h-24 w-24 text-gray-400 dark:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
					</svg>
				</div>
			{/if}
		</div>

		<!-- Product info -->
		<div class="flex flex-col">
			<p class="text-sm font-medium uppercase tracking-wider text-gray-500">
				{categoryLabel[data.product.category] ?? data.product.category}
			</p>
			<h1 class="mt-1 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">{data.product.name}</h1>
			<p class="mt-3 text-2xl font-bold text-brand-orange dark:text-brand-orange">{formatCOP(displayPrice)}</p>

			{#if data.product.description}
				<p class="mt-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{data.product.description}</p>
			{/if}

			{#if data.variants.length > 0}
				<div class="mt-6 space-y-4">
					{#if colors.length > 0}
						<div>
							<p class="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
								Color{selectedColor ? `: ${selectedColor}` : ''}
							</p>
							<div class="flex flex-wrap gap-2">
								{#each colors as color (color)}
									<button
										onclick={() => (_selectedColor = selectedColor === color ? null : color)}
										class={[
											'cursor-pointer min-h-11 rounded-lg border px-3 py-2 text-sm transition-colors',
											selectedColor === color
												? 'border-brand-orange bg-brand-orange text-gray-950 font-semibold'
												: 'border-gray-300 text-gray-700 hover:border-gray-400 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-500',
										].join(' ')}
									>{color}</button>
								{/each}
							</div>
						</div>
					{/if}

					{#if sizes.length > 0}
						<div>
							<p class="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
								Talla{selectedSize ? `: ${selectedSize}` : ''}
							</p>
							<div class="flex flex-wrap gap-2">
								{#each sizes as size (size)}
									<button
										onclick={() => (_selectedSize = selectedSize === size ? null : size)}
										class={[
											'cursor-pointer min-h-11 rounded-lg border px-3 py-2 text-sm transition-colors',
											selectedSize === size
												? 'border-brand-orange bg-brand-orange text-gray-950 font-semibold'
												: 'border-gray-300 text-gray-700 hover:border-gray-400 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-500',
										].join(' ')}
									>{size}</button>
								{/each}
							</div>
						</div>
					{/if}

					{#if materials.length > 0}
						<div>
							<p class="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
								Material{selectedMaterial ? `: ${selectedMaterial}` : ''}
							</p>
							<div class="flex flex-wrap gap-2">
								{#each materials as material (material)}
									<button
										onclick={() => (_selectedMaterial = selectedMaterial === material ? null : material)}
										class={[
											'cursor-pointer min-h-11 rounded-lg border px-3 py-2 text-sm transition-colors',
											selectedMaterial === material
												? 'border-brand-orange bg-brand-orange text-gray-950 font-semibold'
												: 'border-gray-300 text-gray-700 hover:border-gray-400 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-500',
										].join(' ')}
									>{material}</button>
								{/each}
							</div>
						</div>
					{/if}
				</div>

				{#if selectedVariant}
					<div class="mt-4">
						{#if stockStatus === 'agotado'}
							<span class="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-700 ring-1 ring-red-200 dark:bg-red-900/40 dark:text-red-300 dark:ring-red-800">
								<span class="h-2 w-2 rounded-full bg-red-500"></span>
								Agotado
							</span>
						{:else if stockStatus === 'ultimas'}
							<span class="inline-flex items-center gap-1.5 rounded-full bg-brand-orange-light px-3 py-1 text-sm font-medium text-brand-orange-hover ring-1 ring-brand-orange-light dark:bg-brand-orange-hover/40 dark:text-brand-orange-light dark:ring-brand-orange-hover">
								<span class="h-2 w-2 rounded-full bg-brand-orange"></span>
								Últimas unidades
							</span>
						{:else}
							<span class="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700 ring-1 ring-green-200 dark:bg-green-900/40 dark:text-green-300 dark:ring-green-800">
								<span class="h-2 w-2 rounded-full bg-green-500"></span>
								Disponible
							</span>
						{/if}
					</div>
				{/if}
			{/if}

			{#if form?.error}
				<p class="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200 dark:bg-red-900/40 dark:text-red-300 dark:ring-red-800">{form.error}</p>
			{/if}

			<div class="mt-6 flex gap-3">
				<form
					method="post"
					action="?/addToCart"
					use:enhance={() => {
						submitting = true;
						return async ({ result }) => {
							submitting = false;
							if (result.type === 'success') {
								await invalidateAll();
								goto('/carrito');
							}
						};
					}}
					class="flex flex-1 gap-3"
				>
					<input type="hidden" name="variantId" value={selectedVariantId ?? ''} />
					<div class="flex items-center rounded-lg border border-gray-300 dark:border-gray-700">
						<button
							type="button"
							onclick={() => (quantity = Math.max(1, quantity - 1))}
							class="cursor-pointer flex h-11 w-11 items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white"
							aria-label="Reducir cantidad"
						>−</button>
						<span class="w-8 text-center text-sm font-medium text-gray-900 dark:text-white">{quantity}</span>
						<button
							type="button"
							onclick={() => (quantity = Math.min(selectedVariant?.stock ?? 1, quantity + 1))}
							class="cursor-pointer flex h-11 w-11 items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white"
							aria-label="Aumentar cantidad"
						>+</button>
						<input type="hidden" name="quantity" value={quantity} />
					</div>
					<button
						type="submit"
						disabled={!selectedVariantId || stockStatus === 'agotado' || submitting}
						class="h-11 flex-1 cursor-pointer rounded-lg bg-brand-orange text-sm font-semibold text-gray-950 transition hover:bg-brand-orange-light disabled:cursor-not-allowed disabled:opacity-50"
					>
						{submitting ? 'Agregando...' : 'Agregar al carrito'}
					</button>
				</form>

				<form
					method="post"
					action="?/toggleWishlist"
					use:enhance={() => {
						return async ({ result }) => {
							if (result.type === 'success') {
								wishlistOverride = !isWishlisted;
								await invalidateAll();
							}
						};
					}}
				>
					<input type="hidden" name="productId" value={data.product.id} />
					<button
						type="submit"
						class={[
							'flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border transition-colors',
							isWishlisted
								? 'border-red-300 bg-red-50 text-red-500 dark:border-red-800 dark:bg-red-900/40 dark:text-red-400'
								: 'border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-600 dark:border-gray-700 dark:text-gray-500 dark:hover:border-gray-500 dark:hover:text-white',
						].join(' ')}
						aria-label={isWishlisted ? 'Quitar de lista de deseos' : 'Agregar a lista de deseos'}
					>
						<svg class="h-5 w-5" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
						</svg>
					</button>
				</form>
			</div>

			<div class="mt-8 space-y-2 border-t border-gray-200 pt-6 dark:border-gray-800">
				<div class="flex items-center gap-3 text-sm text-gray-500">
					<svg class="h-5 w-5 shrink-0 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
					</svg>
					Pago 100% seguro
				</div>
				<div class="flex items-center gap-3 text-sm text-gray-500">
					<svg class="h-5 w-5 shrink-0 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
					</svg>
					Devoluciones fáciles
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	@import 'photoswipe/dist/photoswipe.css';
</style>
