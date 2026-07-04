import { useEffect, useRef } from 'preact/hooks';
import { useComputed, useSignal } from '@preact/signals';
import { IconPlayerPauseFilled, IconPlayerPlayFilled } from '@tabler/icons-preact';
import '../../styles/components/audio-player.css';

// #region Types
export interface AudioPlayerProps {
	/** Source URL of the audio file. */
	src: string;
	/** Optional precomputed normalized peaks (0–1). Decoded from `src` when omitted. */
	peaks?: number[];
	/** Optional known duration in seconds — skips waiting on loadedmetadata. */
	duration?: number;
	/** Number of waveform bars to render. @default 44 */
	bars?: number;
	className?: string;
}
// #endregion

// #region Constants & helpers
const DEFAULT_BARS = 44;
const SVG_HEIGHT = 32;
const BAR_WIDTH = 3;
const BAR_GAP = 2;

/** Formats seconds as `M:SS`. */
function formatDuration(seconds: number): string {
	if (!isFinite(seconds) || seconds < 0) seconds = 0;
	const m = Math.floor(seconds / 60);
	const s = Math.floor(seconds % 60);
	return `${m}:${s.toString().padStart(2, '0')}`;
}

/** A deterministic, natural-looking waveform used before/when decoding fails. */
function fallbackPeaks(bars: number): number[] {
	return Array.from(
		{ length: bars },
		(_, i) => 0.28 + 0.6 * Math.abs(Math.sin(i * 0.7)) * (0.55 + 0.45 * Math.cos(i * 0.29)),
	);
}
// #endregion

/**
 * @function AudioPlayer
 * @description A compact, pill-shaped audio player: a circular play/pause
 * control, an SVG waveform visualizer that fills the centre and doubles as a
 * seek bar, and a duration readout. Peaks are decoded from the source via the
 * Web Audio API (with a synthesized fallback when decoding is unavailable).
 */
export function AudioPlayer(
	{ src, peaks: peaksProp, duration: durationProp, bars = DEFAULT_BARS, className }:
		AudioPlayerProps,
) {
	const audioRef = useRef<HTMLAudioElement>(null);

	const isPlaying = useSignal(false);
	const currentTime = useSignal(0);
	const duration = useSignal(durationProp ?? 0);
	const peaks = useSignal<number[]>(peaksProp ?? []);

	const progress = useComputed(() => (duration.value > 0 ? currentTime.value / duration.value : 0));

	// Decode the waveform from the source when peaks aren't supplied.
	useEffect(() => {
		if (peaksProp && peaksProp.length) {
			peaks.value = peaksProp;
			return;
		}

		let cancelled = false;
		peaks.value = fallbackPeaks(bars);

		(async () => {
			try {
				const res = await fetch(src);
				const arrayBuffer = await res.arrayBuffer();
				// deno-lint-ignore no-explicit-any
				const Ctx = globalThis.AudioContext || (globalThis as any).webkitAudioContext;
				if (!Ctx) return;
				const ctx = new Ctx();
				const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
				const channel = audioBuffer.getChannelData(0);
				const block = Math.floor(channel.length / bars) || 1;

				const out: number[] = [];
				let max = 0;
				for (let i = 0; i < bars; i++) {
					const start = i * block;
					let sum = 0;
					for (let j = 0; j < block; j++) sum += Math.abs(channel[start + j] || 0);
					const v = sum / block;
					out.push(v);
					if (v > max) max = v;
				}
				ctx.close();

				if (!cancelled && max > 0) peaks.value = out.map((v) => Math.max(0.08, v / max));
			} catch {
				// Keep the synthesized fallback already assigned above.
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [src]);

	// #region Playback controls
	const togglePlay = () => {
		const el = audioRef.current;
		if (!el) return;
		if (isPlaying.value) el.pause();
		else el.play().catch(() => {});
	};

	const seekToClientX = (clientX: number, el: HTMLElement) => {
		const audio = audioRef.current;
		if (!audio || !duration.value) return;
		const rect = el.getBoundingClientRect();
		const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
		audio.currentTime = pct * duration.value;
		currentTime.value = audio.currentTime;
	};
	// #endregion

	const displayPeaks = peaks.value.length ? peaks.value : fallbackPeaks(bars);
	const viewWidth = displayPeaks.length * (BAR_WIDTH + BAR_GAP);
	const remaining = Math.max(0, duration.value - currentTime.value);

	return (
		<div className={['audio-player', className].filter(Boolean).join(' ')}>
			<button
				type='button'
				className='audio-player__toggle'
				aria-label={isPlaying.value ? 'Pause' : 'Play'}
				onClick={togglePlay}
			>
				{isPlaying.value ? <IconPlayerPauseFilled size={16} /> : <IconPlayerPlayFilled size={16} />}
			</button>

			<div
				className='audio-player__wave'
				role='slider'
				aria-label='Seek'
				aria-valuemin={0}
				aria-valuemax={100}
				aria-valuenow={Math.round(progress.value * 100)}
				onClick={(e) => seekToClientX(e.clientX, e.currentTarget as HTMLElement)}
			>
				<svg
					width='100%'
					height={SVG_HEIGHT}
					viewBox={`0 0 ${viewWidth} ${SVG_HEIGHT}`}
					preserveAspectRatio='none'
				>
					{displayPeaks.map((v, i) => {
						const h = Math.max(3, v * SVG_HEIGHT);
						const played = (i + 1) / displayPeaks.length <= progress.value;
						return (
							<rect
								key={i}
								className={`audio-player__bar ${played ? 'is-played' : ''}`}
								x={i * (BAR_WIDTH + BAR_GAP)}
								y={(SVG_HEIGHT - h) / 2}
								width={BAR_WIDTH}
								height={h}
								rx={BAR_WIDTH / 2}
							/>
						);
					})}
				</svg>
			</div>

			<span className='audio-player__time'>
				{formatDuration(currentTime.value > 0 ? remaining : duration.value)}
			</span>

			<audio
				ref={audioRef}
				src={src}
				preload='metadata'
				onLoadedMetadata={(e) => {
					const d = (e.currentTarget as HTMLAudioElement).duration;
					if (isFinite(d)) duration.value = d;
				}}
				onTimeUpdate={(
					e,
				) => (currentTime.value = (e.currentTarget as HTMLAudioElement).currentTime)}
				onPlay={() => (isPlaying.value = true)}
				onPause={() => (isPlaying.value = false)}
				onEnded={() => {
					isPlaying.value = false;
					currentTime.value = 0;
				}}
				hidden
			/>
		</div>
	);
}
