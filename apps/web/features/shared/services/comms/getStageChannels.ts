// deno-lint-ignore-file no-explicit-any
import {
	Deps,
	fail,
	normaliseSupabaseError,
	normaliseUnknownError,
	ok,
	Result,
	supabaseClient,
} from '@projective/backend';

export type ChannelScope = 'stage_all' | 'team_private' | 'business_private' | string;

export interface StageChannelSummary {
	id: string;
	visibility: ChannelScope;
	name: string;
	/** Whether the current user may read/post in this scope (private channels gate this). */
	accessible: boolean;
}

export interface StageChannelsResult {
	channels: StageChannelSummary[];
	/** True while the project is in its protected phase (PII filter on, files locked). */
	protectedPhase: boolean;
	/** ISO timestamp of the Projective Unlock, or null while still protected. */
	handoverUnlockedAt: string | null;
}

/**
 * Ensure a stage's three scoped rooms (General / Team / Business) exist and return them with a
 * per-scope access flag plus the project's protected-phase / handover status. Backed by the
 * `comms.get_stage_channels` RPC (mig 0311), which does the provisioning + access resolution in one
 * guarded, definer call.
 */
export async function getStageChannels(
	stage_id: string,
	deps: Deps = {},
): Promise<Result<StageChannelsResult>> {
	try {
		const getClient = deps.getClient ?? supabaseClient;
		const supabase = await getClient();

		const { data, error } = await supabase
			.schema('comms')
			.rpc('get_stage_channels', { p_stage_id: stage_id });

		if (error) {
			const n = normaliseSupabaseError(error);
			return fail(n.code, n.message, n.status);
		}

		const rows = (data ?? []) as any[];
		const channels: StageChannelSummary[] = rows.map((r) => ({
			id: r.id,
			visibility: r.visibility,
			name: r.name,
			accessible: r.accessible === true,
		}));

		// protected_phase / handover_unlocked_at are project-wide — identical on every row.
		const protectedPhase = rows.length > 0 ? rows[0].protected_phase === true : true;
		const handoverUnlockedAt = rows.length > 0 ? (rows[0].handover_unlocked_at ?? null) : null;

		return ok({ channels, protectedPhase, handoverUnlockedAt });
	} catch (err) {
		const n = normaliseUnknownError(err);
		return fail(n.code, n.message, 500);
	}
}
