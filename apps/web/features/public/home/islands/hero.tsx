import '../styles/pages/home/home.css';
import { Button, RippleSurface } from '@projective/ui';
import { SearchInput } from '@projective/fields';
import {
	IconArrowRight,
	IconPlayerPlay,
	IconShieldCheck,
	IconStarFilled,
} from '@tabler/icons-preact';
import { useSignal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
import { HERO_ROTATING } from '../data/homeSeed.ts';

/* #region Interactive aurora canvas
   Soft drifting orbs that parallax to the pointer and pulse on click. Capped at a
   handful of particles, DPR-aware, paused when the tab is hidden, and reduced to a
   single static frame under prefers-reduced-motion. */
function AuroraCanvas() {
	const ref = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = ref.current;
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const reduce = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
		const isDark = () => document.documentElement.getAttribute('data-theme') !== 'light';

		const ORBS = [
			{ x: 0.18, y: 0.22, r: 0.42, hue: 186, depth: 0.05 },
			{ x: 0.82, y: 0.18, r: 0.38, hue: 258, depth: 0.09 },
			{ x: 0.5, y: 0.85, r: 0.5, hue: 160, depth: 0.04 },
			{ x: 0.68, y: 0.55, r: 0.3, hue: 168, depth: 0.12 },
		];

		let w = 0;
		let h = 0;
		let raf = 0;
		let t = 0;
		const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
		const pulses: { x: number; y: number; life: number }[] = [];

		const resize = () => {
			const dpr = Math.min(globalThis.devicePixelRatio || 1, 2);
			const rect = canvas.getBoundingClientRect();
			w = rect.width;
			h = rect.height;
			canvas.width = Math.max(1, Math.floor(w * dpr));
			canvas.height = Math.max(1, Math.floor(h * dpr));
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		};

		const draw = () => {
			t += 1;
			pointer.x += (pointer.tx - pointer.x) * 0.06;
			pointer.y += (pointer.ty - pointer.y) * 0.06;
			ctx.clearRect(0, 0, w, h);
			ctx.globalCompositeOperation = isDark() ? 'lighter' : 'source-over';
			const baseAlpha = isDark() ? 0.55 : 0.28;

			for (const o of ORBS) {
				const drift = reduce ? 0 : Math.sin(t * 0.004 + o.hue) * 0.02;
				const px = (o.x + (pointer.x - 0.5) * o.depth + drift) * w;
				const py = (o.y + (pointer.y - 0.5) * o.depth) * h;
				const radius = o.r * Math.min(w, h);
				const g = ctx.createRadialGradient(px, py, 0, px, py, radius);
				g.addColorStop(0, `hsla(${o.hue}, 82%, 58%, ${baseAlpha})`);
				g.addColorStop(1, `hsla(${o.hue}, 82%, 58%, 0)`);
				ctx.fillStyle = g;
				ctx.fillRect(0, 0, w, h);
			}

			for (let i = pulses.length - 1; i >= 0; i--) {
				const p = pulses[i];
				p.life -= 0.02;
				if (p.life <= 0) {
					pulses.splice(i, 1);
					continue;
				}
				const rad = (1 - p.life) * Math.min(w, h) * 0.4;
				const g = ctx.createRadialGradient(p.x, p.y, rad * 0.6, p.x, p.y, rad);
				g.addColorStop(0, 'hsla(186, 90%, 62%, 0)');
				g.addColorStop(0.8, `hsla(186, 90%, 62%, ${0.25 * p.life})`);
				g.addColorStop(1, 'hsla(186, 90%, 62%, 0)');
				ctx.fillStyle = g;
				ctx.fillRect(0, 0, w, h);
			}
		};

		// Controlled loop — only runs while the hero is on-screen and the tab is visible.
		let running = false;
		const loop = () => {
			draw();
			if (running) raf = requestAnimationFrame(loop);
		};
		const start = () => {
			if (running || reduce) return;
			running = true;
			raf = requestAnimationFrame(loop);
		};
		const stop = () => {
			running = false;
			cancelAnimationFrame(raf);
		};

		const onMove = (e: PointerEvent) => {
			const rect = canvas.getBoundingClientRect();
			pointer.tx = (e.clientX - rect.left) / rect.width;
			pointer.ty = (e.clientY - rect.top) / rect.height;
		};
		const onClick = (e: PointerEvent) => {
			const rect = canvas.getBoundingClientRect();
			pulses.push({ x: e.clientX - rect.left, y: e.clientY - rect.top, life: 1 });
			if (reduce) draw();
		};
		let onScreen = true;
		const onVisibility = () => {
			if (document.hidden) stop();
			else if (onScreen) start();
		};
		// Pause the loop entirely once the hero scrolls out of view.
		const io = new IntersectionObserver((entries) => {
			onScreen = entries[0]?.isIntersecting ?? true;
			if (onScreen && !document.hidden) start();
			else stop();
		}, { threshold: 0 });

		resize();
		draw(); // paint one static frame immediately
		start(); // begin the loop (no-op under reduced motion)
		io.observe(canvas);
		globalThis.addEventListener('resize', resize);
		globalThis.addEventListener('pointermove', onMove, { passive: true });
		canvas.parentElement?.addEventListener('pointerdown', onClick as EventListener);
		document.addEventListener('visibilitychange', onVisibility);

		return () => {
			stop();
			io.disconnect();
			globalThis.removeEventListener('resize', resize);
			globalThis.removeEventListener('pointermove', onMove);
			canvas.parentElement?.removeEventListener('pointerdown', onClick as EventListener);
			document.removeEventListener('visibilitychange', onVisibility);
		};
	}, []);

	return <canvas ref={ref} class='home-hero__canvas' aria-hidden='true' />;
}
/* #endregion */

