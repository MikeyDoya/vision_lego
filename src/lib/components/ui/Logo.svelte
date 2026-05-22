<script lang="ts">
	let {
		class: className = '',
		width = 150,
	}: { class?: string; width?: number } = $props();

	const imgHeight = $derived(Math.round(width / 1.776));
</script>

<img
	src="/brand/logo-light-240.webp"
	srcset="/brand/logo-light-240.webp 240w, /brand/logo-light-480.webp 480w, /brand/logo-light-720.webp 720w"
	sizes={`${width}px`}
	{width}
	height={imgHeight}
	alt="Visión Lego"
	loading="eager"
	fetchpriority="high"
	class="block dark:hidden {className}"
/>
<img
	src="/brand/logo-dark-240.webp"
	srcset="/brand/logo-dark-240.webp 240w, /brand/logo-dark-480.webp 480w, /brand/logo-dark-720.webp 720w"
	sizes={`${width}px`}
	{width}
	height={imgHeight}
	alt="Visión Lego"
	loading="eager"
	fetchpriority="high"
	class="hidden dark:block {className}"
/>
