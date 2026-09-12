<script>
	import { createGuest, createTag, supabase, getOccasions } from '$lib/db.js';
	import { goto } from '$app/navigation';
	import { DEFAULT_OCCASIONS } from '$lib/defaults.js';

	let form = $state({
		name: '',
		family_name: '',
		email: '',
		phone: ''
	});

	let submitting = $state(false);
	let error = $state(null);

	let selectedTags = $state([]);
	let occasionList = $state([]);

	$effect(() => {
		getOccasions()
			.then(occs => {
				occasionList = occs.length ? occs : DEFAULT_OCCASIONS;
			})
			.catch(() => {
				occasionList = DEFAULT_OCCASIONS;
			});
	});

	function toggleOccasion(occasionName) {
		if (selectedTags.includes(occasionName)) {
			selectedTags = selectedTags.filter(n => n !== occasionName);
		} else {
			selectedTags = [...selectedTags, occasionName];
		}
	}

	async function handleSubmit(e) {
		e.preventDefault();
		submitting = true;
		error = null;

		const guestData = {
			name: form.name.trim(),
			family_name: form.family_name.trim() || null,
			email: form.email.trim() || null,
			phone: form.phone.trim() || null
		};

		try {
			if (!supabase) throw new Error('Supabase not connected. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY env vars.');

			const guestResult = await createGuest(guestData);
			if (guestResult.error) throw new Error(guestResult.error.message);

			const newGuest = guestResult.data;

			for (const tagName of selectedTags) {
				const tagResult = await createTag({
					guest_id: newGuest.id,
					name: tagName,
					occasion_name: tagName
				});
				if (tagResult.error) console.warn('Tag failed:', tagResult.error);
			}

			goto('/');
		} catch (err) {
			error = err.message;
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>Add Guest</title>
</svelte:head>

<div class="page">
	<header class="page-header">
		<h2>Add a New Guest</h2>
		<a href="/" class="btn btn-secondary">← Back to Guests</a>
	</header>

	{#if !supabase}
		<div class="supabase-warning">
			<strong>⚠️ Supabase not connected.</strong> Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> env vars to add guests.
		</div>
	{/if}

	<form class="form" onsubmit={handleSubmit}>
		<div class="form-grid">
			<div class="field">
				<label for="name">Full Name *</label>
				<input type="text" id="name" bind:value={form.name} required placeholder="e.g. Priya Sharma" />
			</div>
			<div class="field">
				<label for="family">Family Name (optional)</label>
				<input type="text" id="family" bind:value={form.family_name} placeholder="e.g. Sharma (to group spouse/kids)" />
				<span class="hint">Used to link family members together</span>
			</div>
			<div class="field">
				<label for="email">Email</label>
				<input type="email" id="email" bind:value={form.email} placeholder="priya@example.com" />
			</div>
			<div class="field">
				<label for="phone">Phone</label>
				<input type="tel" id="phone" bind:value={form.phone} placeholder="+91 98765 43210" />
			</div>
		</div>

		<div class="section">
			<h3>Tags / Occasions</h3>
			<p class="hint">Click occasions to tag this guest</p>

			<div class="occasion-chips">
				{#each occasionList as occ}
					<button
						type="button"
						class="occasion-chip"
						class:selected={selectedTags.includes(occ.name)}
						style="--chip-color: {occ.color || '#1a1a2e'}"
						onclick={() => toggleOccasion(occ.name)}
					>
						{occ.name}
					</button>
				{/each}
			</div>

			{#if selectedTags.length > 0}
				<div class="selected-tags">
					{#each selectedTags as tagName}
						<span class="selected-tag">
							{tagName}
							<button type="button" class="tag-remove" onclick={() => toggleOccasion(tagName)}>×</button>
						</span>
					{/each}
				</div>
			{/if}
		</div>

		{#if error}
			<div class="form-error">{error}</div>
		{/if}

		<div class="form-actions">
			<button type="submit" class="btn btn-primary" disabled={submitting}>
				{submitting ? 'Adding...' : 'Add Guest'}
			</button>
		</div>
	</form>
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

	.form {
		background: white;
		padding: 24px;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.08);
	}

	.form-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 16px;
		margin-bottom: 24px;
	}

	@media (max-width: 600px) {
		.form-grid {
			grid-template-columns: 1fr;
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
		font-size: 0.95rem;
	}

	.field input {
		padding: 10px 12px;
		border: 1px solid #ddd;
		border-radius: 8px;
		font-size: 1rem;
		transition: border-color 0.2s;
	}

	.field input:focus {
		outline: none;
		border-color: #1a1a2e;
	}

	.hint {
		font-size: 0.85rem;
		color: #888;
		margin-top: 4px;
	}

	.section {
		margin-bottom: 24px;
		padding-top: 20px;
		border-top: 1px solid #eee;
	}

	.section h3 {
		margin: 0 0 4px;
		color: #1a1a2e;
		font-size: 1.1rem;
	}

	.occasion-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-bottom: 12px;
	}

	.occasion-chip {
		padding: 8px 16px;
		border-radius: 20px;
		border: 2px solid var(--chip-color);
		background: white;
		color: var(--chip-color);
		font-weight: 500;
		cursor: pointer;
		font-size: 0.9rem;
		transition: all 0.2s;
	}

	.occasion-chip:hover {
		background: var(--chip-color);
		color: white;
	}

	.occasion-chip.selected {
		background: var(--chip-color);
		color: white;
	}

	.selected-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-top: 12px;
	}

	.selected-tag {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 6px 12px;
		background: #1a1a2e;
		color: white;
		border-radius: 20px;
		font-size: 0.9rem;
	}

	.tag-remove {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 1.1rem;
		color: rgba(255,255,255,0.7);
		padding: 0;
		line-height: 1;
	}

	.tag-remove:hover {
		color: white;
	}

	.form-error {
		background: #fdf2f2;
		color: #e74c3c;
		padding: 12px 16px;
		border-radius: 8px;
		margin-bottom: 16px;
		font-size: 0.95rem;
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
	}

	.supabase-warning {
		background: #fff3cd;
		border: 1px solid #ffc107;
		color: #856404;
		padding: 12px 16px;
		border-radius: 8px;
		margin-bottom: 16px;
		font-size: 0.95rem;
	}

	.supabase-warning code {
		background: #f0f0f0;
		padding: 2px 6px;
		border-radius: 4px;
		font-family: monospace;
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
		text-decoration: none;
		transition: all 0.2s;
	}

	.btn-sm {
		padding: 6px 12px;
		font-size: 0.85rem;
	}

	.btn-primary {
		background: #1a1a2e;
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		background: #2d2d4e;
	}

	.btn-primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-secondary {
		background: #e0e0e0;
		color: #555;
	}

	.btn-secondary:hover {
		background: #d0d0d0;
	}
</style>
