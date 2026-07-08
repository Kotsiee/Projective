import { JSX } from 'preact';
import { AdornmentProps, ValueFieldProps } from '../core.ts';

/**
 * Visual treatments:
 *  - `default`  — surface pill for dense toolbars / the navbar.
 *  - `glass`    — frosted aurora-glass pill (floating over imagery).
 *  - `cinematic`— oversized hero search with an animated sheen + typewriter placeholder.
 */
export type SearchInputVariant = 'default' | 'glass' | 'cinematic';

export type SearchInputSize = 'md' | 'lg' | 'xl';

export interface SearchInputProps extends ValueFieldProps<string>, AdornmentProps {
	name?: string;
	variant?: SearchInputVariant;
	size?: SearchInputSize;

	/** Fired on Enter / submit with the current trimmed query. */
	onSearch?: (query: string) => void;
	/** Fired when the clear (×) affordance is used (value already reset to ''). */
	onClear?: () => void;
	/** Debounce (ms) applied to `onChange` for the live value. @default 0 (immediate) */
	debounceMs?: number;

	/** Leading icon override (defaults to a search glyph). */
	icon?: JSX.Element;
	/** Trailing content shown while the field is empty (e.g. a `⌘K` hint or submit button). */
	action?: JSX.Element;

	/** Rotating placeholder phrases cycled by a typewriter while idle (cinematic hero). */
	rotatingTerms?: string[];

	autoFocus?: boolean;
	/** Hide the clear affordance even when a value is present. */
	hideClear?: boolean;
	'aria-label'?: string;
}
