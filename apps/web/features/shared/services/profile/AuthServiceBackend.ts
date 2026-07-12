/**
 * @file auth-backend-service.ts
 * @description Backend service layer for handling authentication contexts and user profile retrieval.
 */

import { SupabaseClient } from 'supabaseClient';
import { computeProfileSetup } from '@features/shared/profile/completeness.ts';

// #region Interfaces
export interface Deps {
	getClient?: () => Promise<SupabaseClient>;
}

/** A switchable business/team context (id + display name). */
interface OrgRef {
	id: string;
	name: string;
}
// #endregion

// #region Helpers
/**
 * Merge owned + membership org rows into a unique, id-keyed list.
 * @param {Array<OrgRef | null | undefined>} refs - Raw rows (may contain nulls).
 * @returns {OrgRef[]} De-duplicated references preserving first-seen order.
 */
function dedupeOrgRefs(refs: Array<OrgRef | null | undefined>): OrgRef[] {
	const seen = new Map<string, OrgRef>();
	for (const r of refs) {
		if (r?.id && !seen.has(r.id)) seen.set(r.id, { id: r.id, name: r.name });
	}
	return [...seen.values()];
}

/**
 * Resolve a users_public.avatar_file_id into a public storage URL.
 *
 * A finalized file lives at `bucket_id`/`storage_path` with `status = 'clean'`
 * (see the scan-file edge function, which promotes the quarantined upload into
 * its target bucket). Avatars target the public `public_assets` bucket, so
 * getPublicUrl yields a directly-usable URL. Returns null when there is no
 * avatar or the upload has not finished scanning yet (so callers never render a
 * URL to an object that isn't in place).
 *
 * @param {SupabaseClient} sb - Authenticated client (files.items SELECT is authed-only).
 * @param {string | null | undefined} fileId - The avatar_file_id, if any.
 * @returns {Promise<string | null>} The public URL, or null.
 */
async function resolveAvatarUrl(
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

	if (!file || file.status !== 'clean' || !file.bucket_id || !file.storage_path) {
		return null;
	}

	const { data } = sb.storage.from(file.bucket_id).getPublicUrl(file.storage_path);
	return data?.publicUrl ?? null;
}
// #endregion

