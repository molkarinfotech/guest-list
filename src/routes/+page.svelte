<script>
	import { getGuests, deleteGuest } from '$lib/db.js';

	let guests = $state([]);
	let loading = $state(true);
	let search = $state('');
	let filterOccasion = $state('');

	let deleteTarget = $state(null);

	$effect(() => {
		loading = true;
		getGuests().then(guests => {
			guests = guests;
			loading = false;
		});
	});

	const filtered = $derived(() => {
		let result = guests;
		if (search) {
			const q = search.toLowerCase();
			result = result.filter(g =>
				g.name.toLowerCase().includes(q) ||
				g.email?.toLowerCase().includes(q) ||
				g.phone?.includes(q)
			);
		}
		if (filterOccasion) {
			result = result.filter(g =>
				g.tags?.some(t => t.occasions?.name === filterOccasion)
			);
		}
		return result;
	});

	const occasionOptions = $derived(() => {
		const occs = new Set();
		guests?.forEach(g => {
			g.tags?.forEach(t => {
				if (t.occasions?.name) occs.add(t.occasions.name);
			});
		});
		return [...occs].sort();
	});

	async function handleDelete(id) {
		if (!confirm('Delete this guest permanently?')) return;
		const result = await deleteGuest(id);
		if (result.error) {
			alert('Error: ' + result.error.message);
		} else {
			guests = guests.filter(g => g.id !== id);
		}
	}
</script>

<svelte:head>
	<title>Guests</title>
</svelte:head>

<div class="page">
	<header class="page-header">
		<h2>All Guests</h2>
		<a href="/add" class="btn btn-primary">+ Add Guest</a>
	</header>

	<div class="filters">
		<input
			type="text"
			placeholder="Search by name, email, phone..."
			bind:value={search}
			class="search-input"
		/>
		<select bind:value={filterOccasion} class="filter-select">
			<option value="">All occasions</option>
			{#each occasionOptions() as occ}
				<option value={occ}>{occ}</option>
			{/each}
		</select>
	</div>

	{#if loading}
		<div class="loading">Loading guests...</div>
	{:else if filtered().length === 0}
		<div class="empty">
			{#if guests.length === 0}
				No guests yet. <a href="/add">Add your first guest</a>.
			{:else}
				No guests match your filters.
			{/if}
		</div>
	{:else}
		<table class="guest-table">
			<thead>
				<tr>
					<th>Name</th>
					<th>Email</th>
					<th>Phone</th>
					<th>Tags / Occasions</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each filtered() as guest}
					<tr>
						<td>
							<div class="name-cell">
								<span class="avatar">{guest.name.charAt(0).toUpperCase()}</span>
								<div class="name-info">
									<span class="name">{guest.name}</span>
									{#if guest.family_name}
										<span class="family">{guest.family_name}</span>
									{/if}
								</div>
							</div>
						</td>
						<td>{guest.email || '—'}</td>
						<td>{guest.phone || '—'}</td>
						<td>
							<div class="tags">
								{#each guest.tags || [] as tag}
									<span class="tag" style="background:{tag.occasions?.color || '#999'}">
										{tag.occasions?.name || tag.name}
									</span>
								{/each}
								{#if !(guest.tags?.length)}
									<span class="no-tags">No tags</span>
								{/if}
							</div>
						</td>
						<td>
							<a href="/edit/{guest.id}" class="btn btn-sm">Edit</a>
							<button
								class="btn btn-sm btn-danger"
								onclick={() => deleteTarget = guest.id}
								aria-label="Delete {guest.name}"
							>Delete</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</div>

{#if deleteTarget}
	<div class="modal-overlay" role="dialog" aria-modal="true">
		<div class="modal">
			<h3>Delete {guests.find(g => g.id === deleteTarget)?.name}?</h3>
			<p>This will remove the guest and all their tags. This cannot be undone.</p>
			<div class="modal-actions">
				<button class="btn btn-secondary" onclick={() => deleteTarget = null}>Cancel</button>
				<button class="btn btn-danger" onclick={() => { handleDelete(deleteTarget); deleteTarget = null; }}>Delete</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
	}

	.page-header h2 {
		margin: 0;
		color: #1a1a2e;
	}

	.filters {
		display: flex;
		gap: 12px;
		margin-bottom: 20px;
	}

	.search-input {
		flex: 1;
		padding: 10px 14px;
		border: 1px solid #ddd;
		border-radius: 8px;
		font-size: 1rem;
		transition: border-color 0.2s;
	}

	.search-input:focus {
		outline: none;
		border-color: #1a1a2e;
	}

	.filter-select {
		padding: 10px 14px;
		border: 1px solid #ddd;
		border-radius: 8px;
		font-size: 1rem;
		background: white;
		min-width: 200px;
	}

	.guest-table {
		width: 100%;
		border-collapse: collapse;
		background: white;
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0,0,0,0.08);
	}

	.guest-table th {
		background: #f8f9fa;
		padding: 12px 16px;
		text-align: left;
		font-weight: 600;
		color: #555;
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.guest-table td {
		padding: 14px 16px;
		border-top: 1px solid #eee;
	}

	.guest-table tr:hover {
		background: #fafafa;
	}

	.name-cell {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.avatar {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: #1a1a2e;
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		font-size: 0.9rem;
	}

	.name-info {
		display: flex;
		flex-direction: column;
	}

	.name {
		font-weight: 500;
		color: #1a1a2e;
	}

	.family {
		font-size: 0.85rem;
		color: #888;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.tag {
		padding: 4px 10px;
		border-radius: 20px;
		color: white;
		font-size: 0.8rem;
		font-weight: 500;
	}

	.no-tags {
		color: #aaa;
		font-size: 0.9rem;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 8px 16px;
		border-radius: 6px;
		font-weight: 500;
		text-decoration: none;
		cursor: pointer;
		border: none;
		font-size: 0.9rem;
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

	.btn-primary:hover {
		background: #2d2d4e;
	}

	.btn-secondary {
		background: #e0e0e0;
		color: #555;
	}

	.btn-secondary:hover {
		background: #d0d0d0;
	}

	.btn-danger {
		background: #e74c3c;
		color: white;
	}

	.btn-danger:hover {
		background: #c0392b;
	}

	.loading, .empty {
		text-align: center;
		padding: 40px;
		color: #888;
	}

	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0,0,0,0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
	}

	.modal {
		background: white;
		padding: 24px;
		border-radius: 12px;
		max-width: 400px;
		width: 90%;
		box-shadow: 0 8px 32px rgba(0,0,0,0.2);
	}

	.modal h3 {
		margin: 0 0 8px;
		color: #1a1a2e;
	}

	.modal p {
		color: #666;
		margin: 0 0 20px;
	}

	.modal-actions {
		display: flex;
		gap: 10px;
		justify-content: flex-end;
	}
</style>
