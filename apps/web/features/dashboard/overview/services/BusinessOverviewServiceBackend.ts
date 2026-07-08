/**
 * @file BusinessOverviewServiceBackend.ts
 * @description Backend service for the Business Administration dashboard (US-008). Reads live
 * balances / transaction lines / escrow allocations straight from the Postgres ledger engine via
 * the `org.get_business_finance` RPC (migration 0309, which exposes the otherwise-hidden `finance.*`
 * schema through a SECURITY DEFINER wrapper), and the member roster via `org.get_business_members`.
 * Per the Islands boundary, all DB access lives here — routes only parse/guard.
 */

import {
	type Deps,
	fail,
	normaliseSupabaseError,
	normaliseUnknownError,
	ok,
	type Result,
	supabaseClient,
} from '@projective/backend';
import type { SupabaseClient } from 'supabaseClient';
import type { BusinessFinancePayload, BusinessMember } from '../contracts/Overview.ts';

/**
 * Resolve a `files.items` id into a public storage URL — mirrors the auth service's avatar
 * resolver. Returns null until the upload has finished scanning (`status = 'clean'`), so callers
 * never render a URL to an object that isn't in its target bucket yet.
 */
async function resolveFileUrl(
	sb: SupabaseClient,
	fileId: string | null | undefined,
): Promise<string | null> {
	if (!fileId) return null;
	const { data: file } = await sb
		.schema('files')
		.from('items')
		.select('bucket_id, storage_path, status')
		.eq('id', fileId)
		.maybeSingle();
	if (!file || file.status !== 'clean' || !file.bucket_id || !file.storage_path) return null;
	const { data } = sb.storage.from(file.bucket_id).getPublicUrl(file.storage_path);
	return data?.publicUrl ?? null;
}

/** Live finance snapshot for a business wallet (balances + ledger + escrow allocations). */
export async function getBusinessFinance(
	businessId: string,
	deps: Deps = {},
): Promise<Result<BusinessFinancePayload>> {
	try {
		const getClient = deps.getClient ?? supabaseClient;
		const supabase = await getClient();

		const { data, error } = await supabase
			.schema('org')
			.rpc('get_business_finance', { p_business_id: businessId });

		if (error) {
			const n = normaliseSupabaseError(error);
			return fail(n.code, n.message, n.status);
		}

		return ok(data as BusinessFinancePayload);
	} catch (err) {
		const n = normaliseUnknownError(err);
		return fail(n.code, n.message, 500);
	}
}

/** Organization member roster with avatars resolved to public URLs (AC5). */
export async function getBusinessMembers(
	businessId: string,
	deps: Deps = {},
): Promise<Result<BusinessMember[]>> {
	try {
		const getClient = deps.getClient ?? supabaseClient;
		const supabase = await getClient();

		const { data, error } = await supabase
			.schema('org')
			.rpc('get_business_members', { p_business_id: businessId });

		if (error) {
			const n = normaliseSupabaseError(error);
			return fail(n.code, n.message, n.status);
		}

		const rows = (data ?? []) as Array<
			Omit<BusinessMember, 'avatarUrl'> & { avatar_file_id: string | null }
		>;

		const members = await Promise.all(rows.map(async (r) => ({
			user_id: r.user_id,
			name: r.name,
			username: r.username,
			role: r.role,
			status: r.status,
			joined_at: r.joined_at,
			is_owner: r.is_owner,
			avatarUrl: await resolveFileUrl(supabase, r.avatar_file_id),
		})));

		return ok(members);
	} catch (err) {
		const n = normaliseUnknownError(err);
		return fail(n.code, n.message, 500);
	}
}
