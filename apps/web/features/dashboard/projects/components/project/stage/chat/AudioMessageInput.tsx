import { useEffect, useRef } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { IconButton } from '@projective/ui';
import { IconPlayerPause, IconPlayerPlay } from '@tabler/icons-preact';

interface AudioMessageInputVisualizerProps {
	stream: MediaStream | null;
	audioBlob: Blob | null;
}

const MAX_PLAYBACK_BARS = 80;
const SVG_HEIGHT = 40;
const LIVE_BAR_WIDTH = 3;
const LIVE_BAR_GAP = 2;
const LIVE_STEP = LIVE_BAR_WIDTH + LIVE_BAR_GAP;

export default function AudioMessageInputVisualizer(
	{ stream, audioBlob }: AudioMessageInputVisualizerProps,
) {
	const containerRef = useRef<HTMLDivElement>(null);
	const audioRef = useRef<HTMLAudioElement>(null);

	const volumes = useSignal<number[]>([]);
	const playbackBars = useSignal<number[]>([]);
	const progress = useSignal<number>(0);
	const isPlaying = useSignal<boolean>(false);
	const hoverPercent = useSignal<number | null>(null);
	const containerWidth = useSignal<number>(300);

	const audioUrl = useSignal<string>('');

	// Setup ResizeObserver for dynamic width tracking
	useEffect(() => {
		if (!containerRef.current) return;
		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				containerWidth.value = entry.contentRect.width;
			}
		});
		observer.observe(containerRef.current);
		return () => observer.disconnect();
	}, []);

	// Handle Blob URL & Downsampling for Playback
	useEffect(() => {
		if (audioBlob) {
			const url = URL.createObjectURL(audioBlob);
			audioUrl.value = url;

			// Downsample the recorded volumes array to prevent rendering thousands of bars
			if (volumes.value.length > 0) {
				if (volumes.value.length <= MAX_PLAYBACK_BARS) {
					playbackBars.value = [...volumes.value];
				} else {
					const chunkSize = volumes.value.length / MAX_PLAYBACK_BARS;
					const downsampled = [];
					for (let i = 0; i < MAX_PLAYBACK_BARS; i++) {
						const start = Math.floor(i * chunkSize);
						const end = Math.floor((i + 1) * chunkSize) || start + 1;
						let sum = 0;
						for (let j = start; j < end; j++) {
							sum += volumes.value[j];
						}
						downsampled.push(sum / (end - start));
					}
					playbackBars.value = downsampled;
				}
			}

			return () => URL.revokeObjectURL(url);
		} else {
			audioUrl.value = '';
			playbackBars.value = [];
		}
	}, [audioBlob]);

	// Live Recording Analyser
	useEffect(() => {
		if (!stream) return;
		volumes.value = [];

		const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
		const source = audioCtx.createMediaStreamSource(stream);
		const analyser = audioCtx.createAnalyser();
		analyser.fftSize = 256;
		source.connect(analyser);

		const dataArray = new Uint8Array(analyser.frequencyBinCount);
		let animationFrameId: number;
		let lastUpdate = performance.now();

		const draw = () => {
			animationFrameId = requestAnimationFrame(draw);
			const now = performance.now();

			// Throttle slightly to get ~20 bars per second
			if (now - lastUpdate < 50) return;
			lastUpdate = now;

			analyser.getByteFrequencyData(dataArray);
			let sum = 0;
			for (let i = 0; i < dataArray.length; i++) {
				sum += dataArray[i];
			}
			const avg = sum / dataArray.length;
			const normalized = Math.min(1, avg / 128);

			volumes.value = [...volumes.value, normalized];
		};

		draw();

		return () => {
			cancelAnimationFrame(animationFrameId);
			audioCtx.close();
		};
	}, [stream]);

	// Playback Controls
	const togglePlay = () => {
		if (!audioRef.current) return;
		if (isPlaying.value) {
			audioRef.current.pause();
		} else {
			audioRef.current.play();
		}
	};

	const handleTimeUpdate = () => {
		if (!audioRef.current) return;
		progress.value = (audioRef.current.currentTime / audioRef.current.duration) || 0;
	};

	const handleEnded = () => {
		isPlaying.value = false;
		progress.value = 0;
	};

	const handleInteraction = (e: MouseEvent) => {
		if (!audioBlob || !containerRef.current || !audioRef.current) return;
		const rect = containerRef.current.getBoundingClientRect();
		const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
		const percent = x / rect.width;

		if (e.type === 'mousemove') {
			hoverPercent.value = percent;
		} else if (e.type === 'mouseleave') {
			hoverPercent.value = null;
		} else if (e.type === 'click' || e.type === 'mousedown') {
			audioRef.current.currentTime = percent * audioRef.current.duration;
			progress.value = percent;
			if (!isPlaying.value) {
				audioRef.current.play();
			}
		}
	};

	const isPlayback = !!audioBlob;

	// DOM Virtualization Logic
	let displayBars: number[] = [];
	let viewBoxX = 0;
	let startIndex = 0;

	if (isPlayback) {
		displayBars = playbackBars.value;
		viewBoxX = 0;
	} else {
		// Live mode: Only map and render the bars that are actually visible on screen
		const fullWidth = volumes.value.length * LIVE_STEP;
		viewBoxX = Math.max(0, fullWidth - containerWidth.value);
		startIndex = Math.max(0, Math.floor(viewBoxX / LIVE_STEP));
		const endIndex = startIndex + Math.ceil(containerWidth.value / LIVE_STEP) + 1;

		displayBars = volumes.value.slice(startIndex, endIndex);
	}

	return (
		<div class={`audio-message-input-visualizer ${isPlayback ? 'is-playback' : ''}`}>
			{isPlayback && (
				<IconButton
					aria-label='Play/Pause'
					variant='secondary'
					ghost={true}
					rounded
					onClick={togglePlay}
				>
					{isPlaying.value ? <IconPlayerPause size={18} /> : <IconPlayerPlay size={18} />}
				</IconButton>
			)}

			<div
				class='audio-message-input-visualizer__waveform'
				ref={containerRef}
				onMouseMove={isPlayback ? handleInteraction : undefined}
				onMouseLeave={isPlayback ? handleInteraction : undefined}
				onMouseDown={isPlayback ? handleInteraction : undefined}
				style={{ cursor: isPlayback ? 'pointer' : 'default' }}
			>
				<svg
					width='100%'
					height='100%'
					viewBox={`${viewBoxX} 0 ${containerWidth.value} ${SVG_HEIGHT}`}
				>
					{displayBars.map((vol, i) => {
						const barHeight = Math.max(4, vol * SVG_HEIGHT);

						// In live mode, calculate exact physical X coordinate. In playback, distribute evenly.
						const x = isPlayback
							? (i / displayBars.length) * containerWidth.value
							: (startIndex + i) * LIVE_STEP;

						const width = isPlayback
							? Math.max(1, (containerWidth.value / displayBars.length) - 1)
							: LIVE_BAR_WIDTH;

						let stateClass = 'bar-pending';
						if (isPlayback) {
							const barPercent = i / displayBars.length;
							if (barPercent <= progress.value) {
								stateClass = 'bar-played';
							} else if (hoverPercent.value !== null && barPercent <= hoverPercent.value) {
								stateClass = 'bar-hovered';
							}
						} else {
							stateClass = 'bar-live';
						}

						return (
							<rect
								key={isPlayback ? i : startIndex + i}
								class={`audio-bar ${stateClass}`}
								x={x}
								y={(SVG_HEIGHT - barHeight) / 2}
								width={width}
								height={barHeight}
								rx={width / 2}
							/>
						);
					})}
				</svg>
			</div>

			{isPlayback && (
				<audio
					ref={audioRef}
					src={audioUrl.value}
					onPlay={() => isPlaying.value = true}
					onPause={() => isPlaying.value = false}
					onTimeUpdate={handleTimeUpdate}
					onEnded={handleEnded}
					hidden
				/>
			)}
		</div>
	);
}
