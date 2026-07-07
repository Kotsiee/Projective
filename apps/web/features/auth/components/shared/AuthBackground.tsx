/**
 * @file AuthBackground.tsx
 * @description Static, decorative animated backdrop for the auth flow — a drifting
 * theme-aware gradient mesh plus subtle floating shapes. Purely presentational
 * (aria-hidden); all motion is gated behind prefers-reduced-motion in CSS.
 */
export function AuthBackground() {
	return (
		<div class='auth-bg' aria-hidden='true'>
			<div class='auth-bg__grad'></div>
			<div class='auth-shape o1'></div>
			<div class='auth-shape o2'></div>
			<div class='auth-shape auth-shape--ring r1'></div>
			<div class='auth-shape auth-shape--ring r2'></div>
			<div class='auth-shape auth-shape--sq s1'></div>
			<div class='auth-shape auth-shape--sq s2'></div>
			<div class='auth-shape auth-shape--dot d1'></div>
			<div class='auth-shape auth-shape--dot d2'></div>
			<div class='auth-shape auth-shape--dot d3'></div>
		</div>
	);
}
