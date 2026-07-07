/**
 * @file SmartMedia.island.tsx
 * @island SmartMedia
 * @description Reusable image/video renderer that shows a BlurHash placeholder
 * immediately, then cross-fades to the real media once it loads. The hash is
 * decoded onto a `<canvas>` client-side (see
 * `@features/shared/utils/blurhash-decode.ts`); the encode side lives in
 * Rust/WASM at upload time (`apps/web/utils/processors/blurhash.ts`).
 *
 * Drop it anywhere a media URL + `blurhash` (from `files.items.metadata`) is
 * available. Degrades gracefully: no/invalid hash → just the media on a neutral
 * background.
 */

import '../styles/smart-media.css';
import { useSignal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
import { paintBlurhash } from '../utils/blurhash-decode.ts';

interface SmartMediaProps {
	/** Media URL (Supabase Storage public/signed URL). */
	src: string;
	/** BlurHash string, typically `files.items.metadata->>'blurhash'`. */
	blurhash?: string | null;
	/** `image` (default) or `video`. */
	kind?: 'image' | 'video';
	/** Alt text (images) / aria-label (videos). */
	alt?: string;
	/** Extra class on the wrapper. */
	class?: string;
	/** Intrinsic width/height — set an `aspect-ratio` to avoid layout shift. */
	width?: number;
	height?: number;
	/** `object-fit` for the media. Defaults to `cover`. */
	fit?: 'cover' | 'contain';
	/** Video attributes (ignored for images). */
	poster?: string;
	controls?: boolean;
	autoplay?: boolean;
	muted?: boolean;
	loop?: boolean;
}

/** Canvas decode resolution — small keeps the DCT cheap; CSS scales it up. */
const HASH_W = 32;
const HASH_H = 32;

export default function SmartMedia({
	src,
	blurhash,
	kind = 'image',
	alt = '',
	class: className = '',
	width,
	height,
	fit = 'cover',
	poster,
	controls = true,
	autoplay = false,
	muted = false,
	loop = false,
}: SmartMediaProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const loaded = useSignal(false);
	const hasPlaceholder = useSignal(false);

	// Paint the placeholder as soon as we hydrate (and whenever the hash changes).
	useEffect(() => {
		if (!blurhash || !canvasRef.current) return;
		hasPlaceholder.value = paintBlurhash(canvasRef.current, blurhash, HASH_W, HASH_H);
	}, [blurhash]);

	const aspectRatio = width && height ? `${width} / ${height}` : undefined;

	return (
		<div
			class={`smart-media${className ? ` ${className}` : ''}`}
			data-loaded={loaded.value ? 'true' : 'false'}
			style={{ aspectRatio }}
		>
			{blurhash && (
				<canvas
					ref={canvasRef}
					class='smart-media__placeholder'
					aria-hidden='true'
					data-visible={hasPlaceholder.value && !loaded.value ? 'true' : 'false'}
				/>
			)}

			{kind === 'video'
				? (
					<video
						class='smart-media__media'
						src={src}
						poster={poster}
						controls={controls}
						autoPlay={autoplay}
						muted={muted}
						loop={loop}
						playsInline
						aria-label={alt || undefined}
						style={{ objectFit: fit }}
						onLoadedData={() => (loaded.value = true)}
					/>
				)
				: (
					<img
						class='smart-media__media'
						src={src}
						alt={alt}
						loading='lazy'
						decoding='async'
						style={{ objectFit: fit }}
						onLoad={() => (loaded.value = true)}
						onError={() => (loaded.value = true)}
					/>
				)}
		</div>
	);
}
