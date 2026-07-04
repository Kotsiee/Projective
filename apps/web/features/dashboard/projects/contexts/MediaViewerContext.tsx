/**
 * @file MediaViewerContext.tsx
 * @description Context-driven, app-level media viewer. Any descendant can call
 * `useMediaViewer().open(media)` to launch the shared {@link MediaLightbox}
 * without each call-site owning modal state. Keeps a single lightbox instance
 * mounted at the provider root so chat attachments (and future surfaces) route
 * through one general-purpose viewer.
 */

import { ComponentChildren, createContext } from 'preact';
import { useContext, useMemo } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { type LightboxMedia, MediaLightbox } from '@projective/ui';

// #region Types
interface OpenOptions {
	/** Optional per-item delete handler wired into the lightbox's Delete action. */
	onDelete?: (media: LightboxMedia) => void;
	/** Optional handler for the "Jump to chat message" action (routes to the source message). */
	onJump?: (media: LightboxMedia) => void;
}

interface MediaViewerValue {
	open: (media: LightboxMedia, opts?: OpenOptions) => void;
	close: () => void;
}
// #endregion

const MediaViewerContext = createContext<MediaViewerValue | null>(null);

export function MediaViewerProvider({ children }: { children: ComponentChildren }) {
	const media = useSignal<LightboxMedia | null>(null);
	const isOpen = useSignal(false);
	const onDelete = useSignal<((media: LightboxMedia) => void) | null>(null);
	const onJump = useSignal<((media: LightboxMedia) => void) | null>(null);

	const value = useMemo<MediaViewerValue>(() => ({
		open: (m, opts) => {
			media.value = m;
			onDelete.value = opts?.onDelete ?? null;
			onJump.value = opts?.onJump ?? null;
			isOpen.value = true;
		},
		close: () => {
			isOpen.value = false;
		},
	}), []);

	return (
		<MediaViewerContext.Provider value={value}>
			{children}
			<MediaLightbox
				isOpen={isOpen.value}
				media={media.value}
				onClose={() => (isOpen.value = false)}
				onJump={onJump.value
					? (m) => {
						onJump.value?.(m);
						isOpen.value = false;
					}
					: undefined}
				onDelete={onDelete.value
					? (m) => {
						onDelete.value?.(m);
						isOpen.value = false;
					}
					: undefined}
			/>
		</MediaViewerContext.Provider>
	);
}

export function useMediaViewer(): MediaViewerValue {
	const ctx = useContext(MediaViewerContext);
	if (!ctx) throw new Error('useMediaViewer must be used within MediaViewerProvider');
	return ctx;
}
