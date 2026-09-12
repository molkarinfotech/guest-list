<script>
	import { getGuest, updateGuest, getTagsForGuest, createTag, deleteTag } from '$lib/db.js';

	let id = $params.id;

	let guest = $state(null);
	let loading = $state(true);
	let saving = $state(false);
	let error = $state(null);
	let success = $state(null);

	let tagNames = $state('');
	let tagOccasions = $state({});

	const occasionOptions = [
		{ name: "Son's Birthday", value: "son-birthday" },
		{ name: 'Diwali', value: 'diwali' },
		{ name: 'Christmas', value: 'christmas' },
		{ name: 'Summer BBQ', value: 'summer-bbq' },
		{ name: "Daughter's Birthday", value: "daughter-birthday" }
	];

	$effect(() => {
		loading = true;
		Promise.all([getGuest(id), getTagsForGuest(id)]).then(([g, tags]) => {
			guest = g;
			if (tags.length) {
				tagNames = tags.map(t => t.name).join(',');
				tagOccasions = tags.reduce((acc, t) => {
					if (t.occasions?.name) acc[t.name] = t.occasions.name;
					return acc;
				}, {});
			}
			loading = false;
		});
	});

	function addTagRow() {
		const name = prompt('Tag name:');
		if (!name) return;
		const occasion = prompt(`Occasion for "${name}" (or leave blank):`);
		if (occasion) {
			tagOccasions = { ...tagOccasions, [name]: occasion };
		}
		tagNames = tagNames ? `${tagNames},${name}` : name;
	}

	async function handleSave(e) {
		e.preventDefault();
		saving = true;
		error = null;
		success = null;

		const updated = {
			name: guest.name,
			family_name: guest.family_name,
			email: guest.email,
			phone: guest.phone
		};

		try {
			const result = await updateGuest(id, updated);
			if (result.error) throw new Error(result.error.message);

			const names = tagNames ? tagNames.split(',').map(s => s.trim()).filter(Boolean) : [];
			const existing = new Set((guest.tags || []).map(t => t.name));

			for (const name of names) {
				if (!existing.has(name)) {
					await createTag({
						guest_id: id,
						name,
						occasion_name: tagOccasions[name] || null
					});
				} else if (tagOccasions[name]) {
					const existingTag = (guest.tags || []).find(t => t.name === name);
					if (existingTag && existingTag.occasion_id !== undefined) {
						// update existing tag's occasion
						// For simplicity, delete and recreate
						await deleteTag(existingTag.id);
						await createTag({
							guest_id: id,
							name,
							occasion_name: tagOccasions[name]
						});
					}
				}
			}

			for (const existingTag of (guest.tags || [])) {
				if (!names.includes(existingTag.name)) {
					await deleteTag(existingTag.id);
				}
			}

			success = 'Guest updated!';
		} catch (err) {
			error = err.message;
		} finally {
			saving = false;
		}
	}
</script>

<svelte:head>
	<title>Edit Guest</title>
</svelte:head>

{#if loading}
	<div class="loading">Loading...</div>
{:else if !guest}
	<div class="error">Guest not found.</div>
{:else}
	<div class="page">
		<header class="page-header">
			<h2>Edit {guest.name}</h2>
			<a href="/" class="btn btn-secondary">← Back to Guests</a>
		</header>

		<form class="form" onsubmit={handleSave}>
			<div class="form-grid">
				<div class="field">
					<label for="name">Full Name *</label>
					<input type="text" id="name" bind:value={guest.name} required />
				</div>
				<div class="field">
					<label for="family">Family Name</label>
					<input type="text" id="family" bind:value={guest.family_name} placeholder="Sharma" />
				</div>
				<div class="field">
					<label for="email">Email</label>
					<input type="email" id="email" bind:value={guest.email} placeholder="priya@example.com" />
				</div>
				<div class="field">
					<label for="phone">Phone</label>
					<input type="tel" id="phone" bind:value={guest.phone} placeholder="+91 98765 43210" />
				</div>
			</div>

			<div class="section">
				<div class="section-header">
					<h3>Tags / Occasions</h3>
					<button type="button" class="btn btn-secondary btn-sm" onclick={addTagRow}>+ Add Tag</button>
				</div>
				{#if tagNames}
					<div class="tag-list">
						{#each tagNames.split(',') as tagName}
							<span class="tag-preview">
								{tagName}
								{#if tagOccasions[tagName]}
									<span class="occasion-badge">{tagOccasions[tagName]}</span>
								{/if}
								<button
									type="button"
									class="tag-remove"
									onclick={() => {
										const updated = tagNames.split(',').filter(n => n !== tagName);
										tagNames = updated.length ? updated.join(',') : '';
										const newOcc = { ...tagOccasions };
										delete newOcc[tagName];
										tagOccasions = newOcc;
									}}
								>×</button>
							</span>
						{/each}
					</div>
				{/if}
			</div>

			{#if error}
				<div class="form-error">{error}</div>
			{/if}
			{#if success}
				<div class="form-success">{success}</div>
			{/if}

			<div class="form-actions">
				<button type="submit" class="btn btn-primary" disabled={saving}>
					{saving ? 'Saving...' : 'Save Changes'}
				</button>
			</div>
		</form>
	</div>
{/if}

<style>
	.loading, .error {
		text-align: center;
		padding: 40px;
		color: #888;
	}

	.error {
		color: #e74c3c;
	}

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

	.section {
		margin-bottom: 24px;
		padding-top: 20px;
		border-top: 1px solid #eee;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
	}

	.section-header h3 {
		margin: 0;
		color: #1a1a2e;
		font-size: 1.1rem;
	}

	.tag-list {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-bottom: 12px;
	}

	.tag-preview {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 6px 12px;
		background: #f0f0f0;
		border-radius: 20px;
		font-size: 0.9rem;
	}

	.occasion-badge {
		background: #1a1a2e;
		color: white;
		padding: 2px 8px;
		border-radius: 12px;
		font-size: 0.75rem;
	}

	.tag-remove {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 1.1rem;
		color: #888;
		padding: 0;
		line-height: 1;
	}

	.tag-remove:hover {
		color: #e74c3c;
	}

	.form-error {
		background: #fdf2f2;
		color: #e74c3c;
		padding: 12px 16px;
		border-radius: 8px;
		margin-bottom: 16px;
	}

	.form-success {
		background: #f0fdf4;
		color: #2ecc71;
		padding: 12px 16px;
		border-radius: 8px;
		margin-bottom: 16px;
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
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
