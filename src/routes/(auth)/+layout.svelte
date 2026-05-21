<script lang="ts">
	let { children } = $props();
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
	<div class="w-full max-w-md">
		<div class="mb-8 text-center">
			<a href="/" class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Visión Lego</a>
		</div>
		{@render children()}
	</div>
</div>