/**
 * @island HomeHeroIsland
 * @description The landing hero — an atomic island that owns the animated backdrop, the staggered
 * headline reveal, the cinematic search, and the primary CTA into Explore. Interactivity is scoped
 * here; the rest of the page streams as lighter islands + static partials.
 */
export default function HomeHeroIsland() {
	const query = useSignal('');

	const submit = (q?: string) => {
		const term = (q ?? query.value).trim();
		globalThis.location.href = term ? `/explore?q=${encodeURIComponent(term)}` : '/explore';
	};

	return (
		<section class='home-hero' id='top'>
			<div class='home-hero__bg'>
				<AuroraCanvas />
				<div class='home-hero__grid' />
				<div class='home-hero__spotlight' />
			</div>

			<div class='home-hero__inner'>
				<span class='home-eyebrow home-hero__eyebrow'>
					<IconShieldCheck size={14} />
					Escrow-backed freelancing
				</span>

				<h1 class='home-hero__title'>
					<span class='home-hero__line'>Hire the best.</span>
					<span class='home-hero__line'>
						Ship in <em>stages</em>.
					</span>
					<span class='home-hero__line'>
						Pay with <em>confidence</em>.
					</span>
				</h1>

				<p class='home-hero__lede'>
					Projective is the stage-based marketplace where milestones are funded into escrow, work
					ships in reviewable stages, and payment releases only when you're satisfied.
				</p>

				<div class='home-hero__search'>
					<SearchInput
						variant='cinematic'
						size='xl'
						value={query}
						onSearch={submit}
						rotatingTerms={HERO_ROTATING}
						placeholder='Search services, talent, projects…'
						aria-label='Search the marketplace'
						action={<kbd class='home-hero__kbd'>↵</kbd>}
					/>
				</div>

				<div class='home-hero__ctas'>
					<Button
						variant='premium'
						size='large'
						rounded
						href='/explore'
						endIcon={<IconArrowRight size={18} />}
					>
						Explore the marketplace
					</Button>
					<RippleSurface as='a' href='#value' class='home-hero__ghost'>
						<IconPlayerPlay size={16} />
						See how it works
					</RippleSurface>
				</div>

				<div class='home-hero__trust'>
					<span class='home-hero__avatars' aria-hidden='true'>
						<span class='home-hero__avatar'>A</span>
						<span class='home-hero__avatar'>M</span>
						<span class='home-hero__avatar'>K</span>
						<span class='home-hero__avatar'>+</span>
					</span>
					<span class='home-hero__stars'>
						{[0, 1, 2, 3, 4].map((i) => <IconStarFilled key={i} size={14} />)}
					</span>
					<span>
						Trusted by <strong>12,000+ teams</strong> shipping with escrow
					</span>
				</div>
			</div>
		</section>
	);
}
