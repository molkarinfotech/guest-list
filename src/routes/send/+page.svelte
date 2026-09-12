<script>
	import { getGuests, getGuest, sendInvites } from '$lib/db.js';

	let occasionName = $state('');

	const allGuests = $derived(() => getGuests());

	let emailMethod = $state('resend');
	let sendResults = $state([]);
	let sending = $state(false);

	let filteredGuests = $state([]);
	let inviteeSelection = $state(new Set());

	$effect(() => {
		filteredGuests = [];
		inviteeSelection = new Set();

		if (!occasionName) return;

		getGuests().then(guests => {
			filteredGuests = guests.filter(g =>
				g.tags?.some(t => t.occasions?.name === occasionName)
			);
			filteredGuests.forEach(g => inviteeSelection.add(g.id));
		});
	});

	function toggleGuest(id) {
		if (inviteeSelection.has(id)) {
			inviteeSelection.delete(id);
		} else {
			inviteeSelection.add(id);
		}
		inviteeSelection = new Set(inviteeSelection);
	}

	function selectAll() {
		filteredGuests.forEach(g => inviteeSelection.add(g.id));
		inviteeSelection = new Set(inviteeSelection);
	}

	function selectNone() {
		inviteeSelection = new Set();
	}

	async function sendInvitation(invitiation) {
		try {
			const result = await sendInvites([invitation]);
			return result.error ? { error: result.error.message } : { success: true, id: result.data.id };
		} catch (err) {
			return { error: err.message };
		}
	}

	async function handleSend() {
		if (!occasionName) return;
		if (inviteeSelection.size === 0) {
			alert('Select at least one guest to invite.');
			return;
		}

		sending = true;
		sendResults = [];

		const selectedGuests = filteredGuests.filter(g => inviteeSelection.has(g.id));

		for (const guest of selectedGuests) {
			const result = await sendInvitation({
				guest_id: guest.id,
				occasion_name: occasionName,
				email: guest.email,
				status: 'pending'
			});
			sendResults = [...sendResults, { guest: guest.name, ...result }];
		}

		sending = false;
	}
</script>

<svelte:head>
	<title>Send Invites</title>
</svelte:head>

