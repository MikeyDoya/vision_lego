<script lang="ts">
	import type { PageServerData, ActionData } from './$types';
	import { formatCOP } from '$lib/utils/currency';
	import { enhance } from '$app/forms';

	let { data, form }: { data: PageServerData; form: ActionData } = $props();

	let quantity = $state(1);
	// _imageIndex is the user's requested index; currentImageIndex clamps it to valid range
	let _imageIndex = $state(0);
	let addedToCart = $state(false);
	// Track wishlist toggle optimistically without capturing stale prop reference
	let wishlistOverride = $state<boolean | null>(null);
	const isWishlisted = $derived(wishlistOverride !== null ? wishlistOverride : data.isWishlisted);

	// Touch tracking for mobile swipe
	let touchStartX = $state(0);
	let touchEndX = $state(0);

	// Unique option values for selectors
	const colors = $derived([...new Set(data.variants.filter((v) => v.color).map((v) => v.color!))]);
	const sizes = $derived([...new Set(data.variants.filter((v) => v.size).map((v) => v.size!))]);
	const materials = $derived([...new Set(data.variants.filter((v) => v.material).map((v) => v.material!))]);

	// User-explicit selection; null means "follow first available"
	let _selectedColor = $state<string | null>(null);
	let _selectedSize = $state<string | null>(null);
	let _selectedMaterial = $state<string | null>(null);

	const selectedColor = $derived(_selectedColor ?? colors[0] ?? null);
	const selectedSize = $derived(_selectedSize ?? sizes[0] ?? null);
	const selectedMaterial = $derived(_selectedMaterial ?? materials[0] ?? null);

	// Derive selected variant from chosen dimensions
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

	// When variant selected, show matching images if available
	const displayImages = $derived.by(() => {
		if (!data.images.length) return [];
		if (selectedVariantId) {
			const variantImgs = data.images.filter((img) => img.variantId === selectedVariantId);
			if (variantImgs.length) return variantImgs;
		}
		return data.images;
	});

	// Clamp to valid range; naturally resets toward 0 when displayImages shrinks
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

	const categoryLabel: Record<string, string> = {
		sunglasses: 'Gafas de sol',
		optical: 'Monturas ópticas',
	};
</script>

<svelte:head>
	<title>{data.product.name} — Vision Lego</title>
</svelte:head>

