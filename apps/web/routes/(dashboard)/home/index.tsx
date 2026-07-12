/**
 * @file index.tsx
 * @description `/home` — the persona-adaptive engagement feed that replaced the business-only
 * `/dashboard`. This controller resolves the authenticated user + persona on the server, then asks
 * `HomeFeedServiceBackend` for the first mixed-media page, personal insights, and highlights. It
 * renders the static shell + first feed page server-side and hands off to atomic islands (insights,
 * profile-setup tracker, infinite feed, highlights) for interactivity — no client fetch on mount.
 *
 * Persona gating (see apps/web/CLAUDE.md one-way flow):
 *   - Freelancer (acting as a freelancer profile or inside a team) → projects to join, open teams,
 *     roles matched to them.
 *   - Client / Operator (everyone else) → premium services to buy, top-rated talent, active projects.
 *
 * Navigation note: this route renders its shell DIRECTLY and does NOT wrap it in `f-client-nav` +
 * a `Partial` (unlike routes with a same-route partial refresh, e.g. business settings tabs). `/home`
 * has no self-refresh control — every link points at a DIFFERENT route — so enabling client-side
 * partial navigation here would trap those clicks: Fresh would `pushState` but find no matching
 * `Partial` on the destination and never swap the DOM, freezing the page on the home view. Returning
 * the shell directly (like `business`/`teams`) lets links navigate normally.
 */

import { define } from '@utils';
import { supabaseClient } from '@projective/backend';
import type { Persona } from '@projective/types';
import { AuthBackendService } from '@features/shared/services/profile/AuthServiceBackend.ts';
import { HomeFeedServiceBackend } from '@features/dashboard/home/services/HomeFeedServiceBackend.ts';
import { HomeShell } from '@features/dashboard/home/components/HomeShell.tsx';
import { HomeGate } from '@features/dashboard/home/components/HomeGate.tsx';

function derivePersona(
	p: { activeProfileType: string | null; activeTeamId: string | null },
): Persona {
	return p.activeProfileType === 'freelancer' || !!p.activeTeamId ? 'freelancer' : 'client';
}

function greetingFor(name: string | null): string {
	const hour = new Date().getHours();
	const salut = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
	const first = name?.trim()?.split(/\s+/)[0] ?? 'there';
	return `${salut}, ${first}`;
}

export default define.page(async function Home(ctx) {
	const getClient = () => supabaseClient(ctx.req);

	const me = await AuthBackendService.getMe({ getClient });
	const profile = me.ok ? me.data : null;

	let body;
	if (!profile) {
		body = <HomeGate />;
	} else {
		const persona = derivePersona(profile);
		const data = await HomeFeedServiceBackend.getHomeData(persona, { getClient });
		const subtitle = persona === 'freelancer'
			? 'Fresh roles, teams, and highlights picked for you.'
			: 'Top talent, premium services, and your projects at a glance.';

		body = (
			<HomeShell
				greeting={greetingFor(profile.displayName)}
				subtitle={subtitle}
				displayName={profile.displayName}
				username={profile.username}
				avatarUrl={profile.avatarUrl}
				persona={persona}
				profileSetup={profile.profileSetup}
				insights={data.insights}
				highlights={data.highlights}
				feed={data.feed}
				hasFreelancer={profile.hasFreelancer}
				businessCount={profile.businesses.length}
				teamCount={profile.teams.length}
				hasProjects={profile.activeProjectCount > 0}
			/>
		);
	}

	return body;
});
