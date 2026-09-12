<script>
	import '../app.css';
	import { page } from '$app/state';

	let { data, form, children } = $props();

	const Toast = $derived(form?.success ? {
		type: 'success',
		message: form?.success
	} : form?.error ? {
		type: 'error',
		message: form?.error
	} : null);

	let toastTimer;
	if (Toast) {
		toastTimer = setTimeout(() => { form = { success: null, error: null }; }, 3000);
	}
</script>

<svelte:head>
	<title>Guest List Manager</title>
</svelte:head>

<div class="container">
	<header class="header">
		<h1>🎉 Guest List Manager</h1>
		<p class="subtitle">Manage friends, tag them for occasions, send invites</p>
	</header>

	<nav class="tabs">
		<a href="/" class="tab {page.url.pathname === '/' ? 'active' : ''}">Guests</a>
		<a href="/occasions" class="tab {page.url.pathname === '/occasions' ? 'active' : ''}">Occasions</a>
	</nav>

	{@render children()}
</div>

{#if Toast}
	<div class="toast toast-{Toast.type}" role="alert">
		{Toast.message}
	</div>
{/if}

<style>
	.container {
		max-width: 900px;
		margin: 0 auto;
		padding: 20px;
	}

	.header {
		text-align: center;
		margin-bottom: 24px;
	}

	.header h1 {
		font-size: 1.75rem;
		color: #1a1a2e;
		margin-bottom: 4px;
	}

	.subtitle {
		color: #666;
		font-size: 0.95rem;
	}

	.tabs {
		display: flex;
		gap: 8px;
		margin-bottom: 24px;
		border-bottom: 1px solid #e0e0e0;
		padding-bottom: 8px;
	}

	.tab {
		padding: 8px 16px;
		border-radius: 6px;
		text-decoration: none;
		color: #555;
		font-weight: 500;
		transition: all 0.2s;
	}

	.tab:hover {
		background: #f0f0f0;
	}

	.tab.active {
		background: #1a1a2e;
		color: white;
	}

	.toast {
		position: fixed;
		bottom: 20px;
		right: 20px;
		padding: 12px 20px;
		border-radius: 8px;
		color: white;
		font-weight: 500;
		box-shadow: 0 4px 12px rgba(0,0,0,0.15);
		z-index: 100;
		animation: slideIn 0.3s ease;
	}

	.toast-success {
		background: #2ecc71;
	}

	.toast-error {
		background: #e74c3c;
	}

	@keyframes slideIn {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}
</style>
