/**
 * @file GlassDisplayCard.tsx
 * @description The live "Projective ID" — a frosted glass identity card that fills
 * in as the user types their name / username / path in the onboarding wizard.
 * Reads the shared OnboardingContext so it updates reactively, and tilts subtly
 * toward the pointer (reduced-motion respected).
 */

import '../../../styles/components/onboarding/displays/glass-display-card.css';
import { useEffect, useRef } from 'preact/hooks';
import { useOnboardingContext } from '../../../contexts/OnboardingContext.tsx';

export function GlassDisplayCard() {
	const { firstName, lastName, username, objective } = useOnboardingContext();

	const wrapRef = useRef<HTMLDivElement>(null);
	const cardRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const wrap = wrapRef.current;
		const card = cardRef.current;
		if (!wrap || !card) return;
		if (globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

		const onMove = (e: MouseEvent) => {
			const r = wrap.getBoundingClientRect();
			const px = (e.clientX - r.left) / r.width - 0.5;
			const py = (e.clientY - r.top) / r.height - 0.5;
			card.style.setProperty('--ry', `${(px * 14).toFixed(2)}deg`);
			card.style.setProperty('--rx', `${(-py * 12).toFixed(2)}deg`);
		};
		const onLeave = () => {
			card.style.setProperty('--ry', '0deg');
			card.style.setProperty('--rx', '0deg');
		};

		wrap.addEventListener('mousemove', onMove);
		wrap.addEventListener('mouseleave', onLeave);
		return () => {
			wrap.removeEventListener('mousemove', onMove);
			wrap.removeEventListener('mouseleave', onLeave);
		};
	}, []);

	const fullName = `${firstName.value ?? ''} ${lastName.value ?? ''}`.trim();
	const initial = (firstName.value?.[0] ?? 'P').toUpperCase();
	const handle = (username.value ?? '').replace(/^@+/, '');
	const roleLabel = objective.value === 'seller'
		? 'Freelancer · For hire'
		: objective.value === 'client'
		? 'Client · Hiring'
		: 'Choose your path';

	return (
		<div class='idwrap' ref={wrapRef}>
			<div class='idcard' ref={cardRef} role='img' aria-label='Live preview of your Projective ID'>
				<div class='idcard__top'>
					<div class='idcard__avatar'>{initial}</div>
					<div>
						<div class={`idcard__name ${fullName ? '' : 'placeholder'}`}>
							{fullName || 'Your name'}
						</div>
						<div class='idcard__user'>{handle ? `@${handle}` : '@username'}</div>
					</div>
				</div>

				<div class='idcard__meta'>
					<span class='idbadge'>
						<span class='dot'></span> {roleLabel}
					</span>
					<span class='idbadge'>Member · 2026</span>
				</div>

				<div class='idcard__foot'>
					<span>Projective ID</span>
					<span class='idcard__chip'></span>
				</div>
			</div>
		</div>
	);
}
