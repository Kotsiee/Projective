// deno-lint-ignore-file no-explicit-any
import { OnboardingRequest } from "@contracts/auth/onboading.ts";
import { Deps } from "./_shared/types.ts";
import { fail, ok, Result } from "../core/http/result.ts";
import {
	normaliseSupabaseError,
	normaliseUnknownError,
} from "../core/errors/normalise.ts";
import { supabaseClient } from "../core/clients/supabase.ts";

export async function onboarding(
	{
		firstName,
		lastName,
		username,
		dob,
		type,
	}: OnboardingRequest,
	deps: Deps = {},
): Promise<Result<any>> {
	if (!firstName || !username || !dob) {
		return fail(
			"bad_request",
			"First name, Date of Birth and username are required.",
			400,
		);
	}

	try {
		const getClient = deps.getClient ?? supabaseClient;
		const supabase = await getClient();

		const { data: { user }, error: authError } = await supabase.auth
			.getUser();

		if (authError || !user) {
			return fail(
				"unauthorized",
				"You must be signed in to onboard.",
				401,
			);
		}

		const { error: userError } = await supabase.schema("org").rpc(
			"onboard_user",
			{
				p_first_name: firstName,
				p_last_name: lastName,
				p_username: username,
				p_dob: dob,
				p_profile_type: type,
			},
		);

		if (userError) {
			const n = normaliseSupabaseError(userError);
			return fail(n.code, n.message, n.status);
		}

		return ok<any>({});
	} catch (err) {
		const n = normaliseUnknownError(err);
		return fail(n.code, n.message, 500);
	}
}

export async function isOnboarded(req: Request) {
	const supabase = await supabaseClient(req);
	const { data, error } = await supabase.auth.getUser();

	if (error || !data.user?.id) {
		return false;
	}

	// FIX: Explicitly check for returned rows
	const { data: userData } = await supabase
		.schema("org")
		.from("users_public")
		.select("user_id")
		.eq("user_id", data.user.id);

	// If array has items, user is onboarded
	if (userData && userData.length > 0) {
		return true;
	}

	return false;
}
