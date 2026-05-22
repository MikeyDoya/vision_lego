<script lang="ts">
	import Logo from '$lib/components/ui/Logo.svelte';

	let { children } = $props();
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
	<div class="w-full max-w-md">
		<div class="mb-8 flex justify-center">
			<a href="/">
				<Logo width={160} />
			</a>
		</div>
		{@render children()}
	</div>
</div>