export class AuthBackendService {
	// #region Main Methods
	/**
	 * Retrieves the current authenticated user's profile and session context.
	 * @param {Deps} deps - Dependency injection containing the Supabase client getter.
	 * @returns {Promise<{ok: boolean, data?: any, error?: any}>}
	 */
	static async getMe(deps: Deps = {}) {
		if (!deps.getClient) {
			console.error('[AuthBackendService] Missing database client context');
			return { ok: false, error: { status: 500, code: 'internal_error' } };
		}

		const sb = await deps.getClient();

		// 1. Get Auth User
		const { data: userRes, error: userErr } = await sb.auth.getUser();

		if (userErr || !userRes?.user) {
			return { ok: false, error: { status: 401, code: 'unauthorized' } };
		}

		// 2. Fetch Public Profile. The select is widened past the header essentials to the fields the
		// profile-setup completeness engine reads (headline / bio / interests / languages / counts) —
		// all on this same already-fetched row, so the tracker costs no extra round-trip.
		const { data: publicProfile } = await sb
			.schema('org')
			.from('users_public')
			.select(
				'user_id, first_name, last_name, username, avatar_file_id, is_operator, headline, bio, interests, languages, service_count, active_project_count',
			)
			.eq('user_id', userRes.user.id)
			.single();

		// 3. Fetch Session Context
		const { data: sessionContext } = await sb
			.schema('security')
			.from('session_context')
			.select('active_profile_type, active_profile_id, active_team_id')
			.eq('user_id', userRes.user.id)
			.single();

		// 4. Fetch switchable contexts (best-effort — any failure resolves to []).
		const userId = userRes.user.id;
		const [freelancerRes, ownedBizRes, memberBizRes, ownedTeamRes, memberTeamRes] = await Promise
			.all([
				sb.schema('org').from('freelancer_profiles').select('user_id, skills').eq(
					'user_id',
					userId,
				)
					.maybeSingle(),
				sb.schema('org').from('business_profiles').select('id, name').eq('owner_user_id', userId),
				sb.schema('org').from('business_members').select('business:business_profiles(id, name)')
					.eq('user_id', userId).eq('status', 'active'),
				sb.schema('org').from('teams').select('id, name').eq('owner_user_id', userId),
				sb.schema('org').from('team_members').select('team:teams(id, name)').eq('user_id', userId)
					.eq('status', 'active'),
			]);

		const memberBiz = (memberBizRes.data ?? []) as unknown as Array<{ business: OrgRef | null }>;
		const memberTeams = (memberTeamRes.data ?? []) as unknown as Array<{ team: OrgRef | null }>;

		const businesses = dedupeOrgRefs([
			...((ownedBizRes.data ?? []) as OrgRef[]),
			...memberBiz.map((r) => r.business),
		]);
		const teams = dedupeOrgRefs([
			...((ownedTeamRes.data ?? []) as OrgRef[]),
			...memberTeams.map((r) => r.team),
		]);
		const hasFreelancer = !!freelancerRes.data;

		// Resolve the avatar file id into a public storage URL (null if unset/unscanned).
		const avatarUrl = await resolveAvatarUrl(sb, publicProfile?.avatar_file_id);

		// Profile-setup completeness — computed from the widened public-profile row + freelancer skills
		// via the shared engine so /home, the nav dropdown, and the profile rail never disagree.
		const bio = publicProfile?.bio;
		const hasBio = bio != null &&
			(typeof bio === 'string' ? bio.trim().length > 0 : Object.keys(bio).length > 0);
		const freelancerSkills = (freelancerRes.data as { skills?: unknown[] } | null)?.skills ?? [];
		const interests = (publicProfile?.interests as unknown[] | null) ?? [];
		const languages = (publicProfile?.languages as unknown[] | null) ?? [];
		const activeProjectCount = Number(publicProfile?.active_project_count ?? 0);
		const profileSetup = computeProfileSetup({
			username: publicProfile?.username ?? null,
			isFreelancer: hasFreelancer,
			// A hiring footprint (operator mode, an owned/member business or team) keeps the client
			// tail alongside the freelancer one — the dual-state a converted "Become a Partner" user
			// lands in. A plain client who converts simply swaps the client tail for the freelancer one.
			isClient: !hasFreelancer || !!publicProfile?.is_operator ||
				businesses.length > 0 || teams.length > 0,
			hasAvatar: !!publicProfile?.avatar_file_id,
			hasHeadline: !!(publicProfile?.headline && String(publicProfile.headline).trim().length > 0),
			hasBio,
			hasSkills: hasFreelancer ? freelancerSkills.length > 0 : interests.length > 0,
			hasLanguages: languages.length > 0,
			serviceCount: Number(publicProfile?.service_count ?? 0),
			projectCount: activeProjectCount,
		});

		// 5. Construct Payload
		const payload = {
			id: userRes.user.id,
			displayName: publicProfile
				? `${publicProfile.first_name || ''} ${publicProfile.last_name || ''}`.trim() ||
					publicProfile.username
				: null,
			username: publicProfile?.username ?? null,
			avatarUrl,

			activeProfileType: (sessionContext?.active_profile_type as
				| 'freelancer'
				| 'business'
				| null) ?? null,
			activeProfileId: (sessionContext?.active_profile_id as string | null) ?? null,
			activeTeamId: (sessionContext?.active_team_id as string | null) ?? null,

			hasFreelancer,
			freelancerProfileId: hasFreelancer ? userId : null,
			businesses,
			teams,

			// Count of active projects the user is engaged in — gates the "start/find a project"
			// action-hub CTAs (a completed action is permanently hidden).
			activeProjectCount,

			// Account-level "Client / Operator Mode" modifier — gates the Businesses nav space.
			isOperator: !!publicProfile?.is_operator,

			// Profile-setup completeness snapshot (percent + ordered checklist with edit deep-links).
			profileSetup,
		};

		return { ok: true, data: payload };
	}
	// #endregion
}
