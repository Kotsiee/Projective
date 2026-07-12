/**
 * @file HomeGate.tsx
 * @description Signed-out fallback for `/home`. The `(dashboard)` group has no server auth guard, so a
 * request without a session renders this tasteful gate (mirrors the old dashboard empty state) rather
 * than a broken persona feed.
 */

export function HomeGate() {
	return (
		<div class='home-gate'>
			<div class='home-gate__panel'>
				<span class='home-gate__eyebrow'>Projective</span>
				<h1 class='home-gate__title'>Your home, tailored to you</h1>
				<p class='home-gate__body'>
					Sign in to see recommended work, curated talent, and your live activity — all in one
					premium feed.
				</p>
				<div class='home-gate__actions'>
					<a class='home-gate__cta home-gate__cta--primary' href='/login?next=/home'>Sign in</a>
					<a class='home-gate__cta' href='/join'>Create account</a>
				</div>
			</div>
		</div>
	);
}

export default HomeGate;
