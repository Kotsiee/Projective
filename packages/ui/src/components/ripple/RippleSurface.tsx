import { ComponentChildren, CSSProperties, JSX } from 'preact';
import '../../styles/components/ripple.css';
import { useRipple } from '../../hooks/useRipple.ts';

/* #region Types */
export type RippleTag = 'div' | 'a' | 'button' | 'span' | 'li' | 'article';

export interface RippleSurfaceProps {
	/** Element to render. Polymorphic so links, cards, and list rows can all ripple. @default 'div' */
	as?: RippleTag;
	href?: string;
	/** Adds the animated premium gradient border frame that lights up on hover. */
	premium?: boolean;
	/** Override the ripple ink colour (defaults to `currentColor`). */
	rippleColor?: string;
	class?: string;
	className?: string;
	style?: CSSProperties;
	children?: ComponentChildren;
	onClick?: (e: MouseEvent) => void;
	onPointerDown?: (e: PointerEvent) => void;
	// Escape hatch for arbitrary DOM attributes (aria-*, data-*, target, rel…).
	// deno-lint-ignore no-explicit-any
	[key: string]: any;
}
/* #endregion */

/**
 * @function RippleSurface
 * @description A polymorphic, tap-to-ripple surface built on the shared {@link useRipple} hook.
 * Wraps any element (link, card border, list row) so the platform's material-style ripple — plus an
 * optional premium gradient border — is available beyond the {@link Button}. The host is made
 * `position: relative; overflow: hidden` so ink never escapes the frame.
 */
export function RippleSurface(props: RippleSurfaceProps) {
	const {
		as = 'div',
		href,
		premium = false,
		rippleColor,
		class: klass,
		className,
		style,
		children,
		onPointerDown,
		...rest
	} = props;

	const { ripples, addRipple } = useRipple();

	const classes = [
		'ripple-surface',
		premium && 'ripple-surface--premium',
		klass,
		className,
	].filter(Boolean).join(' ');

	const handlePointerDown = (e: PointerEvent) => {
		addRipple(e as unknown as MouseEvent);
		onPointerDown?.(e);
	};

	const mergedStyle: CSSProperties = rippleColor
		? { ...(style ?? {}), ['--ripple-ink' as string]: rippleColor }
		: (style ?? {});

	const Tag = as as keyof JSX.IntrinsicElements;

	return (
		<Tag
			class={classes}
			href={href}
			style={mergedStyle}
			onPointerDown={handlePointerDown}
			{...rest}
		>
			{children}
			<span class='ripple-surface__layer' aria-hidden='true'>
				{ripples.value.map((r) => (
					<span key={r.id} class='ripple-surface__ink' style={{ left: r.x, top: r.y }} />
				))}
			</span>
		</Tag>
	);
}

export default RippleSurface;
