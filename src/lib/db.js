import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase =
	SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL.startsWith('https://')
		? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
		: null;

export async function getGuests() {
	if (!supabase) return [];
	const { data, error } = await supabase
		.from('guests')
		.select('*, tags(name, occasion_id), occasions(*, taggings!)')
		.order('created_at', { ascending: false });
	if (error) return [];
	return data;
}

export async function getGuest(id) {
	if (!supabase) return null;
	const { data, error } = await supabase
		.from('guests')
		.select('*, tags(name, occasion_id), occasions(*, taggings!)')
		.eq('id', id)
		.single();
	if (error) return null;
	return data;
}

export async function createGuest(guest) {
	if (!supabase) return { error: 'No Supabase connection' };
	const { data, error } = await supabase
		.from('guests')
		.insert([guest])
		.select()
		.single();
	return error ? { error } : { data };
}

export async function updateGuest(id, guest) {
	if (!supabase) return { error: 'No Supabase connection' };
	const { data, error } = await supabase
		.from('guests')
		.update(guest)
		.eq('id', id)
		.select()
		.single();
	return error ? { error } : { data };
}

export async function deleteGuest(id) {
	if (!supabase) return { error: 'No Supabase connection' };
	const { error } = await supabase.from('guests').delete().eq('id', id);
	return error ? { error } : { success: true };
}

export async function getTagsForGuest(guestId) {
	if (!supabase) return [];
	const { data, error } = await supabase
		.from('tags')
		.select('*, occasions(name)')
		.eq('guest_id', guestId);
	if (error) return [];
	return data;
}

export async function createTag(tag) {
	if (!supabase) return { error: 'No Supabase connection' };
	const { data, error } = await supabase.from('tags').insert([tag]).select().single();
	return error ? { error } : { data };
}

export async function deleteTag(id) {
	if (!supabase) return { error: 'No Supabase connection' };
	const { error } = await supabase.from('tags').delete().eq('id', id);
	return error ? { error } : { success: true };
}

export async function getOccasions() {
	if (!supabase) return [];
	const { data, error } = await supabase.from('occasions').select('*').order('name');
	if (error) return [];
	return data;
}

export async function createOccasion(occasion) {
	if (!supabase) return { error: 'No Supabase connection' };
	const { data, error } = await supabase.from('occasions').insert([occasion]).select().single();
	return error ? { error } : { data };
}

export async function getInvitees(occasionId) {
	if (!supabase) return [];
	const { data, error } = await supabase
		.from('tags')
		.select(' guests!inner(name, email, phone), occasions(name) ')
		.eq('occasion_id', occasionId);
	if (error) return [];
	return data;
}

export async function sendInvites(invitations) {
	if (!supabase) return { error: 'No Supabase connection' };
	const { data, error } = await supabase
		.from('invitations')
		.insert(invitations)
		.select()
		.single();
	return error ? { error } : { data };
}
