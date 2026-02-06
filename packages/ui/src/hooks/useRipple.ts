import { useSignal } from '@preact/signals';

// #region Interfaces
export interface Ripple {
	x: number;
	y: number;
	id: number;
}
// #endregion

/**
 * Hook to manage material-style ripple effects.
 * Logic is self-contained to avoid dependencies on 'fields' package.
 */
export function useRipple() {
	const ripples = useSignal<Ripple[]>([]);

	const addRipple = (e: MouseEvent | TouchEvent) => {
		const target = e.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();

		let clientX, clientY;
		if (e instanceof MouseEvent) {
			clientX = e.clientX;
			clientY = e.clientY;
		} else {
			// Basic touch support
			if (e.touches.length > 0) {
				clientX = e.touches[0].clientX;
				clientY = e.touches[0].clientY;
			} else {
				return;
			}
		}

		const x = clientX - rect.left;
		const y = clientY - rect.top;
		const id = Date.now();

		ripples.value = [...ripples.value, { x, y, id }];

		// Clean up ripple after animation duration (600ms matches CSS)
		setTimeout(() => {
			ripples.value = ripples.value.filter((r) => r.id !== id);
		}, 600);
	};

	return { ripples, addRipple };
}
