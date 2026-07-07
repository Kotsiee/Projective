/**
 * @file ChartFocusModal.tsx
 * @description Island-compatible large-view modal controller. Lifts any chart into a maximized
 * full-screen focus frame with an optional configuration panel (the caller supplies concrete
 * layer toggles / timeline sliders / category filters as `controls`). Reads a boolean or a
 * `@preact/signals` Signal for `open` so an island can drive it reactively; fixed-position
 * overlay (no portal) keeps it SSR- and island-friendly.
 */

import '../../styles/finance/chart-focus-modal.css';
import { Signal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { IconX } from '@tabler/icons-preact';
import type { ChartFocusModalProps } from '../../types/finance.ts';

export function ChartFocusModal(props: ChartFocusModalProps) {
	const { open, title, subtitle, onClose, children, controls } = props;
	const isOpen = open instanceof Signal ? open.value : open;

	useEffect(() => {
		if (!isOpen || typeof document === 'undefined') return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};
		document.addEventListener('keydown', onKey);
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.removeEventListener('keydown', onKey);
			document.body.style.overflow = prevOverflow;
		};
	}, [isOpen]);

	if (!isOpen) return null;

	return (
		<div class='chart-focus' role='dialog' aria-modal='true' aria-label={title} onClick={onClose}>
			<div
				class='chart-focus__frame'
				onClick={(e) =>
					e.stopPropagation()}
			>
				<header class='chart-focus__header'>
					<div class='chart-focus__heading'>
						<h2 class='chart-focus__title'>{title}</h2>
						{subtitle && <p class='chart-focus__subtitle'>{subtitle}</p>}
					</div>
					<button type='button' class='chart-focus__close' onClick={onClose} aria-label='Close'>
						<IconX size={18} stroke={2} />
					</button>
				</header>

				<div class='chart-focus__body'>
					<div class='chart-focus__stage'>{children}</div>
					{controls && <aside class='chart-focus__config'>{controls}</aside>}
				</div>
			</div>
		</div>
	);
}
