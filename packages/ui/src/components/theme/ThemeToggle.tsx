import '../../styles/components/theme-toggle.css';
import { IconMoonStars, IconSunHigh } from '@tabler/icons-preact';
import { theme, toggleTheme } from '../../ThemeSwitcher.ts';

export interface ThemeToggleProps {
	class?: string;
	className?: string;
	/** Compact rail (used in dense navbars). @default false */
	compact?: boolean;
}

/**
 * @function ThemeToggle
 * @description A premium light/dark switch wired to the shared {@link theme} signal. The thumb
 * glides on a spring curve; sun/moon glyphs cross-fade, and the track background morphs between a
 * daylight tint and a starfield. Reads `theme.value` so it re-renders reactively on any theme change
 * (including OS-driven ones) — safe to drop into any island.
 */
export function ThemeToggle(props: ThemeToggleProps) {
	const isDark = theme.value === 'dark';

	const classes = [
		'theme-toggle',
		isDark && 'theme-toggle--dark',
		props.compact && 'theme-toggle--compact',
		props.class,
		props.className,
	].filter(Boolean).join(' ');

	return (
		<button
			type='button'
			class={classes}
			role='switch'
			aria-checked={isDark}
			aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
			title='Toggle theme'
			onClick={() => toggleTheme()}
		>
			<span class='theme-toggle__track'>
				<span class='theme-toggle__stars' aria-hidden='true' />
				<span class='theme-toggle__thumb'>
					<IconSunHigh class='theme-toggle__glyph theme-toggle__glyph--sun' size={14} stroke={2} />
					<IconMoonStars
						class='theme-toggle__glyph theme-toggle__glyph--moon'
						size={13}
						stroke={2}
					/>
				</span>
			</span>
		</button>
	);
}

export default ThemeToggle;
