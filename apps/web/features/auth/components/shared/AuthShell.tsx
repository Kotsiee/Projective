/**
 * @file AuthShell.tsx
 * @description The 2-pane glass auth card. Left = the aurora visual pane (brand +
 * a per-screen `visual` slot); right = the form panel (`children`). Static and
 * presentational — the interactive form is passed in as an island, and for the
 * Join flow the whole shell is rendered inside the onboarding island so the visual
 * pane's live identity card can read the wizard context.
 */

import type { ComponentChildren } from 'preact';

interface AuthShellProps {
	/** Per-screen content for the visual (left) pane. */
	visual: ComponentChildren;
	/** Form content for the right panel. */
	children: ComponentChildren;
}

export function AuthShell({ visual, children }: AuthShellProps) {
	return (
		<div class='auth-shell'>
			<aside class='auth-visual'>
				<div class='auth-visual__veil'></div>
				<div class='auth-brand'>
					<span class='auth-brand__mark'></span> Projective
				</div>
				{visual}
			</aside>

			<main class='auth-panel'>
				<div class='auth-panel__inner auth-stagger'>
					{children}
				</div>
			</main>
		</div>
	);
}
