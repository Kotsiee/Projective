/**
 * @file index.tsx
 * @description `/become-partner` — the ultra-luxury freelancer conversion funnel. Server route
 * (define.page, one-way data flow per apps/web/CLAUDE.md): resolves the authenticated user via
 * `getMe`, then renders the static editorial shell + its two atomic islands (CTA + FAQ). The
 * `(dashboard)` group is auth-guarded (`_middleware.ts` → /login) so viewers here are always signed
 * in. Like `/home` it returns its shell directly (no `f-client-nav` + `Partial`): every link targets
 * a different route, so there is no same-route partial to swap.
 */

import { define } from '@utils';
import { supabaseClient } from '@projective/backend';
import { AuthBackendService } from '@features/shared/services/profile/AuthServiceBackend.ts';
import { BecomePartnerShell } from '@features/marketing/become-partner/components/BecomePartnerShell.tsx';

export default define.page(async function BecomePartner(ctx) {
	const getClient = () => supabaseClient(ctx.req);
	const me = await AuthBackendService.getMe({ getClient });
	const profile = me.ok ? me.data : null;

	return (
		<BecomePartnerShell
			alreadyPartner={!!profile?.hasFreelancer}
			displayName={profile?.displayName ?? null}
		/>
	);
});
