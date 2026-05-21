<script lang="ts">
	import Cropper from 'cropperjs';

	interface Props {
		file: File;
		onConfirm: (blob: Blob) => void;
		onCancel: () => void;
		currentIndex: number;
		totalCount: number;
	}

	let { file, onConfirm, onCancel, currentIndex, totalCount }: Props = $props();

	let confirming = $state(false);
	let cropper: Cropper | null = null;

	function initCropper(el: HTMLImageElement) {
		const url = URL.createObjectURL(file);
		el.src = url;

		const instance = new Cropper(el, {
			aspectRatio: 1,
			viewMode: 1,
			dragMode: 'move',
			autoCropArea: 1,
			minCropBoxWidth: 200,
			minCropBoxHeight: 200,
			background: false,
			responsive: true,
			restore: false,
		});
		cropper = instance;

		function onZoom(e: Event) {
			const detail = (e as CustomEvent<{ ratio: number }>).detail;
			if (detail.ratio > 1) e.preventDefault();
		}
		el.addEventListener('zoom', onZoom);

		return () => {
			el.removeEventListener('zoom', onZoom);
			instance.destroy();
			cropper = null;
			URL.revokeObjectURL(url);
		};
	}

	function confirm() {
		if (!cropper || confirming) return;
		confirming = true;
		const canvas = cropper.getCroppedCanvas({
			width: 1600,
			height: 1600,
			imageSmoothingEnabled: true,
			imageSmoothingQuality: 'high',
		});
		canvas.toBlob(
			(blob) => {
				confirming = false;
				if (blob) onConfirm(blob);
			},
			'image/webp',
			0.92,
		);
	}
</script>

<div class="fixed inset-0 z-50 flex items-end justify-center bg-black/80 sm:items-center sm:p-4">
	<div
		class="flex w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl dark:bg-gray-900 sm:rounded-xl"
	>
		<!-- Title bar -->
		<div
			class="flex shrink-0 items-center border-b border-gray-200 px-5 py-4 dark:border-gray-800"
		>
			<h2 class="text-base font-semibold text-gray-900 dark:text-white">
				Recortar imagen {currentIndex} de {totalCount}
			</h2>
		</div>

		<!-- Cropper canvas -->
		<div class="h-[55vh] shrink-0 overflow-hidden bg-gray-950">
			<img {@attach initCropper} alt="Imagen a recortar" class="block max-h-full w-full" />
		</div>

		<!-- Controls -->
		<div
			class="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-5 py-4 dark:border-gray-800"
		>
			<div class="flex gap-2">
				<button
					type="button"
					onclick={() => cropper?.zoom(0.1)}
					aria-label="Acercar"
					class="flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-lg bg-gray-100 text-xl font-bold text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
				>+</button>
				<button
					type="button"
					onclick={() => cropper?.zoom(-0.1)}
					aria-label="Alejar"
					class="flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-lg bg-gray-100 text-xl font-bold text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
				>−</button>
				<button
					type="button"
					onclick={() => cropper?.reset()}
					class="flex min-h-[44px] cursor-pointer items-center justify-center rounded-lg bg-gray-100 px-3 text-sm text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
				>Restablecer</button>
			</div>

			<div class="flex gap-3">
				<button
					type="button"
					onclick={onCancel}
					class="flex min-h-[44px] cursor-pointer items-center justify-center rounded-lg border border-gray-300 px-5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
				>Cancelar</button>
				<button
					type="button"
					disabled={confirming}
					onclick={confirm}
					class="flex min-h-[44px] cursor-pointer items-center justify-center rounded-lg bg-brand-orange px-5 text-sm font-semibold text-gray-950 hover:bg-brand-orange-light disabled:opacity-60"
				>{confirming ? 'Procesando…' : 'Continuar'}</button>
			</div>
		</div>
	</div>
</div>

<style>
	@import 'cropperjs/dist/cropper.css';
</style>
