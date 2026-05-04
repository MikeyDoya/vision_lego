<script lang="ts">
	interface Props {
		basePath: string;
		alt: string;
		size?: 'thumb' | 'medium' | 'large';
		class?: string;
		loading?: 'lazy' | 'eager';
	}

	const sizesMap = {
		thumb: '(min-width: 1024px) 25vw, 50vw',
		medium: '(min-width: 1024px) 50vw, 100vw',
		large: '100vw',
	} as const;

	let {
		basePath,
		alt,
		size = 'medium',
		class: className = '',
		loading = 'lazy',
	}: Props = $props();
</script>

<picture class="contents">
	<source
		type="image/webp"
		srcset="{basePath}-thumb.webp 400w, {basePath}-medium.webp 800w, {basePath}-large.webp 1600w"
		sizes={sizesMap[size]}
	/>
	<img src="{basePath}-{size}.webp" {alt} {loading} class={className} />
</picture>
