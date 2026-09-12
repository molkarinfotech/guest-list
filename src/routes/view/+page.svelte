<script>
	import { getInvitees } from '$lib/db.js';

	let occasionName = $state('');

	let invitees = $state([]);
	let loading = $state(true);

	$effect(() => {
		if (!occasionName) {
			invitees = [];
			loading = false;
			return;
		}
		loading = true;
		getInvitees(occasionName).then(invitees => {
			invitees = invitees;
			loading = false;
		});
	});
</script>

<svelte:head>
	<title>Invited Guests</title>
</svelte:head>

<div class="page">
	<header class="page-header">
		<h2>Invited Guests</h2>
		<a href="/send" class="btn btn-secondary">← Send Invites</a>
	</header>

	<div class="filters">
		<label for="occasion">Filter by Occasion:</label>
		<select id="occasion" bind:value={occasionName}>
			<option value="">All occasions</option>
			{#each DEFAULT_OCCASIONS as occ}
				<option value={occ.name}>{occ.name}</option>
			{/each}
		</select>
	</div>

	{#if loading}
		<div class="loading">Loading...</div>
	{:else if invitees.length === 0}
		<div class="empty">
			{#if occasionName}
				No guests invited for "{occasionName}" yet.
			{:else}
				No invitations sent yet.
			{/if}
		</div>
	{:else}
		<table class="invite-table">
			<thead>
				<tr>
					<th>Guest</th>
					<th>Family</th>
					<th>Occasion</th>
					<th>Email</th>
					<th>Status</th>
				</tr>
			</thead>
			<tbody>
				{#each invitees as invitee}
					<tr>
						<td>{invitee.guests?.name || 'Unknown'}</td>
						<td>{invitee.guests?.family_name || '—'}</td>
						<td>
							<span class="occasion-badge" style="background:{invitee.occasions?.color || '#999'}">
								{invitee.occasions?.name || 'Unknown'}
							</span>
						</td>
						<td>{invitee.guests?.email || '—'}</td>
						<td>
							<span class="status status-{invitee.status || 'pending'}">
								{invitee.status || 'Pending'}
							</span>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
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

	.filters {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 20px;
	}

	.filters label {
		font-weight: 500;
		color: #1a1a2e;
	}

	select {
		padding: 10px 14px;
		border: 1px solid #ddd;
		border-radius: 8px;
		font-size: 1rem;
		background: white;
	}

	.invite-table {
		width: 100%;
		border-collapse: collapse;
		background: white;
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0,0,0,0.08);
	}

	.invite-table th {
		background: #f8f9fa;
		padding: 12px 16px;
		text-align: left;
		font-weight: 600;
		color: #555;
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.invite-table td {
		padding: 14px 16px;
		border-top: 1px solid #eee;
	}

	.invite-table tr:hover {
		background: #fafafa;
	}

	.occasion-badge {
		display: inline-block;
		padding: 4px 10px;
		border-radius: 20px;
		color: white;
		font-size: 0.8rem;
		font-weight: 500;
	}

	.status {
		font-weight: 500;
		font-size: 0.9rem;
	}

	.status-pending {
		color: #f39c12;
	}

	.status-sent {
		color: #2ecc71;
	}

	.status-failed {
		color: #e74c3c;
	}

	.loading, .empty {
		text-align: center;
		padding: 40px;
		color: #888;
	}
</style>
