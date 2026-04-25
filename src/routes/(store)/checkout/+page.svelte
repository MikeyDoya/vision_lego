<script lang="ts">
	import type { PageServerData, ActionData } from './$types';
	import { formatCOP } from '$lib/utils/currency';
	import { enhance } from '$app/forms';

	let { data, form }: { data: PageServerData; form: ActionData } = $props();

	let _selectedShippingId = $state<string | null>(null);
	const selectedShippingId = $derived(_selectedShippingId ?? data.shipping[0]?.id ?? '');
	let submitting = $state(false);

	const selectedShipping = $derived(data.shipping.find((s) => s.id === selectedShippingId) ?? null);
	const total = $derived(data.subtotal + (selectedShipping?.cost ?? 0));
</script>

<svelte:head>
	<title>Finalizar pedido — Vision Lego</title>
</svelte:head>

<div class="mx-auto max-w-5xl px-4 py-8 sm:px-6">
	<h1 class="mb-8 text-2xl font-bold text-gray-900 dark:text-white">Finalizar pedido</h1>

	{#if form?.error}
		<div class="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200 dark:bg-red-900/40 dark:text-red-300 dark:ring-red-800">{form.error}</div>
	{/if}

	<form
		method="post"
		action="?/placeOrder"
		use:enhance={() => {
			submitting = true;
			return ({ update }) => {
				submitting = false;
				update();
			};
		}}
	>
		<div class="grid gap-8 lg:grid-cols-5">
			<!-- Left: form fields -->
			<div class="space-y-6 lg:col-span-3">
				<!-- Contact info -->
				<fieldset>
					<legend class="mb-4 text-base font-semibold text-gray-900 dark:text-white">Datos de contacto</legend>
					<div class="grid gap-4 sm:grid-cols-2">
						<div>
							<label for="nombre" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre completo *</label>
							<input
								id="nombre"
								name="nombre"
								type="text"
								required
								value={data.user.name}
								class="mt-1 block w-full rounded-lg border-gray-300 bg-white text-sm text-gray-900 focus:border-amber-400 focus:ring-amber-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
							/>
						</div>
						<div>
							<label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Correo electrónico *</label>
							<input
								id="email"
								name="email"
								type="email"
								required
								value={data.user.email}
								class="mt-1 block w-full rounded-lg border-gray-300 bg-white text-sm text-gray-900 focus:border-amber-400 focus:ring-amber-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
							/>
						</div>
						<div class="sm:col-span-2">
							<label for="telefono" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono</label>
							<input
								id="telefono"
								name="telefono"
								type="tel"
								placeholder="3001234567"
								class="mt-1 block w-full rounded-lg border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-400 focus:border-amber-400 focus:ring-amber-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-600"
							/>
						</div>
					</div>
				</fieldset>

				<!-- Shipping address -->
				<fieldset>
					<legend class="mb-4 text-base font-semibold text-gray-900 dark:text-white">Dirección de envío</legend>
					<div class="grid gap-4 sm:grid-cols-2">
						<div class="sm:col-span-2">
							<label for="direccion" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Dirección *</label>
							<input
								id="direccion"
								name="direccion"
								type="text"
								required
								placeholder="Calle 123 #45-67, Apt 8"
								class="mt-1 block w-full rounded-lg border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-400 focus:border-amber-400 focus:ring-amber-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-600"
							/>
						</div>
						<div>
							<label for="ciudad" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Ciudad *</label>
							<input
								id="ciudad"
								name="ciudad"
								type="text"
								required
								placeholder="Medellín"
								class="mt-1 block w-full rounded-lg border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-400 focus:border-amber-400 focus:ring-amber-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-600"
							/>
						</div>
						<div>
							<label for="departamento" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Departamento *</label>
							<input
								id="departamento"
								name="departamento"
								type="text"
								required
								placeholder="Antioquia"
								class="mt-1 block w-full rounded-lg border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-400 focus:border-amber-400 focus:ring-amber-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-600"
							/>
						</div>
						<div>
							<label for="codigoPostal" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Código postal</label>
							<input
								id="codigoPostal"
								name="codigoPostal"
								type="text"
								class="mt-1 block w-full rounded-lg border-gray-300 bg-white text-sm text-gray-900 focus:border-amber-400 focus:ring-amber-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
							/>
						</div>
					</div>
				</fieldset>

				<!-- Shipping method -->
				{#if data.shipping.length > 0}
					<fieldset>
						<legend class="mb-4 text-base font-semibold text-gray-900 dark:text-white">Método de envío</legend>
						<div class="space-y-3">
							{#each data.shipping as method (method.id)}
								<label class={[
									'flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-colors',
									selectedShippingId === method.id
										? 'border-amber-400 bg-amber-50 dark:bg-amber-400/10'
										: 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600',
								].join(' ')}>
									<input
										type="radio"
										name="metodEnvio"
										value={method.id}
										checked={selectedShippingId === method.id}
										onchange={() => (_selectedShippingId = method.id)}
										class="sr-only"
									/>
									<span class={[
										'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
										selectedShippingId === method.id ? 'border-amber-400' : 'border-gray-300 dark:border-gray-600',
									].join(' ')}>
										{#if selectedShippingId === method.id}
											<span class="h-2.5 w-2.5 rounded-full bg-amber-400"></span>
										{/if}
									</span>
									<div class="flex-1">
										<p class="text-sm font-medium text-gray-900 dark:text-white">{method.name}</p>
										{#if method.description}
											<p class="text-xs text-gray-500">{method.description}</p>
										{/if}
									</div>
									<span class="text-sm font-semibold text-amber-500 dark:text-amber-400">
										{method.cost === 0 ? 'Gratis' : formatCOP(method.cost)}
									</span>
								</label>
							{/each}
						</div>
					</fieldset>
				{/if}

				<!-- Notes -->
				<div>
					<label for="notas" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Notas del pedido</label>
					<textarea
						id="notas"
						name="notas"
						rows="3"
						placeholder="Instrucciones especiales de entrega, indicaciones, etc."
						class="mt-1 block w-full rounded-lg border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-400 focus:border-amber-400 focus:ring-amber-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-600"
					></textarea>
				</div>
			</div>

			<!-- Right: order summary -->
			<div class="lg:col-span-2">
				<div class="sticky top-24 rounded-2xl bg-gray-50 p-6 ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
					<h2 class="text-base font-semibold text-gray-900 dark:text-white">Tu pedido</h2>
					<ul class="mt-4 divide-y divide-gray-200 dark:divide-gray-800">
						{#each data.cart as item (item.cartItemId)}
							<li class="flex justify-between gap-2 py-3 text-sm">
								<div class="flex-1">
									<p class="font-medium text-gray-900 dark:text-white">{item.productName}</p>
									{#if item.variantLabel}
										<p class="text-xs text-gray-500">{item.variantLabel}</p>
									{/if}
									<p class="text-xs text-gray-500">Cant. {item.quantity}</p>
								</div>
								<span class="shrink-0 font-medium text-gray-900 dark:text-white">{formatCOP(item.subtotal)}</span>
							</li>
						{/each}
					</ul>

					<div class="mt-4 space-y-2 border-t border-gray-200 pt-4 text-sm dark:border-gray-800">
						<div class="flex justify-between text-gray-600 dark:text-gray-400">
							<span>Subtotal</span>
							<span>{formatCOP(data.subtotal)}</span>
						</div>
						<div class="flex justify-between text-gray-600 dark:text-gray-400">
							<span>Envío</span>
							<span>
								{#if selectedShipping}
									{selectedShipping.cost === 0 ? 'Gratis' : formatCOP(selectedShipping.cost)}
								{:else}
									—
								{/if}
							</span>
						</div>
						<div class="flex justify-between border-t border-gray-200 pt-2 font-semibold text-gray-900 dark:border-gray-800 dark:text-white">
							<span>Total</span>
							<span>{formatCOP(total)}</span>
						</div>
					</div>

					<button
						type="submit"
						disabled={submitting}
						class="mt-6 h-12 w-full cursor-pointer rounded-xl bg-amber-400 text-sm font-semibold text-gray-950 transition hover:bg-amber-300 disabled:opacity-50"
					>
						{submitting ? 'Procesando...' : 'Confirmar pedido'}
					</button>
					<p class="mt-3 text-center text-xs text-gray-400 dark:text-gray-600">
						El pago se coordina directamente con el vendedor.
					</p>
				</div>
			</div>
		</div>
	</form>
</div>
