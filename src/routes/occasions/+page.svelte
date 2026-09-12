<script>
	import { getGuests, createOccasion } from '$lib/db.js';
	import { DEFAULT_OCCASIONS } from '$lib/defaults.js';

	let occasions = $state([]);
	let loading = $state(true);
	let showForm = $state(false);

	let newName = $state('');
	let newColor = $state('#1a1a2e');

	$effect(() => {
		getGuests().then(guests => {
			// Load occasions from existing tags
			const occMap = new Map();
			guests?.forEach(g => {
				g.tags?.forEach(t => {
					if (t.occasions?.name && !occMap.has(t.occasions.name)) {
						occMap.set(t.occasions.name, {
							name: t.occasions.name,
							color: t.occasions.color || '#999'
						});
					}
				});
			});

			// Merge with defaults
			DEFAULT_OCCASIONS.forEach(def => {
				if (!occMap.has(def.name)) {
					occMap.set(def.name, def);
				}
			});

			occasions = [...occMap.values()].sort((a, b) => a.name.localeCompare(b.name));
			loading = false;
		});
	});

	async function addOccasion() {
		if (!newName.trim()) return;
		try {
			const result = await createOccasion({ name: newName.trim(), color: newColor });
			if (result.error) throw new Error(result.error.message);
			occasions = [...occasions, { name: result.data.name, color: result.data.color }];
			newName = '';
			newColor = '#1a1a2e';
		} catch (err) {
			alert('Error: ' + err.message);
		}
	}
</script>

<svelte:head>
	<title>Occasions</title>
</svelte:head>

<div class="page">
	<header class="page-header">
		<h2>Occasions</h2>
		<button class="btn btn-primary" onclick={() => showForm = !showForm}>
			{showForm ? 'Cancel' : '+ Add Occasion'}
		</button>
	</header>

	{#if showForm}
		<form class="add-form" onsubmit={(e) => { e.preventDefault(); addOccasion(); }}>
			<div class="field">
				<label for="occ-name">Occasion Name</label>
				<input type="text" id="occ-name" bind:value={newName} placeholder="e.g. Anniversary Party" required />
			</div>
			<div class="field">
				<label for="occ-color">Color</label>
				<div class="color-picker">
					<input type="color" id="occ-color" bind:value={newColor} />
					<span class="color-value">{newColor}</span>
				</div>
			</div>
			<button type="submit" class="btn btn-primary">Add</button>
		</form>
	{/if}

	{#if loading}
		<div class="loading">Loading...</div>
	{:else}
		<div class="occasion-grid">
			{#each occasions as occ}
				<div class="occasion-card" style="--color: {occ.color}">
					<div class="occasion-color"></div>
					<div class="occasion-info">
						<h3>{occ.name}</h3>
						<p class="occasion-count">
							{occasions.indexOf(occ) + 1}
						</p>
					</div>
				</div>
			{/each}
		</div>

		{#if occasions.length === 0}
			<div class="empty">No occasions yet. Add your first one above.</div>
		{/if}
	{/if}
</div>

<style>
	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 24px;
	}

	.page-header h2 {
		margin: 0;
		color: #1a1a2e;
	}

	.add-form {
		background: white;
		padding: 20px;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.08);
		margin-bottom: 24px;
		display: flex;
		gap: 16px;
		align-items: flex-end;
	}

	@media (max-width: 600px) {
		.add-form {
			flex-direction: column;
			align-items: stretch;
		}
	}

	.field {
		display: flex;
		flex-direction: column;
	}

	.field label {
		font-weight: 500;
		margin-bottom: 6px;
		color: #1a1a2e;
		font-size: 0.9rem;
	}

	.field input {
		padding: 10px 12px;
		border: 1px solid #ddd;
		border-radius: 8px;
		font-size: 1rem;
	}

	.color-picker {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.color-picker input[type="color"] {
		width: 48px;
		height: 40px;
		padding: 2px;
		border: 1px solid #ddd;
		border-radius: 8px;
		cursor: pointer;
	}

	.color-value {
		font-size: 0.9rem;
		color: #666;
		font-family: monospace;
	}

	.occasion-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 16px;
	}

	.occasion-card {
		background: white;
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0,0,0,0.08);
		display: flex;
	}

	.occasion-color {
		width: 8px;
		flex-shrink: 0;
		background: var(--color);
	}

	.occasion-info {
		padding: 16px;
		flex: 1;
	}

	.occasion-info h3 {
		margin: 0 0 4px;
		color: #1a1a2e;
		font-size: 1.05rem;
	}

	.occasion-count {
		margin: 0;
		font-size: 0.8rem;
		color: #888;
	}

	.loading, .empty {
		text-align: center;
		padding: 40px;
		color: #888;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 10px 20px;
		border-radius: 8px;
		font-weight: 500;
		cursor: pointer;
		border: none;
		font-size: 0.95rem;
		transition: all 0.2s;
	}

	.btn-primary {
		background: #1a1a2e;
		color: white;
	}

	.btn-primary:hover {
		background: #2d2d4e;
	}
</style>