<div class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
	<!-- Breadcrumb -->
	<nav class="mb-6 flex items-center gap-2 text-sm text-gray-500">
		<a href="/productos" class="hover:text-gray-900">Productos</a>
		<span>/</span>
		<span class="text-gray-900">{data.product.name}</span>
	</nav>

	<div class="grid gap-8 lg:grid-cols-2">
		<!-- Image gallery -->
		<div>
			{#if displayImages.length > 0}
				<div
					class="relative aspect-square overflow-hidden rounded-2xl bg-gray-100"
					ontouchstart={handleTouchStart}
					ontouchend={handleTouchEnd}
					role="img"
					aria-label="Galería de imágenes del producto"
				>
					<img
						src={displayImages[currentImageIndex].url}
						alt={displayImages[currentImageIndex].altText ?? data.product.name}
						class="h-full w-full object-cover"
					/>
					{#if displayImages.length > 1}
						<button
							onclick={prevImage}
							class="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow hover:bg-white"
							aria-label="Imagen anterior"
						>
							<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
							</svg>
						</button>
						<button
							onclick={nextImage}
							class="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow hover:bg-white"
							aria-label="Imagen siguiente"
						>
							<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
							</svg>
						</button>
					{/if}
				</div>
				<!-- Thumbnails -->
				{#if displayImages.length > 1}
					<div class="mt-3 flex gap-2 overflow-x-auto pb-1">
						{#each displayImages as img, i (img.id)}
							<button
								onclick={() => (_imageIndex = i)}
								class={[
									'h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors',
									i === currentImageIndex ? 'border-gray-900' : 'border-transparent',
								].join(' ')}
								aria-label="Ver imagen {i + 1}"
							>
								<img src={img.url} alt={img.altText ?? ''} class="h-full w-full object-cover" />
							</button>
						{/each}
					</div>
				{/if}
			{:else}
				<div class="flex aspect-square items-center justify-center rounded-2xl bg-gray-100">
					<svg class="h-24 w-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
					</svg>
				</div>
			{/if}
		</div>

		<!-- Product info -->
		<div class="flex flex-col">
			<p class="text-sm font-medium uppercase tracking-wider text-gray-400">
				{categoryLabel[data.product.category] ?? data.product.category}
			</p>
			<h1 class="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">{data.product.name}</h1>
			<p class="mt-3 text-2xl font-bold text-gray-900">{formatCOP(displayPrice)}</p>

			{#if data.product.description}
				<p class="mt-4 text-sm leading-relaxed text-gray-600">{data.product.description}</p>
			{/if}

			{#if data.variants.length > 0}
				<div class="mt-6 space-y-4">
					<!-- Color selector -->
					{#if colors.length > 0}
						<div>
							<p class="mb-2 text-sm font-medium text-gray-900">
								Color{selectedColor ? `: ${selectedColor}` : ''}
							</p>
							<div class="flex flex-wrap gap-2">
								{#each colors as color (color)}
									<button
										onclick={() => (_selectedColor = selectedColor === color ? null : color)}
										class={[
											'min-h-11 rounded-lg border px-3 py-2 text-sm transition-colors',
											selectedColor === color
												? 'border-gray-900 bg-gray-900 text-white'
												: 'border-gray-300 text-gray-700 hover:border-gray-900',
										].join(' ')}
									>{color}</button>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Size selector -->
					{#if sizes.length > 0}
						<div>
							<p class="mb-2 text-sm font-medium text-gray-900">
								Talla{selectedSize ? `: ${selectedSize}` : ''}
							</p>
							<div class="flex flex-wrap gap-2">
								{#each sizes as size (size)}
									<button
										onclick={() => (_selectedSize = selectedSize === size ? null : size)}
										class={[
											'min-h-11 rounded-lg border px-3 py-2 text-sm transition-colors',
											selectedSize === size
												? 'border-gray-900 bg-gray-900 text-white'
												: 'border-gray-300 text-gray-700 hover:border-gray-900',
										].join(' ')}
									>{size}</button>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Material selector -->
					{#if materials.length > 0}
						<div>
							<p class="mb-2 text-sm font-medium text-gray-900">
								Material{selectedMaterial ? `: ${selectedMaterial}` : ''}
							</p>
							<div class="flex flex-wrap gap-2">
								{#each materials as material (material)}
									<button
										onclick={() => (_selectedMaterial = selectedMaterial === material ? null : material)}
										class={[
											'min-h-11 rounded-lg border px-3 py-2 text-sm transition-colors',
											selectedMaterial === material
												? 'border-gray-900 bg-gray-900 text-white'
												: 'border-gray-300 text-gray-700 hover:border-gray-900',
										].join(' ')}
									>{material}</button>
								{/each}
							</div>
						</div>
					{/if}
				</div>

				<!-- Stock status -->
				{#if selectedVariant}
					<div class="mt-4">
						{#if stockStatus === 'agotado'}
							<span class="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-700">
								<span class="h-2 w-2 rounded-full bg-red-500"></span>
								Agotado
							</span>
						{:else if stockStatus === 'ultimas'}
							<span class="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
								<span class="h-2 w-2 rounded-full bg-amber-500"></span>
								Últimas unidades
							</span>
						{:else}
							<span class="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
								<span class="h-2 w-2 rounded-full bg-green-500"></span>
								Disponible
							</span>
						{/if}
					</div>
				{/if}
			{/if}

			<!-- Add to cart -->
			{#if form?.error}
				<p class="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{form.error}</p>
			{/if}
			{#if addedToCart}
				<p class="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">¡Agregado al carrito!</p>
			{/if}

			<div class="mt-6 flex gap-3">
				<form
					method="post"
					action="?/addToCart"
					use:enhance={() => {
						return ({ result }) => {
							if (result.type === 'success') {
								addedToCart = true;
								setTimeout(() => (addedToCart = false), 3000);
							}
						};
					}}
					class="flex flex-1 gap-3"
				>
					<input type="hidden" name="variantId" value={selectedVariantId ?? ''} />
					<div class="flex items-center rounded-lg border border-gray-300">
						<button
							type="button"
							onclick={() => (quantity = Math.max(1, quantity - 1))}
							class="flex h-11 w-11 items-center justify-center text-gray-500 hover:text-gray-900"
							aria-label="Reducir cantidad"
						>−</button>
						<span class="w-8 text-center text-sm font-medium">{quantity}</span>
						<button
							type="button"
							onclick={() => (quantity = Math.min(selectedVariant?.stock ?? 1, quantity + 1))}
							class="flex h-11 w-11 items-center justify-center text-gray-500 hover:text-gray-900"
							aria-label="Aumentar cantidad"
						>+</button>
						<input type="hidden" name="quantity" value={quantity} />
					</div>
					<button
						type="submit"
						disabled={!selectedVariantId || stockStatus === 'agotado'}
						class="h-11 flex-1 rounded-lg bg-gray-900 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{data.user ? 'Agregar al carrito' : 'Iniciar sesión para comprar'}
					</button>
				</form>

				<!-- Wishlist button -->
				<form
					method="post"
					action="?/toggleWishlist"
					use:enhance={() => {
						return ({ result }) => {
							if (result.type === 'success') {
								wishlistOverride = !isWishlisted;
							}
						};
					}}
				>
					<input type="hidden" name="productId" value={data.product.id} />
					<button
						type="submit"
						class={[
							'flex h-11 w-11 items-center justify-center rounded-lg border transition-colors',
							isWishlisted
								? 'border-red-200 bg-red-50 text-red-500'
								: 'border-gray-300 text-gray-500 hover:border-gray-900 hover:text-gray-900',
						].join(' ')}
						aria-label={isWishlisted ? 'Quitar de lista de deseos' : 'Agregar a lista de deseos'}
					>
						<svg class="h-5 w-5" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
						</svg>
					</button>
				</form>
			</div>

			<!-- Trust signals -->
			<div class="mt-8 space-y-2 border-t border-gray-100 pt-6">
				<div class="flex items-center gap-3 text-sm text-gray-600">
					<svg class="h-5 w-5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
					</svg>
					Pago 100% seguro
				</div>
				<div class="flex items-center gap-3 text-sm text-gray-600">
					<svg class="h-5 w-5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
					</svg>
					Devoluciones fáciles
				</div>
			</div>
		</div>
	</div>
</div>