<div class="page">
	<header class="page-header">
		<h2>Send Invites</h2>
		<a href="/" class="btn btn-secondary">← Back to Guests</a>
	</header>

	<form class="invite-form" onsubmit={(e) => { e.preventDefault(); handleSend(); }}>
		<div class="field">
			<label for="occasion">Occasion</label>
			<select id="occasion" bind:value={occasionName} class="select">
				<option value="">Select an occasion...</option>
				{#each DEFAULT_OCCASIONS as occ}
					<option value={occ.name}>{occ.name}</option>
				{/each}
			</select>
		</div>

		{#if occasionName}
			<div class="invite-section">
				<h3>Guests tagged for "{occasionName}"</h3>
				<p class="guest-count">{filteredGuests.length} guest{filteredGuests.length !== 1 ? 's' : ''} found</p>

				<div class="selection-bar">
					<button type="button" class="btn btn-sm btn-secondary" onclick={selectAll}>Select All</button>
					<button type="button" class="btn btn-sm btn-secondary" onclick={selectNone}>Clear</button>
				</div>

				{#if filteredGuests.length === 0}
					<div class="empty">No guests tagged for this occasion.</div>
				{:else}
					<div class="guest-list">
						{#each filteredGuests as guest}
							<label class="guest-item" class:selected={inviteeSelection.has(guest.id)}>
								<input
									type="checkbox"
									checked={inviteeSelection.has(guest.id)}
									onchange={() => toggleGuest(guest.id)}
								/>
								<span class="avatar">{guest.name.charAt(0).toUpperCase()}</span>
								<div class="guest-info">
									<span class="guest-name">{guest.name}</span>
									{#if guest.family_name}
										<span class="guest-family">{guest.family_name}</span>
									{/if}
									{#if guest.email}
										<span class="guest-email">{guest.email}</span>
									{/if}
								</div>
							</label>
						{/each}
					</div>
				{/if}

				<div class="send-section">
					<div class="selection-summary">
						{inviteeSelection.size} guest{inviteeSelection.size !== 1 ? 's' : ''} selected
					</div>
					<button
						type="submit"
						class="btn btn-primary btn-lg"
						disabled={sending || inviteeSelection.size === 0}
					>
						{sending ? 'Sending...' : `Send Invites for "${occasionName}"`}
					</button>
				</div>
			</div>
		{/if}
	</form>

	{#if sendResults.length > 0}
		<div class="results">
			<h3>Send Results</h3>
			<table class="results-table">
				<thead>
					<tr>
						<th>Guest</th>
						<th>Status</th>
					</tr>
				</thead>
				<tbody>
					{#each sendResults as result}
						<tr>
							<td>{result.guest}</td>
							<td>
								{#if result.success}
									<span class="status success">Sent</span>
								{:else}
									<span class="status error">{result.error}</span>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
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

	.invite-form {
		background: white;
		padding: 24px;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.08);
	}

	.field {
		margin-bottom: 20px;
	}

	.field label {
		display: block;
		font-weight: 500;
		margin-bottom: 6px;
		color: #1a1a2e;
	}

	.select {
		width: 100%;
		padding: 10px 14px;
		border: 1px solid #ddd;
		border-radius: 8px;
		font-size: 1rem;
		background: white;
	}

	.invite-section {
		margin-top: 24px;
		padding-top: 20px;
		border-top: 1px solid #eee;
	}

	.invite-section h3 {
		margin: 0 0 4px;
		color: #1a1a2e;
	}

	.guest-count {
		margin: 0 0 16px;
		color: #888;
		font-size: 0.9rem;
	}

	.selection-bar {
		display: flex;
		gap: 8px;
		margin-bottom: 16px;
	}

	.guest-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-bottom: 20px;
		max-height: 400px;
		overflow-y: auto;
		border: 1px solid #eee;
		border-radius: 8px;
		padding: 8px;
	}

	.guest-item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 12px;
		border-radius: 6px;
		cursor: pointer;
		transition: background 0.2s;
	}

	.guest-item:hover {
		background: #f8f9fa;
	}

	.guest-item.selected {
		background: #f0f8ff;
	}

	.guest-item input[type="checkbox"] {
		width: 18px;
		height: 18px;
		cursor: pointer;
	}

	.avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: #1a1a2e;
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		font-size: 0.85rem;
		flex-shrink: 0;
	}

	.guest-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}

	.guest-name {
		font-weight: 500;
		color: #1a1a2e;
	}

	.guest-family {
		font-size: 0.85rem;
		color: #888;
	}

	.guest-email {
		font-size: 0.85rem;
		color: #666;
	}

	.send-section {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 16px;
		border-top: 1px solid #eee;
	}

	.selection-summary {
		font-weight: 500;
		color: #1a1a2e;
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

	.btn-lg {
		padding: 12px 28px;
		font-size: 1rem;
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

	.results {
		margin-top: 24px;
		background: white;
		padding: 20px;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.08);
	}

	.results h3 {
		margin: 0 0 16px;
		color: #1a1a2e;
	}

	.results-table {
		width: 100%;
		border-collapse: collapse;
	}

	.results-table th {
		text-align: left;
		padding: 8px 12px;
		background: #f8f9fa;
		font-weight: 600;
		color: #555;
		font-size: 0.9rem;
	}

	.results-table td {
		padding: 10px 12px;
		border-top: 1px solid #eee;
	}

	.status {
		font-weight: 500;
	}

	.status.success {
		color: #2ecc71;
	}

	.status.error {
		color: #e74c3c;
	}

	.empty {
		text-align: center;
		padding: 20px;
		color: #888;
	}
</style>
