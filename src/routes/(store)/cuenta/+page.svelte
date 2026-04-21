<script lang="ts">
	import type { PageServerData, ActionData } from './$types';
	import { formatCOP } from '$lib/utils/currency';
	import { enhance } from '$app/forms';

	let { data, form }: { data: PageServerData; form: ActionData } = $props();

	let activeTab = $state<'pedidos' | 'perfil'>('pedidos');
	let editingProfile = $state(false);
	let expandedOrderId = $state<string | null>(null);

	// Show profile tab if coming back from order placement
	const statusLabels: Record<string, { label: string; color: string }> = {
		pending:    { label: 'Pendiente',      color: 'bg-yellow-100 text-yellow-800' },
		paid:       { label: 'Pagado',          color: 'bg-blue-100 text-blue-800' },
		processing: { label: 'En preparación', color: 'bg-indigo-100 text-indigo-800' },
		shipped:    { label: 'Enviado',         color: 'bg-purple-100 text-purple-800' },
		delivered:  { label: 'Entregado',       color: 'bg-green-100 text-green-800' },
		cancelled:  { label: 'Cancelado',       color: 'bg-red-100 text-red-800' },
		refunded:   { label: 'Reembolsado',     color: 'bg-gray-100 text-gray-800' },
	};

	function formatDate(date: Date | string) {
		return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(date));
	}
</script>

<svelte:head>
	<title>Mi cuenta — Vision Lego</title>
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-8 sm:px-6">
	<h1 class="mb-2 text-2xl font-bold text-gray-900">Mi cuenta</h1>
	<p class="mb-8 text-sm text-gray-500">{data.user.email}</p>

	{#if data.orderConfirmed}
		<div class="mb-6 rounded-xl bg-green-50 px-4 py-4 text-sm text-green-800">
			<p class="font-medium">¡Pedido confirmado!</p>
			<p class="mt-1">Tu pedido ha sido recibido. Te contactaremos pronto para coordinar el pago y envío.</p>
		</div>
	{/if}

	<!-- Tabs -->
	<div class="mb-6 flex gap-1 rounded-xl bg-gray-100 p-1">
		<button
			onclick={() => (activeTab = 'pedidos')}
			class={[
				'flex-1 rounded-lg py-2 text-sm font-medium transition-colors',
				activeTab === 'pedidos' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
			].join(' ')}
		>
			Mis pedidos
		</button>
		<button
			onclick={() => (activeTab = 'perfil')}
			class={[
				'flex-1 rounded-lg py-2 text-sm font-medium transition-colors',
				activeTab === 'perfil' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
			].join(' ')}
		>
			Perfil
		</button>
	</div>

	{#if activeTab === 'pedidos'}
		{#if data.orders.length === 0}
			<div class="flex flex-col items-center py-16 text-center">
				<svg class="h-14 w-14 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
				</svg>
				<p class="mt-4 font-medium text-gray-900">No tienes pedidos aún</p>
				<a href="/productos" class="mt-3 text-sm text-gray-500 underline hover:text-gray-900">
					Explorar productos
				</a>
			</div>
		{:else}
			<ul class="space-y-4">
				{#each data.orders as order (order.id)}
					<li class="rounded-xl border border-gray-200 overflow-hidden">
						<button
							onclick={() => (expandedOrderId = expandedOrderId === order.id ? null : order.id)}
							class="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-gray-50"
						>
							<div class="flex flex-col gap-1">
								<p class="text-sm font-medium text-gray-900">Pedido #{order.id.slice(0, 8).toUpperCase()}</p>
								<p class="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
							</div>
							<div class="flex items-center gap-3">
								<span class={['rounded-full px-2.5 py-0.5 text-xs font-medium', statusLabels[order.status]?.color ?? 'bg-gray-100 text-gray-800'].join(' ')}>
									{statusLabels[order.status]?.label ?? order.status}
								</span>
								<span class="text-sm font-semibold text-gray-900">{formatCOP(order.total)}</span>
								<svg class={['h-4 w-4 text-gray-400 transition-transform', expandedOrderId === order.id ? 'rotate-180' : ''].join(' ')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
								</svg>
							</div>
						</button>
						{#if expandedOrderId === order.id}
							<div class="border-t border-gray-100 px-5 py-4">
								<ul class="divide-y divide-gray-100">
									{#each order.items as item (item.id)}
										<li class="flex justify-between gap-2 py-3 text-sm">
											<div>
												<p class="font-medium text-gray-900">{item.productName}</p>
												{#if item.variantLabel}
													<p class="text-xs text-gray-500">{item.variantLabel}</p>
												{/if}
												<p class="text-xs text-gray-500">Cant. {item.quantity} × {formatCOP(item.unitPrice)}</p>
											</div>
											<span class="shrink-0 font-medium text-gray-900">{formatCOP(item.subtotal)}</span>
										</li>
									{/each}
								</ul>
							</div>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}

		<div class="mt-6 flex justify-center">
			<a href="/cuenta/lista-de-deseos" class="text-sm text-gray-500 underline hover:text-gray-900">
				Ver lista de deseos
			</a>
		</div>
	{/if}

	{#if activeTab === 'perfil'}
		<div class="space-y-6">
			{#if form?.error}
				<p class="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{form.error}</p>
			{/if}
			{#if form?.success}
				<p class="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">Perfil actualizado.</p>
			{/if}

			{#if editingProfile}
				<form method="post" action="?/updateProfile" use:enhance={() => ({ update }) => { editingProfile = false; update(); }}>
					<div class="space-y-4">
						<div>
							<label for="name" class="block text-sm font-medium text-gray-700">Nombre</label>
							<input
								id="name"
								name="name"
								type="text"
								value={data.user.name}
								required
								class="mt-1 block w-full rounded-lg border-gray-300 text-sm"
							/>
						</div>
						<div class="flex gap-3">
							<button type="submit" class="h-10 rounded-lg bg-gray-900 px-5 text-sm font-medium text-white hover:bg-gray-700">
								Guardar
							</button>
							<button type="button" onclick={() => (editingProfile = false)} class="h-10 rounded-lg border border-gray-300 px-5 text-sm font-medium text-gray-700 hover:bg-gray-50">
								Cancelar
							</button>
						</div>
					</div>
				</form>
			{:else}
				<div class="rounded-xl border border-gray-200 p-5">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm font-medium text-gray-500">Nombre</p>
							<p class="mt-1 font-medium text-gray-900">{data.user.name}</p>
						</div>
						<button onclick={() => (editingProfile = true)} class="text-sm text-gray-500 underline hover:text-gray-900">
							Editar
						</button>
					</div>
					<div class="mt-4 border-t border-gray-100 pt-4">
						<p class="text-sm font-medium text-gray-500">Correo electrónico</p>
						<p class="mt-1 font-medium text-gray-900">{data.user.email}</p>
					</div>
				</div>
			{/if}

			<!-- Sign out -->
			<form method="post" action="?/salir" use:enhance>
				<button type="submit" class="text-sm text-gray-400 hover:text-red-600">
					Cerrar sesión
				</button>
			</form>
		</div>
	{/if}
</div>
