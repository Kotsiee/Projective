# Selected Codebase Context

> Included paths: ./packages/utils, ./packages/backend, ./packages/types

## Project Tree (Selected)

```text
./packages/utils/
  utils/
  deno.json
  mod.ts
  src/
  cookies.ts
  markdown/
  html-to-markdown.ts
  QuillParser.ts
  math/
  date-math.ts
  math.ts
  time-math.ts
  processors/
  mock-wasm.ts
  validation/
  auth.ts
  file-validation.ts
  formatters.ts
  validators.ts
./packages/backend/
  backend/
  deno.json
  mod.ts
  src/
  auth/
  jwt.ts
  tokens.ts
  config.ts
  cookies.ts
  core/
  clients/
  supabase.ts
  errors/
  normalise.ts
  http/
  result.ts
  validation/
  email.ts
  crypto.ts
  rateLimiter.ts
  types.ts
./packages/types/
  types/
  deno.json
  mod.ts
  src/
  auth/
  permissions.ts
  core/
  datetime.ts
  enums.ts
  files/
  categories.ts
  model.ts
  processing.ts
  finance/
  currency.ts
  projects/
  enums.ts
  index.ts
  stageTabs.ts
  ui/
  form.ts
  select.ts
  slider.ts
  text.ts
```

## File Contents

### File: packages\utils\deno.json

```json
{
  "name": "@projective/utils",
  "version": "0.0.0",
  "exports": "./mod.ts"
}

```

### File: packages\utils\mod.ts

```ts
export * from './src/math/math.ts';
export * from './src/math/date-math.ts';
export * from './src/math/time-math.ts';
export * from './src/processors/mock-wasm.ts';
export * from './src/QuillParser.ts';

```

### File: packages\utils\src\cookies.ts

```ts
export function getCsrfToken(name = 'pjv-csrf'): string | null {
	const cookie = typeof document !== 'undefined' ? document.cookie : '';
	if (!cookie) return null;

	const match = cookie.match(
		new RegExp('(?:^|; )' + name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') + '=([^;]*)'),
	);

	return match ? decodeURIComponent(match[1]) : null;
}

```

### File: packages\utils\src\markdown\html-to-markdown.ts

```ts
/**
 * html-to-markdown.ts
 * A lightweight, zero-dependency HTML to Markdown converter.
 * Replaces the need for 'turndown' by using native DOM traversal.
 */

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

export interface ConverterOptions {
	headingStyle?: 'atx' | 'setext'; // defaults to atx (#)
	bulletListMarker?: '-' | '*' | '+'; // defaults to -
	codeBlockStyle?: 'indented' | 'fenced'; // defaults to fenced (```)
	emDelimiter?: '_' | '*'; // defaults to *
	strongDelimiter?: '**' | '__'; // defaults to **
}

export class HtmlToMarkdownService {
	private options: ConverterOptions;

	constructor(options: ConverterOptions = {}) {
		this.options = {
			headingStyle: 'atx',
			bulletListMarker: '-',
			codeBlockStyle: 'fenced',
			emDelimiter: '*',
			strongDelimiter: '**',
			...options,
		};
	}

	/**
	 * Main entry point to convert HTML string to Markdown.
	 */
	public turndown(html: string): string {
		if (!html) return '';
		if (!isBrowser) {
			console.warn(
				'HtmlToMarkdownService requires a DOM environment (browser). Returning raw text.',
			);
			return html.replace(/<[^>]*>?/gm, ''); // Simple strip tags fallback for SSR
		}

		// Create a temporary container to parse the HTML
		const container = document.createElement('div');
		container.innerHTML = html;

		// Walk the tree
		const markdown = this.processNodes(container);

		// Clean up excessive newlines
		return markdown.trim().replace(/\n{3,}/g, '\n\n');
	}

	private processNodes(parent: Node): string {
		let output = '';
		for (let i = 0; i < parent.childNodes.length; i++) {
			output += this.processNode(parent.childNodes[i]);
		}
		return output;
	}

	private processNode(node: Node): string {
		// 1. Handle Text Nodes
		if (node.nodeType === Node.TEXT_NODE) {
			const text = node.textContent || '';
			// If it's pure whitespace and the parent is a block-level element, ignore it
			// to prevent weird spacing, unless it's inside a code block or pre.
			if (this.isBlock(node.parentNode) && text.trim().length === 0) {
				return '';
			}
			return this.escapeMarkdown(text);
		}

		// 2. Handle Element Nodes
		if (node.nodeType === Node.ELEMENT_NODE) {
			const el = node as HTMLElement;
			const tagName = el.tagName.toLowerCase();
			const content = this.processNodes(el);

			switch (tagName) {
				// --- Headings ---
				case 'h1':
					return `\n# ${content}\n\n`;
				case 'h2':
					return `\n## ${content}\n\n`;
				case 'h3':
					return `\n### ${content}\n\n`;
				case 'h4':
					return `\n#### ${content}\n\n`;
				case 'h5':
					return `\n##### ${content}\n\n`;
				case 'h6':
					return `\n###### ${content}\n\n`;

				// --- Paragraphs & Layout ---
				case 'p':
				case 'div':
					// If div contains only block elements, don't add extra newlines
					// But usually for text editors, div/p implies a break.
					return `\n${content.trim()}\n\n`;
				case 'br':
					return '  \n'; // Markdown line break (2 spaces + newline)
				case 'hr':
					return '\n---\n\n';

				// --- Formatting ---
				case 'strong':
				case 'b':
					if (!content.trim()) return '';
					return `${this.options.strongDelimiter}${content}${this.options.strongDelimiter}`;

				case 'em':
				case 'i':
					if (!content.trim()) return '';
					return `${this.options.emDelimiter}${content}${this.options.emDelimiter}`;

				case 's':
				case 'del':
				case 'strike':
					if (!content.trim()) return '';
					return `~~${content}~~`;

				case 'u':
					// Custom rule from your previous file: underline -> ~text~
					if (!content.trim()) return '';
					return `~${content}~`;

				// --- Lists ---
				case 'ul':
				case 'ol':
					return `\n${this.processList(el)}\n`;

				case 'li':
					// Handled by processList usually, but if encountered standalone:
					return `- ${content}\n`;

				// --- Code ---
				case 'code':
					// If parent is PRE, it's handled in the PRE case (Fenced block)
					if (el.parentElement && el.parentElement.tagName === 'PRE') {
						return content;
					}
					// Inline code
					return '`' + content + '`';

				case 'pre':
					// Check for language class usually found in Quill (e.g., "ql-syntax" or "language-js")
					// We just treat it as a fenced block.
					// We also strip the trailing newline that usually comes from the inner code logic.
					return `\n\`\`\`\n${content.replace(/\n$/, '')}\n\`\`\`\n\n`;

				case 'blockquote':
					// Split lines and prepend >
					return `\n${content.trim().split('\n').map((l) => `> ${l}`).join('\n')}\n\n`;

				// --- Links & Images ---
				case 'a': {
					const href = el.getAttribute('href');
					if (!href) return content;
					return `[${content}](${href})`;
				}
				case 'img': {
					const src = el.getAttribute('src');
					const alt = el.getAttribute('alt') || '';
					if (!src) return '';
					return `![${alt}](${src})`;
				}

				// --- Tables (Basic support) ---
				// Quill/Standard HTML tables to Markdown is complex,
				// but this covers basic rows/cells.
				case 'tr':
					return `| ${content} |\n`;
				case 'td':
				case 'th':
					return `${content} |`;
				case 'tbody':
				case 'thead':
				case 'table':
					return content; // Pass through, TRs handle the newlines

				default:
					return content;
			}
		}

		return '';
	}

	/**
	 * Specialized list handler to manage indentation and counters.
	 */
	private processList(listEl: HTMLElement, depth: number = 0): string {
		const tagName = listEl.tagName.toLowerCase();
		let output = '';
		let index = 1;

		for (let i = 0; i < listEl.childNodes.length; i++) {
			const node = listEl.childNodes[i];
			if (node.nodeType === Node.ELEMENT_NODE && node.nodeName === 'LI') {
				const li = node as HTMLElement;

				// Determine marker
				const indent = '  '.repeat(depth);
				const marker = tagName === 'ol' ? `${index}.` : this.options.bulletListMarker;

				// Process LI content.
				// Crucial: We need to handle nested lists inside LI differently.
				let liContent = '';

				// We manually walk children of LI to handle nested lists cleanly
				for (let j = 0; j < li.childNodes.length; j++) {
					const child = li.childNodes[j];
					if (child.nodeName === 'UL' || child.nodeName === 'OL') {
						// Nested List: recursively call processList with depth + 1
						liContent += '\n' + this.processList(child as HTMLElement, depth + 1);
					} else {
						liContent += this.processNode(child);
					}
				}

				output += `${indent}${marker} ${liContent.trim()}\n`;
				index++;
			}
		}
		return output;
	}

	private isBlock(node: Node | null): boolean {
		if (!node) return false;
		const blockTags = [
			'div',
			'p',
			'h1',
			'h2',
			'h3',
			'h4',
			'h5',
			'h6',
			'ul',
			'ol',
			'li',
			'blockquote',
			'pre',
			'hr',
			'table',
		];
		return node.nodeType === Node.ELEMENT_NODE && blockTags.includes(node.nodeName.toLowerCase());
	}

	/**
	 * Escape special Markdown characters to prevent accidental formatting.
	 */
	private escapeMarkdown(text: string): string {
		// Escaping backticks, asterisks, underscores, etc.
		// Simple implementation:
		return text
			.replace(/([\\`*_{}[\]()#+\-.!])/g, '\\$1');
	}
}

```

### File: packages\utils\src\markdown\QuillParser.ts

```ts
import type QuillType from 'quill';
import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html';
import { marked } from 'marked';
import { ConverterOptions, HtmlToMarkdownService } from './html-to-markdown.ts';

export type QuillDelta = { ops: Array<{ insert: string | object; attributes?: object }> };
const hasDOM = typeof window !== 'undefined' && typeof document !== 'undefined';

// #region Type definitions

/**
 * Options controlling Markdown→HTML/Delta parsing and Quill instantiation.
 */
export interface MarkdownParserOptions {
	// Updated type to match the new service options
	turndown?: ConverterOptions;
	quillModules?: any;
	quillTheme?: string | null;
}

// #endregion

/**
 * Lightweight Markdown/HTML/Delta converter using off-DOM Quill for Delta I/O.
 * This avoids rendering overhead while still using Quill’s clipboard parsing.
 */
export class MarkdownParser {
	private quill?: QuillType;
	// Updated property type
	private turndown: HtmlToMarkdownService;
	private quillContainer?: HTMLDivElement;
	private opts: MarkdownParserOptions;

	constructor(opts: MarkdownParserOptions = {}) {
		this.opts = opts;

		// Initialize the custom HtmlToMarkdownService.
		// The service defaults to GitHub-like Markdown (fenced codes, atx headings),
		// so we explicitly pass your preferences here to ensure consistency.
		this.turndown = new HtmlToMarkdownService({
			headingStyle: 'atx',
			bulletListMarker: '-',
			codeBlockStyle: 'fenced',
			emDelimiter: '*',
			strongDelimiter: '**',
			...opts.turndown,
		});

		// NOTE: Previous 'addRule' calls for code blocks, strikethrough (~~),
		// and underline (~) have been removed because HtmlToMarkdownService
		// includes this logic natively.
	}

	/**
	 * Lazily initialises a hidden Quill instance for Delta conversions.
	 * @remarks Runs only in browser environments; skipped server-side.
	 */
	private async initQuill(): Promise<void> {
		if (this.quill || !hasDOM) return;

		// eslint-disable-next-line @typescript-eslint/naming-convention
		const { default: Quill } = await import('quill');
		const container = document.createElement('div');
		container.style.position = 'fixed';
		container.style.left = '-99999px';
		container.style.top = '-99999px';
		document.body.appendChild(container);

		this.quillContainer = container;
		this.quill = new Quill(container, {
			theme: this.opts.quillTheme ?? undefined,
			modules: this.opts.quillModules ?? { clipboard: true, toolbar: false },
		});
	}

	/**
	 * Converts HTML into Markdown using the configured service.
	 * Ignores `null`/empty input by treating it as an empty string.
	 */
	htmlToMarkdown(html: string): string {
		return this.turndown.turndown(html || '');
	}

	/**
	 * Converts Markdown into HTML using `marked`.
	 * @remarks Produces simple HTML without sanitisation.
	 */
	markdownToHtml(markdown: string): string {
		return (marked.parse(markdown || '') as string) ?? '';
	}

	/**
	 * Converts a Quill Delta into Markdown by first producing HTML.
	 * Handles both array-form and `{ ops: [] }` Delta shapes.
	 */
	deltaToMarkdown(delta: QuillDelta): string {
		const ops = Array.isArray(delta) ? delta : (delta?.ops ?? []);
		const converter = new QuillDeltaToHtmlConverter(ops, { multiLineBlockquote: true });
		const html = converter.convert();
		return this.htmlToMarkdown(html);
	}

	/**
	 * Converts Markdown into a Quill Delta using the off-DOM Quill clipboard.
	 * @throws If called outside a browser environment.
	 */
	async markdownToDelta(markdown: string): Promise<QuillDelta> {
		await this.initQuill();
		if (!this.quill) {
			throw new Error('markdownToDelta requires a browser environment.');
		}
		const html = this.markdownToHtml(markdown);
		return this.quill.clipboard.convert({ html });
	}

	/**
	 * Converts HTML into a Quill Delta using Quill’s clipboard parser.
	 * @throws If called outside a browser environment.
	 */
	async htmlToDelta(html: string): Promise<QuillDelta> {
		await this.initQuill();
		if (!this.quill) {
			throw new Error('htmlToDelta requires a browser environment.');
		}
		return this.quill.clipboard.convert({ html: html || '' });
	}

	/**
	 * Converts a Delta into raw HTML using the converter library.
	 * Useful when Quill is unavailable or rendering must be off-DOM.
	 */
	deltaToHtml(delta: QuillDelta): string {
		const ops = Array.isArray(delta) ? delta : (delta?.ops ?? []);
		const converter = new QuillDeltaToHtmlConverter(ops, { multiLineBlockquote: true });
		return converter.convert();
	}

	/**
	 * Cleans up the hidden Quill instance and DOM container.
	 * @remarks Safe to call multiple times; idempotent.
	 */
	dispose() {
		if (this.quillContainer?.parentNode) {
			this.quillContainer.parentNode.removeChild(this.quillContainer);
		}
		this.quill = undefined;
		this.quillContainer = undefined;
	}
}

// #region Public API

/**
 * Attempts to infer whether input is HTML or a Delta and convert it to Markdown.
 * @remarks
 * - Arrays or `{ ops: [] }` are treated as Deltas.
 * - Strings are treated as HTML.
 * - Unknown types are stringified.
 * - Returns empty string on failure.
 */
export function anyQuillToMarkdown(input: unknown): string {
	try {
		if (typeof input === 'string') {
			return new MarkdownParser().htmlToMarkdown(input);
		}

		const maybe = input as any;
		if (maybe && (Array.isArray(maybe) || Array.isArray(maybe?.ops))) {
			return new MarkdownParser().deltaToMarkdown(maybe);
		}
		return String(input ?? '');
	} catch {
		return '';
	}
}

/**
 * Converts Markdown into a Quill Delta.
 * @returns A Promise resolving to a Delta object.
 * @remarks Wrapper used for convenience when callers don’t need a full parser instance.
 */
export function markdownToQuillDelta(md: string): QuillDelta | Promise<QuillDelta> {
	return new MarkdownParser().markdownToDelta(md);
}

export function deltaToPlainText(delta: QuillDelta): string {
	const ops = Array.isArray(delta) ? delta : (delta?.ops ?? []);

	return ops
		.map((op) => {
			if (typeof op.insert === 'string') {
				return op.insert;
			}
			return '';
		})
		.join('');
}

// #endregion

```

### File: packages\utils\src\math\date-math.ts

```ts
import { DateTime } from '@projective/types';
import { DateValue } from '../../../fields/src/types/components/date-field.ts';

export interface CalendarDay {
	date: DateTime;
	isCurrentMonth: boolean;
	isToday: boolean;
	isDisabled: boolean;
	isSelected: boolean;
	isRangeStart: boolean;
	isRangeEnd: boolean;
	isRangeMiddle: boolean;
}

export function getCalendarGrid(
	viewDate: DateTime,
	value?: DateValue,
	hoverDate?: DateTime | null,
	min?: DateTime,
	max?: DateTime,
	startOfWeek: 0 | 1 = 1,
): CalendarDay[] {
	const days: CalendarDay[] = [];
	const today = DateTime.today();

	let start: DateTime | null = null;
	let end: DateTime | null = null;
	let multiDates: DateTime[] = [];
	let mode: 'single' | 'range' | 'multiple' = 'single';

	if (Array.isArray(value)) {
		if (
			value.length === 2 && (value[0] === null || value[0] instanceof DateTime) &&
			(value[1] === null || value[1] instanceof DateTime)
		) {
			start = value[0] as DateTime | null;
			end = value[1] as DateTime | null;
			mode = 'range';
		} else {
			multiDates = value as DateTime[];
			mode = 'multiple';
		}
	} else if (value) {
		start = value as DateTime;
		end = value as DateTime; // For single, start=end for logic simplification
		mode = 'single';
	}

	// Ghost Range Logic
	if (mode === 'range' && start && !end && hoverDate) {
		if (hoverDate.isAfter(start)) {
			end = hoverDate;
		} else {
			end = start;
			start = hoverDate;
		}
	}

	const startOfMonth = viewDate.startOf('month');
	const currentDayOfWeek = startOfMonth.getDay();
	const daysToSubtract = (currentDayOfWeek - startOfWeek + 7) % 7;
	let currentIter = startOfMonth.minus(daysToSubtract, 'days');

	for (let i = 0; i < 42; i++) {
		const isCurrentMonth = currentIter.getMonth() === viewDate.getMonth();

		let isDisabled = false;
		if (min && currentIter.isBefore(min.startOf('day'))) isDisabled = true;
		if (max && currentIter.isAfter(max.endOf('day'))) isDisabled = true;

		let isSelected = false;
		let isRangeStart = false;
		let isRangeEnd = false;
		let isRangeMiddle = false;

		if (mode === 'multiple') {
			// FIX: Use isSameDay
			isSelected = multiDates.some((d) => currentIter.isSameDay(d));
		} else {
			isRangeStart = !!start && currentIter.isSameDay(start);
			isRangeEnd = !!end && currentIter.isSameDay(end);

			if (mode === 'single') {
				isSelected = isRangeStart;
			} else {
				if (start && end) {
					isRangeMiddle = currentIter.isAfter(start) && currentIter.isBefore(end);
				}
				isSelected = isRangeStart || isRangeEnd;
			}
		}

		days.push({
			date: currentIter,
			isCurrentMonth,
			isToday: currentIter.isSameDay(today),
			isDisabled,
			isSelected,
			isRangeStart,
			isRangeEnd,
			isRangeMiddle,
		});

		currentIter = currentIter.add(1, 'days');
	}

	return days;
}

export function getWeekdayLabels(startOfWeek: 0 | 1 = 1): string[] {
	const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	if (startOfWeek === 1) {
		const sun = labels.shift();
		if (sun) labels.push(sun);
	}
	return labels;
}

```

### File: packages\utils\src\math\math.ts

```ts
export function clamp(val: number, min: number, max: number): number {
	return Math.min(Math.max(val, min), max);
}

export function roundToStep(val: number, step: number): number {
	if (step <= 0) return val;
	const inverse = 1 / step;
	return Math.round(val * inverse) / inverse;
}

export function snapToClosest(val: number, points: number[]): number {
	if (!points.length) return val;
	return points.reduce((prev, curr) => Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev);
}

// --- Linear Scale ---

export function valueToPercent(val: number, min: number, max: number): number {
	if (max === min) return 0;
	const pct = ((val - min) / (max - min)) * 100;
	return clamp(pct, 0, 100);
}

export function percentToValue(percent: number, min: number, max: number): number {
	const val = min + (percent / 100) * (max - min);
	return clamp(val, min, max);
}

// --- Logarithmic Scale ---

export function valueToPercentLog(val: number, min: number, max: number): number {
	// Log scale cannot handle <= 0. Clamp to 1 if needed or handle logic higher up.
	const safeMin = min <= 0 ? 1 : min;
	const safeVal = val <= safeMin ? safeMin : val;

	const minLog = Math.log(safeMin);
	const maxLog = Math.log(max);
	const valLog = Math.log(safeVal);

	const pct = ((valLog - minLog) / (maxLog - minLog)) * 100;
	return clamp(pct, 0, 100);
}

export function percentToValueLog(percent: number, min: number, max: number): number {
	const safeMin = min <= 0 ? 1 : min;
	const minLog = Math.log(safeMin);
	const maxLog = Math.log(max);

	const scale = (maxLog - minLog) / 100;
	const val = Math.exp(minLog + scale * percent);
	return clamp(val, safeMin, max);
}

```

### File: packages\utils\src\math\time-math.ts

```ts
/**
 * Converts polar coordinates (angle) to clock values.
 * * @param x Pointer X relative to center
 * @param y Pointer Y relative to center
 * @param steps Total steps (12 for hours, 60 for minutes)
 */
export function getAngleValue(x: number, y: number, steps: number): number {
	// 1. Calculate angle in degrees (0 = 12 o'clock / top)
	// Math.atan2(y, x) returns angle from X-axis.
	// We offset by -90deg (PI/2) to make Top 0deg.
	let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;

	// Normalize negative angles (0 to 360)
	if (angle < 0) angle += 360;

	// 2. Snap to step
	const stepDeg = 360 / steps;
	const snappedAngle = Math.round(angle / stepDeg) * stepDeg;

	// 3. Convert to value
	let value = Math.round(snappedAngle / stepDeg);

	// Handle wrap-around (0 is usually max value in clocks, e.g. 60 min or 12 hours)
	if (value === 0) value = steps;

	return value;
}

/**
 * Get coordinates for a number on the clock face.
 */
export function getPosition(value: number, steps: number, radius: number) {
	const angle = (value * (360 / steps) - 90) * (Math.PI / 180);
	return {
		x: Math.cos(angle) * radius,
		y: Math.sin(angle) * radius,
	};
}

```

### File: packages\utils\src\processors\mock-wasm.ts

```ts
import { FileProcessor } from '../../types/src/files/processing.ts';

/**
 * Simulates a WASM Image Optimizer.
 * It "shrinks" the file size and changes extension to .webp after 2 seconds.
 */
export const MockImageOptimizer: FileProcessor = {
	id: 'mock-wasm-optimizer',
	name: 'WASM Optimizer',

	match: (file) => file.type.startsWith('image/') && !file.type.includes('webp'),

	process: async (file, onProgress) => {
		return new Promise((resolve) => {
			let progress = 0;

			// Simulate work ticks
			const interval = setInterval(() => {
				progress += 10;
				onProgress?.(progress);

				if (progress >= 100) {
					clearInterval(interval);

					// Create a fake "Optimized" file
					// In real Rust WASM, you'd return the actual Blob here
					const newBlob = new Blob([file], { type: 'image/webp' });
					const newFile = new File([newBlob], file.name.replace(/\.[^/.]+$/, '') + '.webp', {
						type: 'image/webp',
						lastModified: Date.now(),
					});

					resolve({
						file: newFile,
						metadata: { optimization: 'Saved 40%' },
					});
				}
			}, 200); // 2 seconds total
		});
	},
};

```

### File: packages\utils\src\validation\auth.ts

```ts
import { escape } from '@std/regexp/escape';

export type RegisterFields = {
	email: string;
	password: string;
	confirmPassword: string;
};

export type RegisterErrors = {
	email?: string;
	password?: string;
	confirmPassword?: string;
};

export class AuthValidator {
	static validateEmail(email: string): string | null {
		const trimmed = email.trim();
		if (!trimmed) return 'Email is required.';
		const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailPattern.test(trimmed)) return 'Enter a valid email address.';
		return null;
	}

	static validatePassword(password: string, email?: string): string | null {
		if (!password) {
			return 'Password is required.';
		}

		if (password.length < 8) {
			return 'Password must be at least 8 characters long.';
		}

		if (!/[a-z]/.test(password)) {
			return 'Password must contain at least one lowercase letter.';
		}

		if (!/[A-Z]/.test(password)) {
			return 'Password must contain at least one uppercase letter.';
		}

		if (!/[0-9]/.test(password)) {
			return 'Password must contain at least one digit.';
		}

		if (!/[^A-Za-z0-9]/.test(password)) {
			return 'Password must contain at least one symbol.';
		}

		if (/\s/.test(password)) {
			return 'Password must not contain spaces.';
		}

		if (email) {
			const trimmedEmail = email.trim();
			if (trimmedEmail) {
				const escapedEmail = escape(trimmedEmail);
				const emailInPassword = new RegExp(escapedEmail, 'i');

				if (emailInPassword.test(password)) {
					return 'Password must not contain your email.';
				}
			}
		}

		return null;
	}

	static validateConfirmPassword(
		password: string,
		confirmPassword: string,
	): string | null {
		if (!confirmPassword) {
			return 'Please confirm your password.';
		}

		if (password !== confirmPassword) {
			return 'Passwords do not match.';
		}

		return null;
	}

	static validate(
		fields: RegisterFields,
	): { ok: boolean; errors: RegisterErrors } {
		const errors: RegisterErrors = {};

		const emailError = this.validateEmail(fields.email);
		if (emailError) errors.email = emailError;

		const passwordError = this.validatePassword(
			fields.password,
			fields.email,
		);
		if (passwordError) errors.password = passwordError;

		const confirmError = this.validateConfirmPassword(
			fields.password,
			fields.confirmPassword,
		);
		if (confirmError) errors.confirmPassword = confirmError;

		const ok = Object.keys(errors).length === 0;

		return { ok, errors };
	}
}

```

### File: packages\utils\src\validation\file-validation.ts

```ts
import { FileError } from '@projective/types';

/**
 * Validates a single file against size and type constraints.
 */
export function validateFile(
	file: File,
	accept?: string,
	maxSize?: number,
): FileError[] {
	const errors: FileError[] = [];

	// 1. Size Check
	if (maxSize && file.size > maxSize) {
		errors.push({
			code: 'file-too-large',
			message: `File is larger than ${formatBytes(maxSize)}`,
		});
	}

	// 2. Type Check (Simplified Accept logic)
	if (accept) {
		const acceptedTypes = accept.split(',').map((t) => t.trim());
		const fileType = file.type;
		const fileName = file.name.toLowerCase();

		const isValid = acceptedTypes.some((type) => {
			// MIME (image/*)
			if (type.endsWith('/*')) {
				const baseType = type.split('/')[0];
				return fileType.startsWith(baseType + '/');
			}
			// Exact MIME (image/png)
			if (type.includes('/')) {
				return fileType === type;
			}
			// Extension (.pdf)
			if (type.startsWith('.')) {
				return fileName.endsWith(type.toLowerCase());
			}
			return false;
		});

		if (!isValid) {
			errors.push({
				code: 'file-invalid-type',
				message: `File type not accepted`,
			});
		}
	}

	return errors;
}

export function formatBytes(bytes: number, decimals = 2) {
	if (bytes === 0) return '0 Bytes';
	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

```

### File: packages\utils\src\validation\formatters.ts

```ts
/**
 * Formats a number string into a currency string.
 * e.g. "1234.5" -> "$1,234.50"
 */
export function formatCurrency(value: string | number, currency = 'USD'): string {
	if (value === '' || value === null || value === undefined) return '';

	const num = typeof value === 'string' ? parseFloat(value) : value;
	if (isNaN(num)) return '';

	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: currency,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(num);
}

/**
 * Strips formatting characters to return a raw number string.
 * e.g. "$1,234.50" -> "1234.5"
 */
export function parseNumber(value: string): string {
	return value.replace(/[^0-9.]/g, '');
}

```

### File: packages\utils\src\validation\validators.ts

```ts
/**
 * Validates a credit card number using the Luhn Algorithm.
 * Returns true if valid.
 */
export function isValidCreditCard(value: string): boolean {
	// Remove spaces/dashes
	const digits = value.replace(/\D/g, '');

	if (digits.length < 13 || digits.length > 19) return false;

	let sum = 0;
	let shouldDouble = false;

	// Loop backwards
	for (let i = digits.length - 1; i >= 0; i--) {
		let digit = parseInt(digits.charAt(i));

		if (shouldDouble) {
			if ((digit *= 2) > 9) digit -= 9;
		}

		sum += digit;
		shouldDouble = !shouldDouble;
	}

	return sum % 10 === 0;
}

```

### File: packages\backend\deno.json

```json
{
  "name": "@projective/backend",
  "version": "0.0.0",
  "exports": "./mod.ts",
  "compilerOptions": {
    "lib": ["deno.ns", "dom"]
  }
}

```

### File: packages\backend\mod.ts

```ts
import { loadSync } from '@std/dotenv';

loadSync({ export: true });

export * from './src/config.ts';
export * from './src/cookies.ts';
export * from './src/rateLimiter.ts';
export * from './src/crypto.ts';
export * from './src/types.ts';

export * from './src/auth/jwt.ts';
export * from './src/auth/tokens.ts';

export * from './src/core/http/result.ts';
export * from './src/core/errors/normalise.ts';
export * from './src/core/clients/supabase.ts';
export * from './src/core/validation/email.ts';

```

### File: packages\backend\src\auth\jwt.ts

```ts
import { Config } from '../config.ts';

// packages/server-utils/jwt.ts
let _jwtKey: CryptoKey | null = null;

export async function getJwtKey(): Promise<CryptoKey> {
	if (_jwtKey) return _jwtKey;

	// ENV.JWT_SECRET is a string. We have to turn it into bytes for importKey.
	const raw = new TextEncoder().encode(Config.JWT_SECRET);

	_jwtKey = await crypto.subtle.importKey(
		'raw',
		raw,
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign', 'verify'],
	);

	return _jwtKey;
}

```

### File: packages\backend\src\auth\tokens.ts

```ts
import { create } from 'djwt';
import { hashArgon2id, randomTokenString } from '../crypto.ts';
import { getJwtKey } from './jwt.ts'; // <-- new

const ACCESS_TTL_SECONDS = 15 * 60; // 15 minutes
const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 30; // ~30 days

export type SessionClaims = {
	userId: string;
	activeProfileType: 'freelancer' | 'business' | null;
	activeProfileId: string | null;
	activeTeamId: string | null;
};

export async function mintAccessToken(claims: SessionClaims) {
	const exp = Math.floor(Date.now() / 1000) + ACCESS_TTL_SECONDS;

	const payload = {
		sub: claims.userId,
		active_profile_type: claims.activeProfileType,
		active_profile_id: claims.activeProfileId,
		active_team_id: claims.activeTeamId,
		exp,
	};

	const key = await getJwtKey();

	const token = await create(
		{ alg: 'HS256', typ: 'JWT' },
		payload,
		key,
	);

	return { token, exp };
}

/**
 * Creates a new refresh token (opaque random string),
 * hashes it, and returns both the plaintext token (for cookie)
 * and the hash (for DB storage).
 */
export async function mintRefreshToken() {
	const plaintext = randomTokenString(32);
	const hash = await hashArgon2id(plaintext);
	const exp = Math.floor(Date.now() / 1000) + REFRESH_TTL_SECONDS;
	return { plaintext, hash, exp };
}

export function buildAccessCookie(accessToken: string, maxAgeSeconds = ACCESS_TTL_SECONDS) {
	return [
		'access_token=',
		accessToken,
		'; HttpOnly',
		'; Secure',
		'; SameSite=Lax',
		`; Max-Age=${maxAgeSeconds}`,
		'; Path=/',
	].join('');
}

export function buildRefreshCookie(refreshToken: string) {
	return [
		'refresh_token=',
		refreshToken,
		'; HttpOnly',
		'; Secure',
		'; SameSite=Lax',
		'; Path=/api/v1/auth',
	].join('');
}

```

### File: packages\backend\src\config.ts

```ts
import { loadSync } from '@std/dotenv';

loadSync({ export: true });

const mode = Deno.env.get('MODE') ?? 'development';

loadSync({ envPath: `.env.${mode}`, export: true });

function requireEnv(name: string): string {
	const value = Deno.env.get(name);
	if (!value) {
		console.error(`Missing required env var: ${name}`);
		if (Deno.env.get('DENO_DEPLOYMENT_ID')) return '';
		throw new Error(`Missing env: ${name}`);
	}
	return value;
}

export const Config = {
	SUPABASE_URL: requireEnv('SUPABASE_URL'),
	SUPABASE_ANON_KEY: requireEnv('SUPABASE_ANON_KEY'),
	SUPABASE_SERVICE_ROLE_KEY: requireEnv('SB_SERVICE_ROLE_KEY'),
	JWT_SECRET: requireEnv('JWT_SECRET'),
	APP_ENV: Deno.env.get('APP_ENV') ?? 'development',
	BASE_URL: Deno.env.get('URL'),
};

```

### File: packages\backend\src\cookies.ts

```ts
import { type Cookie, deleteCookie, getCookies, setCookie } from '@std/http/cookie';

type SetAuthOpts = {
	accessToken: string;
	refreshToken: string;
	requestUrl: URL;
};

/** Local dev can’t use __Host-* (requires secure + no Domain + Path=/ on HTTPS). */
function resolveCookieNames(isSecureOrigin: boolean, isLocalhost: boolean) {
	if (isSecureOrigin && !isLocalhost) {
		return { ACCESS_NAME: '__Host-pjv-at', REFRESH_NAME: '__Host-pjv-rt' };
	}
	return { ACCESS_NAME: 'pjv-at', REFRESH_NAME: 'pjv-rt' };
}

function isLocalhostHost(hostname: string) {
	return (
		hostname === 'localhost' ||
		hostname === '127.0.0.1' ||
		hostname === '[::1]' ||
		/\.local(domain)?$/i.test(hostname)
	);
}

export function setAuthCookies(
	headers: Headers,
	{ accessToken, refreshToken, requestUrl }: SetAuthOpts,
) {
	const isSecureOrigin = requestUrl.protocol === 'https:';
	const isLocal = isLocalhostHost(requestUrl.hostname);
	const { ACCESS_NAME, REFRESH_NAME } = resolveCookieNames(isSecureOrigin, isLocal);

	// Common attributes for auth cookies
	const common: Partial<Cookie> = {
		httpOnly: true,
		sameSite: 'Lax',
		secure: isSecureOrigin && !isLocal, // never mark Secure on localhost
		path: '/', // required for __Host-* and fine for non-__Host too
	};

	// Access: ~15 minutes
	setCookie(headers, {
		...common,
		name: ACCESS_NAME,
		value: accessToken,
		maxAge: 60 * 15,
	});

	// Refresh: ~30 days
	setCookie(headers, {
		...common,
		name: REFRESH_NAME,
		value: refreshToken,
		maxAge: 60 * 60 * 24 * 30,
	});

	// CSRF (readable) — double-submit token, same naming irrespective of env
	setCookie(headers, {
		name: 'pjv-csrf',
		value: randomToken(),
		httpOnly: false, // must be readable by JS
		sameSite: 'Lax',
		secure: isSecureOrigin && !isLocal,
		path: '/',
		maxAge: 60 * 60 * 24 * 30,
	});
}

export function clearAuthCookies(headers: Headers, requestUrl: URL) {
	const isSecureOrigin = requestUrl.protocol === 'https:';
	const isLocal = isLocalhostHost(requestUrl.hostname);
	const { ACCESS_NAME, REFRESH_NAME } = resolveCookieNames(isSecureOrigin, isLocal);

	const base = { path: '/', secure: isSecureOrigin && !isLocal } as const;

	// Delete both possible names just in case a previous env wrote the other variant.
	deleteCookie(headers, ACCESS_NAME, base);
	deleteCookie(headers, REFRESH_NAME, base);
	deleteCookie(headers, 'pjv-csrf', base);

	// Also try deleting the opposite flavor to avoid sticky leftovers across envs.
	deleteCookie(headers, '__Host-pjv-at', base);
	deleteCookie(headers, '__Host-pjv-rt', base);
	deleteCookie(headers, 'pjv-at', base);
	deleteCookie(headers, 'pjv-rt', base);
}

export function getAuthCookies(req: Request) {
	const c = getCookies(req.headers);
	// Support both name variants seamlessly.
	const accessToken = c['__Host-pjv-at'] ?? c['pjv-at'];
	const refreshToken = c['__Host-pjv-rt'] ?? c['pjv-rt'];
	return {
		accessToken,
		refreshToken,
		csrf: c['pjv-csrf'],
	};
}

// ---- CSRF helpers ----

export function verifyCsrf(req: Request): boolean {
	const method = req.method.toUpperCase();
	if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return true;

	const cookies = getCookies(req.headers);
	const sent = req.headers.get('X-CSRF');
	const expected = cookies['pjv-csrf'];
	return Boolean(sent && expected && sent === expected);
}

// Generate a CSRF token
function randomToken(bytes = 32) {
	const a = new Uint8Array(bytes);
	crypto.getRandomValues(a);
	return btoa(String.fromCharCode(...a)).replace(/=+$/, '');
}

```

### File: packages\backend\src\core\clients\supabase.ts

```ts
import { createClient, type SupabaseClient, type SupabaseClientOptions } from 'supabaseClient';
import { Config, getAuthCookies } from '@projective/backend';

let anonClient: SupabaseClient | null = null;

function getEnv() {
	const SUPABASE_URL = Config.SUPABASE_URL;
	const ANON_KEY = Config.SUPABASE_ANON_KEY;
	if (!SUPABASE_URL || !ANON_KEY) {
		throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
	}
	return { SUPABASE_URL, ANON_KEY };
}

/**
 * Returns a Supabase client.
 *
 * @param req - The incoming request (for auth headers)
 * @param options - Configuration options (e.g. { realtime: true })
 */
// deno-lint-ignore require-await
export async function supabaseClient(
	req?: Request,
): Promise<SupabaseClient> {
	const { SUPABASE_URL, ANON_KEY } = getEnv();

	const baseOptions: SupabaseClientOptions<'public'> = {
		auth: {
			persistSession: false,
			detectSessionInUrl: false,
			autoRefreshToken: false,
		},
	};

	if (req) {
		const { accessToken } = getAuthCookies(req);
		if (accessToken) {
			return createClient(SUPABASE_URL, ANON_KEY, {
				...baseOptions,
				global: {
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				},
			});
		}
	}

	if (!anonClient) {
		anonClient = createClient(SUPABASE_URL, ANON_KEY, baseOptions);
	}
	return anonClient;
}

```

### File: packages\backend\src\core\errors\normalise.ts

```ts
export function normaliseSupabaseError(error: unknown): {
	code: string;
	message: string;
	status?: number;
} {
	const e = error as { code?: string; message?: string; status?: number };
	const raw = (e.code ?? '').toLowerCase();

	if (raw.includes('rate') || e.status === 429) {
		return {
			code: 'rate_limit',
			message: e.message ?? 'Too many attempts. Please try later.',
			status: 429,
		};
	}
	if (raw.includes('user') && raw.includes('exists')) {
		return { code: 'user_exists', message: e.message ?? 'User already exists.', status: 409 };
	}
	if ((raw.includes('invalid') && raw.includes('credentials')) || e.status === 401) {
		return {
			code: 'invalid_credentials',
			message: e.message ?? 'Invalid email or password.',
			status: 401,
		};
	}
	if (raw === 'signup_failed' || raw === 'invalid_signup' || e.status === 400) {
		return {
			code: 'signup_failed',
			message: e.message ?? 'Sign up failed.',
			status: e.status ?? 400,
		};
	}

	return { code: raw || 'auth_error', message: e.message ?? 'Authentication error.' };
}

export function normaliseUnknownError(err: unknown): {
	code: string;
	message: string;
} {
	if (err && typeof err === 'object') {
		const anyErr = err as { name?: string; message?: string };
		const name = (anyErr.name ?? '').toLowerCase();
		const message = anyErr.message ?? 'Unknown error';
		if (name === '' || name === 'error') {
			return { code: 'unknown_error', message };
		}
		return { code: name, message };
	}
	return { code: 'unknown_error', message: 'Unknown error' };
}

```

### File: packages\backend\src\core\http\result.ts

```ts
export type Ok<T> = { ok: true; data: T };
export type Fail = { ok: false; error: { code: string; message: string; status?: number } };
export type Result<T> = Ok<T> | Fail;

export function ok<T>(data: T): Ok<T> {
	return { ok: true, data };
}
export function fail(code: string, message: string, status?: number): Fail {
	return { ok: false, error: { code, message, status } };
}

```

### File: packages\backend\src\core\validation\email.ts

```ts
export function isLikelyEmail(s: string): boolean {
	if (!s || !s.includes('@')) return false;
	const [, domain = ''] = s.split('@');
	return domain.includes('.') && !/\s/.test(s);
}

```

### File: packages\backend\src\crypto.ts

```ts
// packages/server-utils/crypto.ts

// Generate URL-safe random string (base64-ish) for refresh tokens
export function randomTokenString(byteLength = 32): string {
	const raw = crypto.getRandomValues(new Uint8Array(byteLength));
	// convert Uint8Array -> binary string -> base64
	const bin = String.fromCharCode(...raw);
	return btoa(bin); // you can further make it URL-safe if you want
}

// TODO: replace with real Argon2id
export async function hashArgon2id(value: string): Promise<string> {
	// WARNING: placeholder.
	// You MUST replace this with a secure Argon2id hash implementation
	// before production. We're returning a SHA-256 for now just so dev works.
	const data = new TextEncoder().encode(value);
	const digest = await crypto.subtle.digest('SHA-256', data);
	const bytes = new Uint8Array(digest);
	return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

```

### File: packages\backend\src\rateLimiter.ts

```ts
type BucketInfo = {
	count: number;
	resetAt: number;
};

// Note: In a serverless environment (Deno Deploy), this Map is not shared across regions/isolates.
// For strict global rate limiting, you must use Deno KV.
// For now, this is "per-isolate" limiting.
const buckets = new Map<string, BucketInfo>();

export function rateLimitByIP(ip: string, limit = 100, windowMs = 10_000) {
	const now = Date.now();
	const bucket = buckets.get(ip);

	if (!bucket || now > bucket.resetAt) {
		buckets.set(ip, {
			count: 1,
			resetAt: now + windowMs,
		});

		return {
			allowed: true,
			remaining: limit - 1,
		};
	}

	if (bucket.count >= limit) {
		return {
			allowed: false,
			remaining: 0,
		};
	}

	bucket.count += 1;

	return {
		allowed: true,
		remaining: limit - bucket.count,
	};
}

```

### File: packages\backend\src\types.ts

```ts
import type { AuthResponse, AuthTokenResponsePassword, SupabaseClient } from 'supabaseClient';

export type SignUpData = AuthResponse['data'];

export type SignInData = AuthTokenResponsePassword['data'];

export type Deps = {
	getClient?: () => Promise<SupabaseClient>;
};

export type RegisterOptions = {
	emailRedirectTo?: string;
	captchaToken?: string;
	metadata?: Record<string, unknown>;
};

```

### File: packages\types\deno.json

```json
{
  "name": "@projective/types",
  "version": "0.0.0",
  "exports": "./mod.ts"
}

```

### File: packages\types\mod.ts

```ts
// Core & Utilities
export * from './src/core/datetime.ts';
export * from './src/core/enums.ts';

// Domain: Auth & Permissions
export * from './src/auth/permissions.ts';

// Domain: Projects
export * from './src/projects/index.ts';

// Domain: Finance
export * from './src/finance/currency.ts';

// Domain: Files & Media
export * from './src/files/model.ts';
export * from './src/files/categories.ts';
export * from './src/files/processing.ts';

// Domain: UI & Forms
export * from './src/ui/form.ts';
export * from './src/ui/text.ts';
export * from './src/ui/select.ts';
export * from './src/ui/slider.ts';

```

### File: packages\types\src\auth\permissions.ts

```ts
// 1. Project Level
export enum ProjectPermission {
	ManageSettings = 'manage_settings', // Edit title, archive, delete
	ManageMembers = 'manage_members', // Invite/kick team members
	ViewFinancials = 'view_financials', // See total spend/budget
	CreateStage = 'create_stage', // Add new stages
}

// 2. Stage Level (Workflow)
export enum StagePermission {
	EditDetails = 'edit_details', // Change description/requirements
	AssignWorker = 'assign_worker', // Assign freelancer/team
	FundEscrow = 'fund_escrow', // Pay into escrow
	SubmitWork = 'submit_work', // Upload deliverables
	ApproveWork = 'approve_work', // Accept submission
	RequestRevision = 'request_revision', // Reject submission
	ViewPrivateNotes = 'view_private_notes', // Internal team notes
}

// 3. Business/Org Level
export enum BusinessPermission {
	ManageBilling = 'manage_billing', // Update credit cards
	ManageTeamRoles = 'manage_team_roles', // Promote members
	DeleteBusiness = 'delete_business',
}

// 4. Platform Admin
export enum AdminPermission {
	ViewAllUsers = 'view_all_users',
	OverrideDispute = 'override_dispute',
	BanUser = 'ban_user',
}

```

### File: packages\types\src\core\datetime.ts

```ts
/* eslint-disable @typescript-eslint/naming-convention */

/**
 * Supported units for date/time differences and ranges.
 */
type DiffUnit =
	| 'milliseconds'
	| 'seconds'
	| 'minutes'
	| 'hours'
	| 'days'
	| 'weeks'
	| 'months'
	| 'years';

/**
 * Human-readable labels per diff unit used when building duration text.
 */
const UNIT_LABELS: Record<DiffUnit, { singular: string; plural: string }> = {
	milliseconds: { singular: 'millisecond', plural: 'milliseconds' },
	seconds: { singular: 'second', plural: 'seconds' },
	minutes: { singular: 'minute', plural: 'minutes' },
	hours: { singular: 'hour', plural: 'hours' },
	days: { singular: 'day', plural: 'days' },
	weeks: { singular: 'week', plural: 'weeks' },
	months: { singular: 'month', plural: 'months' },
	years: { singular: 'year', plural: 'years' },
};

// #region DateTime core

/**
 * Lightweight date/time helper that wraps the native Date for parsing, formatting, math and comparisons.
 *
 * @remarks
 * Accepts native Date, ISO-like strings, a custom parse format, or Excel serial numbers.
 * Instances are immutable from the caller's perspective whenever methods return a new DateTime.
 */
export class DateTime {
	private date: Date;
	private timezone: string | null = null;

	/**
	 * Creates a new DateTime from various input types.
	 *
	 * @param input Native Date, parseable string, Excel serial number, or undefined for "now".
	 * @param format Optional custom format string to parse non-ISO input.
	 * @param strictWeekday When true, rejects dates whose weekday text does not match the parsed calendar date.
	 */
	constructor(input?: Date | string | number, format?: string, strictWeekday: boolean = false) {
		if (input instanceof Date) {
			this.date = new Date(input);
		} else if (typeof input === 'string') {
			this.date = format
				? this.parseCustomFormat(input, format, strictWeekday)
				: this.parseFromString(input);
		} else if (typeof input === 'number') {
			this.date = this.parseFromExcel(input);
		} else {
			this.date = new Date();
		}
	}

	/**
	 * Parses a string using the browser's native Date parser.
	 *
	 * @remarks
	 * Behaviour depends on the runtime environment and may differ across browsers.
	 */
	private parseFromString(input: string): Date {
		return new Date(input);
	}

	/**
	 * Converts an Excel serial date into a JavaScript Date.
	 *
	 * @remarks
	 * Uses the 1900 date system (epoch 1899-12-30) and ignores Excel's leap-year bug for 1900.
	 */
	private parseFromExcel(serial: number): Date {
		const excelEpoch = new Date(1899, 11, 30);
		return new Date(excelEpoch.getTime() + serial * 86400000);
	}

	/**
	 * Parses a date string against a custom tokenised format.
	 *
	 * @remarks
	 * Supports basic day/month/year/time and timezone offset tokens similar to moment.js-style formats.
	 * Throws when the input does not match the pattern or when strict weekday validation fails.
	 *
	 * @throws Error If the input cannot be matched to the given format or weekday does not align when strict.
	 */
	private parseCustomFormat(input: string, format: string, strictWeekday: boolean = false): Date {
		const monthsShort = [
			'Jan',
			'Feb',
			'Mar',
			'Apr',
			'May',
			'Jun',
			'Jul',
			'Aug',
			'Sep',
			'Oct',
			'Nov',
			'Dec',
		];
		const monthsLong = [
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December',
		];
		const weekdaysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
		const weekdaysLong = [
			'Sunday',
			'Monday',
			'Tuesday',
			'Wednesday',
			'Thursday',
			'Friday',
			'Saturday',
		];

		const tokenMap: Record<string, string> = {
			d: '(\\d{1,2})',
			dd: '(\\d{2})',
			ddd: `(${weekdaysShort.join('|')})`,
			dddd: `(${weekdaysLong.join('|')})`,
			M: '(\\d{1,2})',
			MM: '(\\d{2})',
			MMM: `(${monthsShort.join('|')})`,
			MMMM: `(${monthsLong.join('|')})`,
			y: '(\\d{2})',
			yy: '(\\d{2})',
			yyy: '(\\d{4})',
			yyyy: '(\\d{4})',
			h: '(\\d{1,2})',
			hh: '(\\d{2})',
			m: '(\\d{1,2})',
			mm: '(\\d{2})',
			s: '(\\d{1,2})',
			ss: '(\\d{2})',
			Z: '([+-]\\d{2}:?\\d{2})',
			ZZ: '([+-]\\d{4})',
		};

		const tokens: string[] = [];
		let pattern = '';
		for (let i = 0; i < format.length;) {
			let matched = false;
			for (const token of Object.keys(tokenMap).sort((a, b) => b.length - a.length)) {
				if (format.startsWith(token, i)) {
					pattern += tokenMap[token];
					tokens.push(token);
					i += token.length;
					matched = true;
					break;
				}
			}
			if (!matched) {
				pattern += format[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
				i++;
			}
		}

		const regex = new RegExp(`^${pattern}$`);
		const match = input.match(regex);
		if (!match) throw new Error(`Input "${input}" does not match format "${format}"`);

		let year = 1970,
			month = 1,
			day = 1,
			hour = 0,
			minute = 0,
			second = 0;
		let weekdayExpected: string | null = null;

		let j = 1;
		for (const token of tokens) {
			const raw = match[j++];
			switch (token) {
				case 'd':
				case 'dd':
					day = parseInt(raw, 10);
					break;
				case 'ddd':
				case 'dddd':
					weekdayExpected = raw;
					break;
				case 'M':
				case 'MM':
					month = parseInt(raw, 10);
					break;
				case 'MMM':
					month = monthsShort.indexOf(raw) + 1;
					break;
				case 'MMMM':
					month = monthsLong.indexOf(raw) + 1;
					break;
				case 'y':
				case 'yy':
					year = 2000 + parseInt(raw, 10);
					break;
				case 'yyy':
				case 'yyyy':
					year = parseInt(raw, 10);
					break;
				case 'h':
				case 'hh':
					hour = parseInt(raw, 10);
					break;
				case 'm':
				case 'mm':
					minute = parseInt(raw, 10);
					break;
				case 's':
				case 'ss':
					second = parseInt(raw, 10);
					break;
				case 'Z':
				case 'ZZ': {
					const parts = raw.match(/([+-])(\d{2}):?(\d{2})/);
					if (parts) {
						const sign = parts[1] === '+' ? 1 : -1;
						const hh = parseInt(parts[2], 10);
						const mm = parseInt(parts[3], 10);
						const offsetMinutes = sign * (hh * 60 + mm);

						return new Date(
							Date.UTC(year, month - 1, day, hour, minute - offsetMinutes, second),
						);
					}
					break;
				}
			}
		}

		const parsed = new Date(year, month - 1, day, hour, minute, second);

		if (strictWeekday && weekdayExpected) {
			const actual = parsed.toLocaleDateString('en-US', {
				weekday: weekdayExpected.length === 3 ? 'short' : 'long',
			});
			if (weekdayExpected !== actual) {
				throw new Error(
					`Weekday mismatch: expected "${weekdayExpected}", but got "${actual}"`,
				);
			}
		}

		return parsed;
	}

	/**
	 * Pads a numeric value with leading zeroes for formatting.
	 */
	private pad(num: number, length: number = 2): string {
		return num.toString().padStart(length, '0');
	}

	/**
	 * Returns the ordinal suffix for a given day in month.
	 *
	 * @example
	 * getOrdinal(1) === 'st', getOrdinal(22) === 'nd'
	 */
	private getOrdinal(day: number): string {
		if (day > 3 && day < 21) return 'th';
		switch (day % 10) {
			case 1:
				return 'st';
			case 2:
				return 'nd';
			case 3:
				return 'rd';
			default:
				return 'th';
		}
	}

	/**
	 * Map of custom format tokens to formatting functions.
	 *
	 * @remarks
	 * Used by {@link toFormat} to expand tokens to locale-aware date/time pieces.
	 */
	private formatTokens: Record<string, (d: Date) => string> = {
		d: (d) => d.getDate().toString(),
		dd: (d) => this.pad(d.getDate()),
		ddd: (d) => d.toLocaleDateString('en-GB', { weekday: 'short' }),
		dddd: (d) => d.toLocaleDateString('en-GB', { weekday: 'long' }),
		D: (d) =>
			`${
				d.toLocaleDateString('en-GB', {
					weekday: 'short',
				})
			} ${d.getDate()}`,
		DD: (d) =>
			`${
				d.toLocaleDateString('en-GB', {
					weekday: 'long',
				})
			} ${d.getDate()}`,
		o: (d) => this.getOrdinal(d.getDate()),
		M: (d) => (d.getMonth() + 1).toString(),
		MM: (d) => this.pad(d.getMonth() + 1),
		MMM: (d) => d.toLocaleDateString('en-GB', { month: 'short' }),
		MMMM: (d) => d.toLocaleDateString('en-GB', { month: 'long' }),
		y: (d) => d.getFullYear().toString().slice(-2),
		yy: (d) => d.getFullYear().toString().slice(-2),
		yyy: (d) => d.getFullYear().toString(),
		yyyy: (d) => d.getFullYear().toString(),
		h: (d) => (d.getHours() % 12 || 12).toString(),
		hh: (d) => this.pad(d.getHours() % 12 || 12),
		H: (d) => d.getHours().toString(),
		HH: (d) => this.pad(d.getHours()),
		m: (d) => d.getMinutes().toString(),
		mm: (d) => this.pad(d.getMinutes()),
		s: (d) => d.getSeconds().toString(),
		ss: (d) => this.pad(d.getSeconds()),
		t: (d) => (d.getHours() < 12 ? 'AM' : 'PM'),
		tt: (d) => (d.getHours() < 12 ? 'am' : 'pm'),
		Z: (_d) => this.formatOffset(true),
		ZZ: (_d) => this.formatOffset(false),
		z: (d) =>
			Intl.DateTimeFormat('en-GB', {
				timeZone: this.timezone || 'UTC',
				timeZoneName: 'short',
			})
				.format(d)
				.split(' ')
				.pop() || '',
		zzzz: (d) =>
			Intl.DateTimeFormat('en-GB', {
				timeZone: this.timezone || 'UTC',
				timeZoneName: 'long',
			})
				.format(d)
				.split(' ')
				.pop() || '',
	};

	/**
	 * Returns the local timezone offset in minutes, positive east of UTC.
	 */
	private getOffsetMinutes(): number {
		return -this.date.getTimezoneOffset();
	}

	/**
	 * Formats the current timezone offset as a string.
	 *
	 * @param colon When true, uses `+HH:MM`, otherwise `+HHMM`.
	 */
	private formatOffset(colon: boolean = true): string {
		const offset = this.getOffsetMinutes();
		const sign = offset >= 0 ? '+' : '-';
		const abs = Math.abs(offset);
		const hh = Math.floor(abs / 60)
			.toString()
			.padStart(2, '0');
		const mm = (abs % 60).toString().padStart(2, '0');
		return colon ? `${sign}${hh}:${mm}` : `${sign}${hh}${mm}`;
	}

	/**
	 * Returns the native `Date.toString()` representation.
	 */
	toString(): string {
		return this.date.toString();
	}

	/**
	 * Returns the ISO 8601 string representation in UTC.
	 */
	toISO(): string {
		return this.date.toISOString();
	}

	/**
	 * Formats the date according to the custom token format.
	 *
	 * @remarks
	 * Uses the internal token map, including locale-aware weekday/month text and timezone information.
	 */
	toFormat(format: string): string {
		const tokens = Object.keys(this.formatTokens).sort((a, b) => b.length - a.length);
		let result = '';
		for (let i = 0; i < format.length;) {
			let matched = false;
			for (const token of tokens) {
				if (format.startsWith(token, i)) {
					result += this.formatTokens[token](this.date);
					i += token.length;
					matched = true;
					break;
				}
			}
			if (!matched) {
				result += format[i];
				i++;
			}
		}
		return result;
	}

	/**
	 * Returns the underlying epoch time in milliseconds.
	 */
	getTime(): number {
		return this.date.getTime();
	}
	getDate(): number {
		return this.date.getDate();
	}
	getDay(): number {
		return this.date.getDay();
	}
	getMonth(): number {
		return this.date.getMonth() + 1;
	}
	getYear(): number {
		return this.date.getFullYear();
	}
	getHour(): number {
		return this.date.getHours();
	}
	getMinute(): number {
		return this.date.getMinutes();
	}
	getSecond(): number {
		return this.date.getSeconds();
	}

	/**
	 * Adds another DateTime or a scalar amount in a specific unit and returns a new instance.
	 *
	 * @remarks
	 * When passing a DateTime, millisecond timestamps are summed; when passing a number, the unit string is used.
	 *
	 * @throws Error If an unsupported unit string is provided.
	 */
	add(value: DateTime): DateTime;
	add(value: number, type: string): DateTime;
	add(value: any, type?: string): DateTime {
		const newDate = new Date(this.date);
		if (value instanceof DateTime) {
			newDate.setTime(newDate.getTime() + value.getTime());
		} else if (typeof value === 'number' && type) {
			switch (type.toLowerCase()) {
				case 'milliseconds':
					newDate.setMilliseconds(newDate.getMilliseconds() + value);
					break;
				case 'seconds':
					newDate.setSeconds(newDate.getSeconds() + value);
					break;
				case 'minutes':
					newDate.setMinutes(newDate.getMinutes() + value);
					break;
				case 'hours':
					newDate.setHours(newDate.getHours() + value);
					break;
				case 'days':
					newDate.setDate(newDate.getDate() + value);
					break;
				case 'weeks':
					newDate.setDate(newDate.getDate() + value * 7);
					break;
				case 'months':
					newDate.setMonth(newDate.getMonth() + value);
					break;
				case 'years':
					newDate.setFullYear(newDate.getFullYear() + value);
					break;
				default:
					throw new Error(`Unsupported add type: ${type}`);
			}
		}
		return new DateTime(newDate);
	}

	/**
	 * Subtracts another DateTime or a scalar amount in a specific unit and returns a new instance.
	 *
	 * @remarks
	 * When passing a DateTime, returns a duration whose epoch time is the millisecond difference
	 * (this.getTime() - other.getTime()).
	 * When passing a number, delegates to {@link add} with a negated value.
	 */
	minus(value: DateTime): DateTime;
	minus(value: number, type: string): DateTime;
	minus(value: any, type?: string): DateTime {
		if (value instanceof DateTime) {
			// IMPORTANT: build a Date from the millisecond diff, not via the numeric (Excel) constructor.
			const diffMs = this.getTime() - value.getTime();
			return new DateTime(new Date(diffMs));
		} else {
			return this.add(-value, type!);
		}
	}

	/**
	 * Attaches a display timezone identifier for formatting tokens that depend on it.
	 *
	 * @remarks
	 * This does not shift the underlying instant, only how timezone-aware tokens (e.g. `z`, `zzzz`) are formatted.
	 */
	addTimezone(timezone: string): DateTime {
		this.timezone = timezone;
		return this;
	}

	/**
	 * Returns the ISO week number of the year (1–53).
	 *
	 * @remarks
	 * Week calculation follows ISO-8601 rules: weeks start on Monday and week 1 is the week with the first Thursday.
	 */
	getWeek(): number {
		const temp = new Date(this.date);
		temp.setHours(0, 0, 0, 0);
		temp.setDate(temp.getDate() + 3 - ((temp.getDay() + 6) % 7));
		const week1 = new Date(temp.getFullYear(), 0, 4);
		return (
			1 +
			Math.round(
				((temp.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) /
					7,
			)
		);
	}

	/**
	 * Returns the full weekday name in `en-GB` locale.
	 */
	getDayOfWeek(): string {
		return this.date.toLocaleDateString('en-GB', { weekday: 'long' });
	}

	/**
	 * Returns a new DateTime instance that shares the same underlying instant.
	 */
	clone(): DateTime {
		return new DateTime(new Date(this.date));
	}

	/**
	 * Checks if this instance occurs strictly before another.
	 */
	isBefore(other: DateTime): boolean {
		return this.getTime() < other.getTime();
	}

	/**
	 * Checks if this instance occurs strictly after another.
	 */
	isAfter(other: DateTime): boolean {
		return this.getTime() > other.getTime();
	}

	/**
	 * Checks if this instance represents the exact same millisecond as another.
	 */
	isSame(other: DateTime): boolean {
		return this.getTime() === other.getTime();
	}

	/**
	 * Checks whether this time falls between two other times with configurable inclusivity.
	 *
	 * @param start Lower bound.
	 * @param end Upper bound.
	 * @param inclusive One of `"()"`, `"[)"`, `"(]"`, `"[]"` to control boundary inclusion.
	 *
	 * @throws Error If an invalid inclusive flag is provided.
	 */
	isBetween(start: DateTime, end: DateTime, inclusive: string = '()'): boolean {
		const t = this.getTime();
		const s = start.getTime();
		const e = end.getTime();

		switch (inclusive) {
			case '()':
				return t > s && t < e;
			case '[)':
				return t >= s && t < e;
			case '(]':
				return t > s && t <= e;
			case '[]':
				return t >= s && t <= e;
			default:
				throw new Error(`Invalid inclusive flag: ${inclusive}`);
		}
	}

	/**
	 * Checks if this DateTime shares the same calendar day as another (year, month, day).
	 */
	isSameDay(other: DateTime): boolean {
		return (
			this.getYear() === other.getYear() &&
			this.getMonth() === other.getMonth() &&
			this.getDate() === other.getDate()
		);
	}

	/**
	 * Checks if this DateTime falls in the same calendar month as another.
	 */
	isSameMonth(other: DateTime): boolean {
		return this.getYear() === other.getYear() && this.getMonth() === other.getMonth();
	}

	/**
	 * Checks if this DateTime falls in the same calendar year as another.
	 */
	isSameYear(other: DateTime): boolean {
		return this.getYear() === other.getYear();
	}

	/**
	 * Returns a new DateTime snapped to the start of the given unit.
	 *
	 * @param unit One of `year`, `month`, `week`, `day`, `hour`, `minute`, `second` (case-insensitive).
	 *
	 * @throws Error If an unsupported unit is provided.
	 */
	startOf(unit: string): DateTime {
		const d = new Date(this.date);
		switch (unit.toLowerCase()) {
			case 'year':
				d.setMonth(0, 1);
				d.setHours(0, 0, 0, 0);
				break;
			case 'month':
				d.setDate(1);
				d.setHours(0, 0, 0, 0);
				break;
			case 'week': {
				const day = d.getDay();
				d.setDate(d.getDate() - day);
				d.setHours(0, 0, 0, 0);
				break;
			}
			case 'day':
				d.setHours(0, 0, 0, 0);
				break;
			case 'hour':
				d.setMinutes(0, 0, 0);
				break;
			case 'minute':
				d.setSeconds(0, 0);
				break;
			case 'second':
				d.setMilliseconds(0);
				break;
			default:
				throw new Error(`Unsupported unit for startOf: ${unit}`);
		}
		return new DateTime(d);
	}

	/**
	 * Returns a new DateTime snapped to the end of the given unit.
	 *
	 * @param unit One of `year`, `month`, `week`, `day`, `hour`, `minute`, `second` (case-insensitive).
	 *
	 * @throws Error If an unsupported unit is provided.
	 */
	endOf(unit: string): DateTime {
		const d = new Date(this.date);
		switch (unit.toLowerCase()) {
			case 'year':
				d.setMonth(11, 31);
				d.setHours(23, 59, 59, 999);
				break;
			case 'month':
				d.setMonth(d.getMonth() + 1, 0);
				d.setHours(23, 59, 59, 999);
				break;
			case 'week': {
				const day = d.getDay();
				d.setDate(d.getDate() + (6 - day));
				d.setHours(23, 59, 59, 999);
				break;
			}
			case 'day':
				d.setHours(23, 59, 59, 999);
				break;
			case 'hour':
				d.setMinutes(59, 59, 999);
				break;
			case 'minute':
				d.setSeconds(59, 999);
				break;
			case 'second':
				d.setMilliseconds(999);
				break;
			default:
				throw new Error(`Unsupported unit for endOf: ${unit}`);
		}
		return new DateTime(d);
	}

	/**
	 * Returns the raw numeric difference between this instance and another in the specified unit.
	 *
	 * @param other DateTime to compare against.
	 * @param unit Unit to express the difference in; uses the same labels as {@link DiffUnit} but accepts any casing.
	 *
	 * @throws Error If an unsupported unit is requested.
	 */
	diff(other: DateTime, unit: string = 'milliseconds'): number {
		const ms = this.getTime() - other.getTime();
		switch (unit.toLowerCase()) {
			case 'milliseconds':
				return ms;
			case 'seconds':
				return ms / 1000;
			case 'minutes':
				return ms / (1000 * 60);
			case 'hours':
				return ms / (1000 * 60 * 60);
			case 'days':
				return ms / (1000 * 60 * 60 * 24);
			case 'weeks':
				return ms / (1000 * 60 * 60 * 24 * 7);
			case 'months':
				return (
					(this.getYear() - other.getYear()) * 12 + (this.getMonth() - other.getMonth())
				);
			case 'years':
				return this.getYear() - other.getYear();
			default:
				throw new Error(`Unsupported diff unit: ${unit}`);
		}
	}

	/**
	 * Computes a human-friendly time difference between this instance and another.
	 *
	 * @param other DateTime to compare with.
	 * @param opts Optional tuning for units and rounding.
	 * @returns A descriptor including numeric value, chosen unit, label text and singular/plural metadata.
	 *
	 * @remarks
	 * Picks the "largest" unit within the allowed range whose absolute value is at least 1.
	 * Months and years are calculated using calendar arithmetic; other units are derived from milliseconds.
	 *
	 * @throws Error If `minUnit` or `maxUnit` are invalid or inconsistent with the allowed unit order.
	 */
	diffAuto(
		other: DateTime,
		opts?: {
			minUnit?: DiffUnit;
			maxUnit?: DiffUnit;
			rounding?: 'round' | 'floor' | 'ceil';
			absolute?: boolean;
		},
	): { value: number; unit: DiffUnit; unitSingular: string; unitPlural: string; label: string } {
		const {
			minUnit = 'seconds',
			maxUnit = 'years',
			rounding = 'round',
			absolute = true,
		} = opts || {};

		const order: DiffUnit[] = [
			'milliseconds',
			'seconds',
			'minutes',
			'hours',
			'days',
			'weeks',
			'months',
			'years',
		];

		const clampRange = (units: DiffUnit[], lo: DiffUnit, hi: DiffUnit) => {
			const start = units.indexOf(lo);
			const end = units.indexOf(hi);
			if (start === -1 || end === -1) throw new Error('Invalid minUnit/maxUnit');
			return units.slice(Math.min(start, end), Math.max(start, end) + 1);
		};

		const candidates = clampRange(order, minUnit, maxUnit);

		if (this.getTime() === other.getTime()) {
			const chosenZero = candidates[0] || 'milliseconds';
			const { singular, plural } = UNIT_LABELS[chosenZero];
			return {
				value: 0,
				unit: chosenZero,
				unitSingular: singular,
				unitPlural: plural,
				label: `0 ${plural}`,
			};
		}

		const ms = this.diff(other, 'milliseconds');
		const s = ms / 1000;
		const m = s / 60;
		const h = m / 60;
		const d = h / 24;
		const w = d / 7;

		const months = this.diff(other, 'months');
		const years = this.diff(other, 'years');

		const byUnit: Record<DiffUnit, number> = {
			years,
			months,
			weeks: w,
			days: d,
			hours: h,
			minutes: m,
			seconds: s,
			milliseconds: ms,
		};

		const descending = [...candidates].sort((a, b) => order.indexOf(b) - order.indexOf(a));

		let chosen: DiffUnit | null = null;
		for (const u of descending) {
			if (Math.abs(byUnit[u]) >= 1) {
				chosen = u;
				break;
			}
		}
		if (!chosen) chosen = candidates[0];

		let value = byUnit[chosen];

		if (absolute) value = Math.abs(value);

		switch (rounding) {
			case 'floor':
				value = Math.floor(value);
				break;
			case 'ceil':
				value = Math.ceil(value);
				break;
			case 'round':
			default:
				value = Math.round(value);
				break;
		}

		const { singular, plural } = UNIT_LABELS[chosen];
		const label = `${value} ${Math.abs(value) === 1 ? singular : plural}`;

		return {
			value,
			unit: chosen,
			unitSingular: singular,
			unitPlural: plural,
			label,
		};
	}

	/**
	 * Indicates whether the underlying Date represents a valid point in time.
	 */
	isValid(): boolean {
		return !isNaN(this.date.getTime());
	}

	/**
	 * Returns a clone of the given DateTime with a different display timezone.
	 *
	 * @remarks
	 * The instant is preserved; only timezone-aware formatting changes.
	 */
	static toNewTimezone(value: DateTime, timezone: string): DateTime {
		const iso = value.toISO();
		const dt = new DateTime(new Date(iso));
		dt.addTimezone(timezone);
		return dt;
	}

	/**
	 * Builds an array of dates between two points in time using a given step unit.
	 *
	 * @param start Inclusive start DateTime.
	 * @param end Inclusive end DateTime.
	 * @param format Optional format string; when truthy, items are formatted strings, otherwise DateTime instances.
	 * @param returnType Unit to step by (e.g. `days`, `hours`), case-insensitive.
	 *
	 * @throws Error If an unsupported `returnType` is provided.
	 */
	static datesBetween(
		start: DateTime,
		end: DateTime,
		format: string,
		returnType: string,
	): (DateTime | string)[] {
		const results: (DateTime | string)[] = [];
		let current = start.clone();
		const unit = returnType.toLowerCase();

		while (current.isBefore(end) || current.isSame(end)) {
			results.push(format ? current.toFormat(format) : current.clone());

			switch (unit) {
				case 'milliseconds':
					current = current.add(1, 'milliseconds');
					break;
				case 'seconds':
					current = current.add(1, 'seconds');
					break;
				case 'minutes':
					current = current.add(1, 'minutes');
					break;
				case 'hours':
					current = current.add(1, 'hours');
					break;
				case 'days':
					current = current.add(1, 'days');
					break;
				case 'weeks':
					current = current.add(1, 'weeks');
					break;
				case 'months':
					current = current.add(1, 'months');
					break;
				case 'years':
					current = current.add(1, 'years');
					break;
				default:
					throw new Error(`Unsupported returnType: ${returnType}`);
			}
		}
		return results;
	}

	/**
	 * Convenience wrapper to build a DateTime range with a specific unit step.
	 *
	 * @param start Inclusive start.
	 * @param end Inclusive end.
	 * @param unit Unit to step by, defaults to `days`.
	 */
	static range(start: DateTime, end: DateTime, unit: string = 'days'): DateTime[] {
		return DateTime.datesBetween(start, end, '', unit) as DateTime[];
	}

	/**
	 * Returns a DateTime representing the current instant.
	 */
	static now(): DateTime {
		return new DateTime(new Date());
	}

	/**
	 * Returns a DateTime for today at local midnight.
	 */
	static today(): DateTime {
		const d = new Date();
		d.setHours(0, 0, 0, 0);
		return new DateTime(d);
	}

	/**
	 * Returns a DateTime for tomorrow at local midnight.
	 */
	static tomorrow(): DateTime {
		return DateTime.today().add(1, 'days');
	}

	/**
	 * Returns a DateTime for yesterday at local midnight.
	 */
	static yesterday(): DateTime {
		return DateTime.today().minus(1, 'days');
	}

	/**
	 * Creates a DateTime from an ISO 8601 string.
	 */
	static fromISO(iso: string): DateTime {
		return new DateTime(new Date(iso));
	}

	/**
	 * Creates a DateTime from an Excel serial date number.
	 *
	 * @remarks
	 * Uses the same conversion rules as the instance-level Excel parser.
	 */
	static fromExcel(serial: number): DateTime {
		return new DateTime(serial);
	}
}

// #endregion DateTime core

```

### File: packages\types\src\core\enums.ts

```ts
export enum Visibility {
	Public = 'public',
	InviteOnly = 'invite_only',
	Unlisted = 'unlisted',
}

export enum ProfileType {
	Freelancer = 'freelancer',
	Business = 'business',
}

export enum AssignmentType {
	Freelancer = 'freelancer',
	Team = 'team',
}

export enum DisputeStatus {
	Open = 'open',
	UnderReview = 'under_review',
	Resolved = 'resolved',
	Refunded = 'refunded',
}

```

### File: packages\types\src\files\categories.ts

```ts
/**
 * Determines the specific FileCategory for a given File object.
 * It checks the file extension first, then falls back to MIME type.
 * * @param file - The browser File object
 * @returns The matching FileCategory or 'Other' if not found.
 */
export function getFileCategory(file: File): FileCategory | 'Other' {
	const extension = file.name.split('.').pop()?.toLowerCase() || '';
	const mimeType = file.type.toLowerCase();

	for (const [category, definitions] of Object.entries(extensionCategories)) {
		for (const def of definitions) {
			if (def.extension.toLowerCase() === extension) {
				return category as FileCategory;
			}

			if (def.validMimeTypes && def.validMimeTypes.includes(mimeType)) {
				return category as FileCategory;
			}
		}
	}

	if (mimeType.startsWith('image/')) return 'Image';
	if (mimeType.startsWith('video/')) return 'Video';
	if (mimeType.startsWith('audio/')) return 'Audio';
	if (mimeType.startsWith('text/')) return 'Document';

	return 'Other';
}

export type FileCategory =
	| 'Document'
	| 'Presentation'
	| 'Spreadsheet'
	| 'Audio'
	| 'Video'
	| 'Image'
	| 'Vector'
	| 'Medical'
	| 'Scientific'
	| 'Compression'
	| 'Executable'
	| 'Code'
	| '3D'
	| 'Database'
	| 'Data'
	| 'Font'
	| 'Security'
	| 'System'
	| 'Email'
	| 'DiskImage'
	| 'VMImage'
	| 'ContainerImage'
	| 'CAD'
	| 'GIS'
	| 'Ebook'
	| 'Config'
	| 'Package';

export interface FileDefinition {
	extension: string;
	application?: string;
	validMimeTypes?: string[];
}

export type ExtensionMap = Record<FileCategory, FileDefinition[]>;

export const extensionCategories: ExtensionMap = {
	Document: [
		{ extension: 'doc', application: 'Microsoft Word', validMimeTypes: ['application/msword'] },
		{
			extension: 'docx',
			application: 'Microsoft Word',
			validMimeTypes: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
		},

		{
			extension: 'docm',
			application: 'Microsoft Word Macro-Enabled Document',
			validMimeTypes: ['application/vnd.ms-word.document.macroEnabled.12'],
		},
		{
			extension: 'dot',
			application: 'Microsoft Word Template',
			validMimeTypes: ['application/msword'],
		},
		{
			extension: 'dotx',
			application: 'Microsoft Word Template',
			validMimeTypes: ['application/vnd.openxmlformats-officedocument.wordprocessingml.template'],
		},

		{
			extension: 'dotm',
			application: 'Microsoft Word Macro-Enabled Template',
			validMimeTypes: ['application/vnd.ms-word.template.macroEnabled.12'],
		},
		{ extension: 'pdf', application: 'Adobe Acrobat', validMimeTypes: ['application/pdf'] },
		{ extension: 'txt', application: 'Plain Text', validMimeTypes: ['text/plain'] },
		{ extension: 'rtf', application: 'Rich Text Format', validMimeTypes: ['application/rtf'] },
		{
			extension: 'odt',
			application: 'OpenDocument Text',
			validMimeTypes: ['application/vnd.oasis.opendocument.text'],
		},
		{
			extension: 'fodt',
			application: 'Flat OpenDocument Text',
			validMimeTypes: ['application/vnd.oasis.opendocument.text-flat-xml'],
		},
		{
			extension: 'wpd',
			application: 'WordPerfect Document',
			validMimeTypes: ['application/wordperfect'],
		},
		{
			extension: 'wps',
			application: 'Microsoft Works Document',
			validMimeTypes: ['application/vnd.ms-works'],
		},
		{ extension: 'abw', application: 'AbiWord Document' },
		{ extension: 'md', application: 'Markdown', validMimeTypes: ['text/markdown'] },
		{ extension: 'rst', application: 'reStructuredText', validMimeTypes: ['text/x-rst'] },
		{ extension: 'adoc', application: 'AsciiDoc' },
		{ extension: 'tex', application: 'LaTeX Document' },
		{ extension: 'ltx', application: 'LaTeX Source File' },
		{ extension: 'bib', application: 'BibTeX Bibliography File' },

		{ extension: 'sty', application: 'LaTeX Style File' },
		{ extension: 'cls', application: 'LaTeX Class File' },

		{ extension: 'epub', application: 'EPUB eBook', validMimeTypes: ['application/epub+zip'] },
		{ extension: 'mobi', application: 'Mobipocket eBook' },
		{ extension: 'azw', application: 'Amazon Kindle eBook' },
		{ extension: 'azw3', application: 'Amazon Kindle eBook' },
		{ extension: 'fb2', application: 'FictionBook eBook' },

		{
			extension: 'cbr',
			application: 'Comic Book RAR Archive',
			validMimeTypes: ['application/vnd.comicbook-rar'],
		},
		{
			extension: 'cbz',
			application: 'Comic Book ZIP Archive',
			validMimeTypes: ['application/vnd.comicbook+zip'],
		},

		{ extension: 'cb7', application: 'Comic Book 7-Zip Archive' },

		{ extension: 'gov', application: 'Government Document' },
		{ extension: 'legx', application: 'Legal XML Format' },
		{ extension: 'xfdl', application: 'Extensible Forms Description Language' },
		{ extension: 'djvu', application: 'DjVu Scanned Document', validMimeTypes: ['image/vnd.djvu'] },
		{
			extension: 'xps',
			application: 'Microsoft XPS Document',
			validMimeTypes: ['application/vnd.ms-xpsdocument'],
		},
		{ extension: 'oxps', application: 'OpenXPS Document', validMimeTypes: ['application/oxps'] },
		{
			extension: 'one',
			application: 'Microsoft OneNote',
			validMimeTypes: ['application/msonenote'],
		},
		{ extension: 'note', application: 'Evernote Note File' },
		{ extension: 'jnt', application: 'Windows Journal Note' },
		{ extension: 'gdoc', application: 'Google Docs File' },
		{ extension: 'pages', application: 'Apple Pages Document' },
		{ extension: 'indd', application: 'Adobe InDesign Document' },
		{ extension: 'indt', application: 'Adobe InDesign Template' },
		{ extension: 'pmd', application: 'Adobe PageMaker Document' },
		{ extension: 'pub', application: 'Microsoft Publisher Document' },
		{ extension: 'sla', application: 'Scribus Document' },
		{ extension: 'mml', application: 'Mathematical Markup Language' },

		{ extension: 'url', application: 'Internet Shortcut' },
		{ extension: 'webloc', application: 'Mac Web Shortcut' },
		{ extension: 'desktop', application: 'Linux Desktop Shortcut' },
		{ extension: 'nfo', application: 'Information File' },
		{ extension: 'readme', application: 'ReadMe File' },
		{ extension: 'ami', application: 'Amiga AmigaGuide' },
		{ extension: 'wp', application: 'WordPerfect' },
		{ extension: '602', application: 'T602 Text Document' },
		{ extension: 'p7s', application: 'Secure Signed Email File' },
		{ extension: 'fax', application: 'Fax Image Format' },
	],

	Spreadsheet: [
		{
			extension: 'xls',
			application: 'Microsoft Excel',
			validMimeTypes: ['application/vnd.ms-excel'],
		},
		{
			extension: 'xlsx',
			application: 'Microsoft Excel',
			validMimeTypes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
		},
		{
			extension: 'xlsm',
			application: 'Microsoft Excel Macro-Enabled',
			validMimeTypes: ['application/vnd.ms-excel.sheet.macroEnabled.12'],
		},
		{
			extension: 'xlsb',
			application: 'Microsoft Excel Binary Workbook',
			validMimeTypes: ['application/vnd.ms-excel.sheet.binary.macroEnabled.12'],
		},
		{
			extension: 'xlt',
			application: 'Microsoft Excel Template',
			validMimeTypes: ['application/vnd.ms-excel'],
		},
		{
			extension: 'xltx',
			application: 'Microsoft Excel Template',
			validMimeTypes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.template'],
		},
		{
			extension: 'ods',
			application: 'OpenDocument Spreadsheet',
			validMimeTypes: ['application/vnd.oasis.opendocument.spreadsheet'],
		},
		{
			extension: 'ots',
			application: 'OpenDocument Spreadsheet Template',
			validMimeTypes: ['application/vnd.oasis.opendocument.spreadsheet-template'],
		},
		{
			extension: 'fods',
			application: 'Flat OpenDocument Spreadsheet',
			validMimeTypes: ['application/vnd.oasis.opendocument.spreadsheet-flat-xml'],
		},
		{
			extension: 'dif',
			application: 'Data Interchange Format',
			validMimeTypes: ['application/x-dif'],
		},
		{
			extension: 'slk',
			application: 'Symbolic Link Format',
			validMimeTypes: ['application/vnd.ms-excel'],
		},
		{ extension: 'qbw', application: 'QuickBooks Company File' },
		{ extension: 'qbb', application: 'QuickBooks Backup File' },
		{ extension: 'qbm', application: 'QuickBooks Portable File' },
		{ extension: 'gnumeric', application: 'Gnumeric Spreadsheet' },
		{ extension: 'numbers', application: 'Apple Numbers Spreadsheet' },
		{ extension: 'gsheet', application: 'Google Sheets File' },
		{ extension: 'et', application: 'WPS Office Excel File' },
		{ extension: 'wks', application: 'Lotus 1-2-3 Worksheet' },
		{ extension: '123', application: 'Lotus 1-2-3 Spreadsheet' },
		{ extension: 'sas7bdat', application: 'SAS Dataset' },
		{ extension: 'wk1', application: 'Lotus Worksheet' },
		{ extension: 'wk3', application: 'Lotus 1-2-3 Worksheet' },
		{ extension: 'wk4', application: 'Lotus 1-2-3 Worksheet' },
		{ extension: 'wq1', application: 'Quattro Pro Spreadsheet' },
		{ extension: 'wq2', application: 'Quattro Pro Spreadsheet' },
		{ extension: 'qpw', application: 'Quattro Pro Workbook' },
		{ extension: 'vc', application: 'VisiCalc Spreadsheet' },
		{ extension: 'vcs', application: 'VisiCalc Spreadsheet' },
	],

	Presentation: [
		{ extension: 'key', application: 'Apple Keynote Presentation' },
		{
			extension: 'ppt',
			application: 'Microsoft PowerPoint',
			validMimeTypes: ['application/vnd.ms-powerpoint'],
		},
		{
			extension: 'pptx',
			application: 'Microsoft PowerPoint',
			validMimeTypes: ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
		},

		{
			extension: 'pptm',
			application: 'Microsoft PowerPoint Macro-Enabled Presentation',
			validMimeTypes: ['application/vnd.ms-powerpoint.presentation.macroEnabled.12'],
		},

		{
			extension: 'potx',
			application: 'Microsoft PowerPoint Template',
			validMimeTypes: ['application/vnd.openxmlformats-officedocument.presentationml.template'],
		},
		{
			extension: 'potm',
			application: 'Microsoft PowerPoint Macro-Enabled Template',
			validMimeTypes: ['application/vnd.ms-powerpoint.template.macroEnabled.12'],
		},

		{
			extension: 'pps',
			application: 'Microsoft PowerPoint Slideshow',
			validMimeTypes: ['application/vnd.ms-powerpoint'],
		},
		{
			extension: 'ppsx',
			application: 'Microsoft PowerPoint Slideshow',
			validMimeTypes: ['application/vnd.openxmlformats-officedocument.presentationml.slideshow'],
		},
		{
			extension: 'ppsm',
			application: 'Microsoft PowerPoint Macro-Enabled Slideshow',
			validMimeTypes: ['application/vnd.ms-powerpoint.slideshow.macroEnabled.12'],
		},
		{
			extension: 'odp',
			application: 'OpenDocument Presentation',
			validMimeTypes: ['application/vnd.oasis.opendocument.presentation'],
		},

		{
			extension: 'otp',
			application: 'OpenDocument Presentation Template',
			validMimeTypes: ['application/vnd.oasis.opendocument.presentation-template'],
		},
	],

	Audio: [
		{ extension: 'mp3', application: 'MPEG Audio Layer III', validMimeTypes: ['audio/mpeg'] },
		{ extension: 'ogg', application: 'OGG Vorbis Audio', validMimeTypes: ['audio/ogg'] },
		{ extension: 'oga', application: 'OGG Audio', validMimeTypes: ['audio/ogg'] },
		{ extension: 'opus', application: 'Opus Audio', validMimeTypes: ['audio/opus'] },
		{ extension: 'aac', application: 'Advanced Audio Codec (AAC)', validMimeTypes: ['audio/aac'] },
		{ extension: 'm4a', application: 'MPEG-4 Audio', validMimeTypes: ['audio/mp4'] },
		{ extension: 'm4b', application: 'MPEG-4 Audiobook', validMimeTypes: ['audio/mp4'] },
		{ extension: 'm4p', application: 'MPEG-4 Protected Audio', validMimeTypes: ['audio/mp4'] },
		{
			extension: 'wav',
			application: 'Waveform Audio Format',
			validMimeTypes: ['audio/wav', 'audio/x-wav'],
		},
		{ extension: 'flac', application: 'Free Lossless Audio Codec', validMimeTypes: ['audio/flac'] },
		{ extension: 'alac', application: 'Apple Lossless Audio Codec' },
		{ extension: 'wma', application: 'Windows Media Audio', validMimeTypes: ['audio/x-ms-wma'] },
		{ extension: 'amr', application: 'Adaptive Multi-Rate Audio', validMimeTypes: ['audio/amr'] },
		{ extension: 'awb', application: 'Adaptive Multi-Rate Wideband Audio' },
		{ extension: 'ape', application: "Monkey's Audio" },
		{ extension: 'wv', application: 'WavPack Audio' },
		{ extension: 'tta', application: 'True Audio' },
		{ extension: 'dsf', application: 'DSD Stream File' },
		{ extension: 'dff', application: 'DSD Interchange File' },
		{ extension: 'mid', application: 'MIDI Sequence', validMimeTypes: ['audio/midi'] },
		{ extension: 'midi', application: 'MIDI Sequence', validMimeTypes: ['audio/midi'] },
		{ extension: 'kar', application: 'Karaoke MIDI' },
		{ extension: 'sf2', application: 'SoundFont 2' },
		{ extension: 'sfz', application: 'SFZ Instrument File' },
		{ extension: 'flp', application: 'FL Studio Project File' },
		{ extension: 'als', application: 'Ableton Live Set' },
		{ extension: 'alc', application: 'Ableton Live Clip' },
		{ extension: 'cpr', application: 'Cubase Project File' },
		{ extension: 'npr', application: 'Nuendo Project File' },
		{ extension: 'sesx', application: 'Adobe Audition Session File' },
		{ extension: 'omf', application: 'Open Media Framework File' },
		{ extension: 'ptx', application: 'Pro Tools Session' },
		{ extension: 'ptf', application: 'Pro Tools 7-9 Session' },
		{ extension: 'dss', application: 'Digital Speech Standard' },
		{ extension: 'ds2', application: 'Digital Speech Standard 2' },
		{ extension: 'vox', application: 'Dialogic ADPCM Audio' },
		{ extension: 'ra', application: 'RealAudio' },
		{ extension: 'm3u', application: 'MP3 Playlist File', validMimeTypes: ['audio/x-mpegurl'] },
		{
			extension: 'm3u8',
			application: 'M3U Extended Playlist',
			validMimeTypes: ['application/vnd.apple.mpegurl', 'audio/m3u8'],
		},
		{ extension: 'pls', application: 'Playlist File' },
		{ extension: 'asx', application: 'Advanced Stream Redirector' },
		{ extension: 'xspf', application: 'XML Shareable Playlist Format' },
		{ extension: 'bwf', application: 'Broadcast Wave Format' },
		{
			extension: 'aiff',
			application: 'Audio Interchange File Format',
			validMimeTypes: ['audio/aiff'],
		},
		{
			extension: 'aif',
			application: 'Audio Interchange File Format',
			validMimeTypes: ['audio/x-aiff'],
		},
		{ extension: 'aifc', application: 'Compressed AIFF Audio' },
		{ extension: 'caf', application: 'Apple Core Audio Format' },
		{ extension: 'mp2', application: 'MPEG Audio Layer II' },
		{ extension: 'spx', application: 'Speex Audio Format' },
		{ extension: 'au', application: 'Sun Microsystems Audio' },
		{ extension: 'snd', application: 'Sound File Format' },
		{ extension: 'vgm', application: 'Video Game Music File' },
		{ extension: 'spc', application: 'SNES Sound File' },
		{ extension: 'gbs', application: 'Game Boy Sound File' },
		{ extension: '2sf', application: 'Nintendo DS Sound File' },
		{ extension: 'ssf', application: 'Sega Saturn Sound File' },
		{ extension: 'usf', application: 'Nintendo 64 Sound Format' },
		{ extension: 'cda', application: 'CD Audio Track' },
		{ extension: 'voc', application: 'Creative Voice File' },
		{ extension: 'sid', application: 'Commodore 64 SID Music' },
		{ extension: 'mod', application: 'Tracker Module Format' },
		{ extension: 'xm', application: 'FastTracker 2 Extended Module' },
		{ extension: 'it', application: 'Impulse Tracker Module' },
		{ extension: 's3m', application: 'Scream Tracker Module' },

		{ extension: 'aax', application: 'Audible Enhanced Audiobook' },
		{ extension: 'ac3', application: 'Dolby Digital Audio' },
		{ extension: 'dts', application: 'DTS Audio' },
		{ extension: 'mka', application: 'Matroska Audio' },
	],

	Video: [
		{ extension: 'mp4', application: 'MPEG-4 Video', validMimeTypes: ['video/mp4'] },
		{ extension: 'm4v', application: 'MPEG-4 Video', validMimeTypes: ['video/x-m4v'] },
		{ extension: 'mov', application: 'QuickTime Video', validMimeTypes: ['video/quicktime'] },
		{ extension: 'avi', application: 'AVI Video', validMimeTypes: ['video/x-msvideo'] },
		{ extension: 'wmv', application: 'Windows Media Video', validMimeTypes: ['video/x-ms-wmv'] },
		{
			extension: 'asf',
			application: 'Advanced Systems Format',
			validMimeTypes: ['video/x-ms-asf'],
		},
		{ extension: 'mkv', application: 'Matroska Video', validMimeTypes: ['video/x-matroska'] },
		{ extension: 'webm', application: 'WebM Video', validMimeTypes: ['video/webm'] },
		{ extension: 'flv', application: 'Flash Video', validMimeTypes: ['video/x-flv'] },
		{ extension: 'f4v', application: 'Adobe Flash MP4', validMimeTypes: ['video/x-f4v'] },
		{ extension: '3gp', application: '3GPP Video', validMimeTypes: ['video/3gpp'] },
		{ extension: '3g2', application: '3GPP2 Video', validMimeTypes: ['video/3gpp2'] },
		{ extension: 'ogv', application: 'OGG Video', validMimeTypes: ['video/ogg'] },
		{ extension: 'mts', application: 'MPEG Transport Stream' },
		{ extension: 'm2ts', application: 'Blu-ray MPEG-2 Transport Stream' },
		{ extension: 'vob', application: 'DVD Video Object', validMimeTypes: ['video/dvd'] },
		{ extension: 'ifo', application: 'DVD Information File' },
		{ extension: 'bup', application: 'DVD Backup File' },
		{ extension: 'mxf', application: 'Material Exchange Format' },
		{ extension: 'gxf', application: 'General eXchange Format' },
		{
			extension: 'rm',
			application: 'RealMedia Video',
			validMimeTypes: ['application/vnd.rn-realmedia'],
		},
		{ extension: 'rmvb', application: 'RealMedia Variable Bitrate' },
		{ extension: 'divx', application: 'DivX Video Format' },
		{ extension: 'xvid', application: 'XviD Encoded Video' },
		{ extension: 'dvr-ms', application: 'Windows Media Center Recorded TV Show' },
		{ extension: 'amv', application: 'Anime Music Video Format' },
		{ extension: 'yuv', application: 'YUV Encoded Video' },
		{ extension: 'vp8', application: 'VP8 Encoded Video' },
		{ extension: 'vp9', application: 'VP9 Encoded Video' },
		{ extension: 'hevc', application: 'High Efficiency Video Codec (H.265)' },
		{ extension: 'h264', application: 'Advanced Video Codec (H.264)' },
		{ extension: 'h265', application: 'High Efficiency Video Codec (H.265)' },
		{ extension: 'av1', application: 'AOMedia Video 1 (AV1)' },
		{ extension: 'prores', application: 'Apple ProRes' },
		{ extension: 'cineform', application: 'GoPro CineForm Codec' },
		{ extension: 'dnxhd', application: 'Avid DNxHD Codec' },
		{ extension: 'braw', application: 'Blackmagic RAW Video' },
		{ extension: 'ser', application: 'SER Astronomy Video Format' },
		{ extension: 'mjpg', application: 'Motion JPEG Video' },
		{ extension: 'mj2', application: 'Motion JPEG 2000' },
		{ extension: 'ivf', application: 'Indeo Video Format' },
		{ extension: 'ivr', application: 'Internet Video Recording' },
		{ extension: 'vrvideo', application: 'Virtual Reality Video' },
		{ extension: 'tiffseq', application: 'TIFF Image Sequence' },
		{ extension: 'dpx', application: 'Digital Picture Exchange (DPX)' },
		{ extension: 'cin', application: 'Cineon Image File' },
		{ extension: 'fli', application: 'Autodesk FLI Animation' },
		{ extension: 'flc', application: 'Autodesk FLC Animation' },
		{ extension: 'mve', application: 'Interplay MVE Video' },
		{ extension: 'rpl', application: 'Replay Video Format' },
		{ extension: 'smk', application: 'Smacker Video' },

		{ extension: 'mpeg', application: 'MPEG Video' },
		{ extension: 'mpg', application: 'MPEG Video' },
		{ extension: 'mpe', application: 'MPEG Video' },
		{ extension: 'ts', application: 'MPEG Transport Stream' },
		{ extension: 'm2v', application: 'MPEG-2 Video' },

		{ extension: 'srt', application: 'SubRip Subtitle', validMimeTypes: ['application/x-subrip'] },
		{ extension: 'vtt', application: 'Web Video Text Tracks', validMimeTypes: ['text/vtt'] },
		{ extension: 'sub', application: 'MicroDVD Subtitle' },
		{ extension: 'sbv', application: 'YouTube Subtitle' },
		{ extension: 'ass', application: 'Advanced Substation Alpha' },
		{ extension: 'ssa', application: 'Substation Alpha' },
	],

	Image: [
		{ extension: 'jpg', application: 'JPEG Image', validMimeTypes: ['image/jpeg'] },
		{ extension: 'jpeg', application: 'JPEG Image', validMimeTypes: ['image/jpeg'] },
		{ extension: 'png', application: 'PNG Image', validMimeTypes: ['image/png'] },
		{ extension: 'gif', application: 'GIF Image', validMimeTypes: ['image/gif'] },
		{ extension: 'bmp', application: 'Bitmap Image', validMimeTypes: ['image/bmp'] },
		{ extension: 'webp', application: 'WebP Image', validMimeTypes: ['image/webp'] },
		{ extension: 'apng', application: 'Animated PNG', validMimeTypes: ['image/apng'] },
		{ extension: 'ico', application: 'Icon File', validMimeTypes: ['image/vnd.microsoft.icon'] },
		{ extension: 'tiff', application: 'TIFF Image', validMimeTypes: ['image/tiff'] },
		{ extension: 'tif', application: 'TIFF Image', validMimeTypes: ['image/tiff'] },
		{
			extension: 'heif',
			application: 'High Efficiency Image Format',
			validMimeTypes: ['image/heif'],
		},
		{
			extension: 'heic',
			application: 'High Efficiency Image Codec',
			validMimeTypes: ['image/heic'],
		},
		{ extension: 'jp2', application: 'JPEG 2000', validMimeTypes: ['image/jp2'] },
		{ extension: 'j2k', application: 'JPEG 2000', validMimeTypes: ['image/jp2'] },
		{ extension: 'exr', application: 'OpenEXR', validMimeTypes: ['image/x-exr'] },
		{ extension: 'hdr', application: 'Radiance HDR', validMimeTypes: ['image/vnd.radiance'] },
		{
			extension: 'psd',
			application: 'Adobe Photoshop Document',
			validMimeTypes: ['image/vnd.adobe.photoshop'],
		},
		{ extension: 'xcf', application: 'GIMP Image Format' },
		{ extension: 'dds', application: 'DirectDraw Surface', validMimeTypes: ['image/vnd.ms-dds'] },
		{ extension: 'pcx', application: 'ZSoft PCX', validMimeTypes: ['image/x-pcx'] },
		{ extension: 'iff', application: 'Amiga Interchange File Format' },
		{ extension: 'tga', application: 'Truevision TGA', validMimeTypes: ['image/x-targa'] },
		{ extension: 'icns', application: 'Apple Icon Image' },
		{ extension: 'procreate', application: 'Procreate Image' },
		{ extension: 'raw', application: 'General RAW Image Format' },
		{ extension: 'cr2', application: 'Canon RAW Image' },
		{ extension: 'cr3', application: 'Canon RAW Image' },
		{ extension: 'nef', application: 'Nikon RAW Image' },
		{ extension: 'nrw', application: 'Nikon RAW Image' },
		{ extension: 'arw', application: 'Sony RAW Image' },
		{ extension: 'srf', application: 'Sony RAW Image' },
		{ extension: 'sr2', application: 'Sony RAW Image' },
		{ extension: 'orf', application: 'Olympus RAW Image' },
		{ extension: 'rw2', application: 'Panasonic RAW Image' },
		{ extension: 'raf', application: 'Fuji RAW Image' },
		{ extension: 'dng', application: 'Adobe Digital Negative' },
		{ extension: 'pef', application: 'Pentax RAW Image' },
		{ extension: 'bay', application: 'Casio RAW Image' },
		{ extension: 'rwl', application: 'Leica RAW Image' },
		{ extension: 'ktx', application: 'Khronos Texture Format' },
		{ extension: 'pvr', application: 'PowerVR Texture Compression' },
		{ extension: 'txd', application: 'RenderWare Texture Dictionary' },
		{ extension: 'vtf', application: 'Valve Texture Format' },
		{ extension: 'anm', application: 'Animation Frame Sequence' },
		{ extension: 'flif', application: 'Free Lossless Image Format' },
		{ extension: 'jp3', application: 'JPEG 3000 Legacy Format' },
		{ extension: 'jbig', application: 'JBIG Image Format' },
		{ extension: 'jbig2', application: 'JBIG2 Image Format' },
		{ extension: 'xpm', application: 'X PixMap Format' },
		{ extension: 'sun', application: 'Sun Raster Image' },
		{ extension: 'sgi', application: 'Silicon Graphics Image' },
		{ extension: 'ras', application: 'Sun Raster Image' },
		{ extension: 'pgm', application: 'Portable GrayMap' },
		{ extension: 'pbm', application: 'Portable Bitmap' },
		{ extension: 'ppm', application: 'Portable PixMap' },
		{ extension: 'xbm', application: 'X Bitmap Image' },
		{ extension: 'mng', application: 'Multiple-image Network Graphics' },
		{ extension: 'jps', application: 'JPEG Stereo Image' },
		{ extension: 'mpo', application: 'Multi-Picture Object' },
		{ extension: 'dcx', application: 'Multi-Page PCX' },
		{ extension: 'otb', application: 'Nokia Over The Air Bitmap' },
		{ extension: 'pgf', application: 'Progressive Graphics Format' },
	],

	Vector: [
		{
			extension: 'svg',
			application: 'Scalable Vector Graphics',
			validMimeTypes: ['image/svg+xml'],
		},
		{
			extension: 'eps',
			application: 'Encapsulated PostScript',
			validMimeTypes: ['application/postscript'],
		},
		{
			extension: 'ai',
			application: 'Adobe Illustrator File',
			validMimeTypes: ['application/postscript'],
		},
		{ extension: 'cdr', application: 'CorelDRAW File' },
		{ extension: 'emf', application: 'Enhanced Metafile' },
		{ extension: 'wmf', application: 'Windows Metafile' },
		{ extension: 'sketch', application: 'Sketch Design File' },
		{ extension: 'fig', application: 'Figma Design File' },
		{ extension: 'xd', application: 'Adobe XD File' },
		{ extension: 'cgm', application: 'Computer Graphics Metafile' },
		{ extension: 'fxg', application: 'Flash XML Graphics File' },
		{ extension: 'pict', application: 'Apple PICT File' },
		{ extension: 'swf', application: 'Shockwave Flash Vector File' },
		{ extension: 'xar', application: 'Xara Vector File' },

		{ extension: 'shp', application: 'ESRI Shapefile' },
		{ extension: 'shx', application: 'ESRI Shapefile Index' },
		{ extension: 'dbf', application: 'Shapefile Database Format' },
		{ extension: 'geojson', application: 'Geospatial JSON File' },
		{ extension: 'topojson', application: 'Topological JSON File' },
		{ extension: 'gpx', application: 'GPS Exchange Format' },
		{ extension: 'kml', application: 'Keyhole Markup Language' },
		{ extension: 'kmz', application: 'Compressed KML File' },
		{ extension: 'gml', application: 'Geography Markup Language' },
		{ extension: 'dgn', application: 'MicroStation Design File' },
	],

	Medical: [
		{ extension: 'dcm', application: 'DICOM Medical Image', validMimeTypes: ['application/dicom'] },
		{ extension: 'nii', application: 'NIfTI Neuroimaging Format' },
		{ extension: 'mha', application: 'MetaImage Format' },
		{ extension: 'mhd', application: 'MetaImage Format Header' },
	],

	Scientific: [
		{ extension: 'fits', application: 'Flexible Image Transport System (FITS)' },
		{ extension: 'czi', application: 'Carl Zeiss Image Data Format' },
		{ extension: 'lif', application: 'Leica Image File' },
		{ extension: 'nd2', application: 'Nikon ND2 Microscopy Image' },
		{ extension: 'gel', application: 'Gel Electrophoresis Image' },
		{ extension: 'spe', application: 'Spectral Imaging File' },
	],

	Compression: [
		{ extension: 'zip', validMimeTypes: ['application/zip'] },
		{ extension: 'rar', validMimeTypes: ['application/vnd.rar'] },
		{ extension: '7z', validMimeTypes: ['application/x-7z-compressed'] },
		{ extension: 'tar', validMimeTypes: ['application/x-tar'] },
		{ extension: 'gz', validMimeTypes: ['application/gzip'] },
		{ extension: 'tgz', validMimeTypes: ['application/gzip'] },
		{ extension: 'bz2', validMimeTypes: ['application/x-bzip2'] },
		{ extension: 'xz', validMimeTypes: ['application/x-xz'] },
		{ extension: 'zst', validMimeTypes: ['application/zstd'] },

		{ extension: 'lz4', application: 'LZ4 Compressed File' },
		{ extension: 'lz', application: 'Lzip Compressed File' },
		{ extension: 'lzma', application: 'LZMA Compressed File' },
	],

	Executable: [
		{
			extension: 'exe',
			application: 'Windows Executable',
			validMimeTypes: ['application/x-msdownload'],
		},
		{ extension: 'msi', application: 'Windows Installer', validMimeTypes: ['application/x-msi'] },
		{
			extension: 'dmg',
			application: 'Apple Disk Image',
			validMimeTypes: ['application/x-apple-diskimage'],
		},
		{
			extension: 'apk',
			application: 'Android Package',
			validMimeTypes: ['application/vnd.android.package-archive'],
		},
		{
			extension: 'ipa',
			application: 'iOS App Store Package',
			validMimeTypes: ['application/octet-stream'],
		},
		{
			extension: 'deb',
			application: 'Debian Software Package',
			validMimeTypes: ['application/vnd.debian.binary-package'],
		},
		{
			extension: 'rpm',
			application: 'Red Hat Package Manager',
			validMimeTypes: ['application/x-rpm'],
		},
		{
			extension: 'iso',
			application: 'Disc Image File',
			validMimeTypes: ['application/x-iso9660-image'],
		},
		{ extension: 'img', application: 'Disk Image File' },
		{
			extension: 'dll',
			application: 'Dynamic Link Library',
			validMimeTypes: ['application/x-msdownload'],
		},

		{ extension: 'pkg', application: 'macOS Installer Package' },
		{ extension: 'app', application: 'macOS App Bundle (Directory)' },
	],

	Code: [
		{
			extension: 'js',
			application: 'JavaScript',
			validMimeTypes: ['text/javascript', 'application/javascript'],
		},
		{ extension: 'mjs', application: 'ES Modules JavaScript' },
		{ extension: 'cjs', application: 'CommonJS JavaScript' },
		{ extension: 'ts', application: 'TypeScript', validMimeTypes: ['application/typescript'] },
		{ extension: 'tsx', application: 'TypeScript JSX' },
		{ extension: 'jsx', application: 'JavaScript JSX' },
		{ extension: 'java', application: 'Java', validMimeTypes: ['text/x-java-source'] },
		{ extension: 'kt', application: 'Kotlin', validMimeTypes: ['text/x-kotlin'] },
		{ extension: 'kts', application: 'Kotlin Script' },
		{ extension: 'py', application: 'Python', validMimeTypes: ['text/x-python'] },
		{ extension: 'pyc', application: 'Compiled Python File' },
		{ extension: 'pyo', application: 'Optimized Python File' },
		{ extension: 'rpy', application: "Ren'Py Script" },
		{ extension: 'rb', application: 'Ruby', validMimeTypes: ['text/x-ruby'] },
		{ extension: 'php', application: 'PHP', validMimeTypes: ['application/x-httpd-php'] },
		{ extension: 'swift', application: 'Swift' },
		{ extension: 'go', application: 'Go', validMimeTypes: ['text/x-go'] },
		{ extension: 'rs', application: 'Rust' },
		{ extension: 'dart', application: 'Dart', validMimeTypes: ['application/dart'] },
		{ extension: 'lua', application: 'Lua', validMimeTypes: ['text/x-lua'] },
		{ extension: 'r', application: 'R Language', validMimeTypes: ['text/x-r'] },
		{ extension: 'pl', application: 'Perl', validMimeTypes: ['text/x-perl'] },
		{ extension: 'tcl', application: 'Tcl Script' },
		{ extension: 'sh', application: 'Shell Script', validMimeTypes: ['application/x-sh'] },
		{ extension: 'bash', application: 'Bash Script' },
		{ extension: 'zsh', application: 'Zsh Script' },
		{ extension: 'fish', application: 'Fish Shell Script' },
		{ extension: 'ps1', application: 'PowerShell Script' },
		{ extension: 'bat', application: 'Batch Script' },
		{ extension: 'cmd', application: 'Windows Command Script' },
		{ extension: 'ahk', application: 'AutoHotkey Script' },
		{ extension: 'c', application: 'C Language', validMimeTypes: ['text/x-csrc'] },
		{ extension: 'i', application: 'C Preprocessed File' },
		{ extension: 'cpp', application: 'C++', validMimeTypes: ['text/x-c++src'] },
		{ extension: 'cc', application: 'C++' },
		{ extension: 'cxx', application: 'C++' },
		{ extension: 'h', application: 'C Header File' },
		{ extension: 'hpp', application: 'C++ Header File' },
		{ extension: 'cs', application: 'C#', validMimeTypes: ['text/x-csharp'] },
		{ extension: 'fs', application: 'F#' },
		{ extension: 'ml', application: 'OCaml/ML' },
		{ extension: 'nim', application: 'Nim Language' },
		{ extension: 'html', application: 'HTML', validMimeTypes: ['text/html'] },
		{ extension: 'htm', application: 'HTML', validMimeTypes: ['text/html'] },
		{ extension: 'css', application: 'CSS', validMimeTypes: ['text/css'] },
		{ extension: 'scss', application: 'SASS/SCSS' },
		{ extension: 'sass', application: 'SASS/SCSS' },
		{ extension: 'less', application: 'LESS' },
		{ extension: 'vue', application: 'Vue.js' },
		{ extension: 'svelte', application: 'Svelte' },
		{ extension: 'astro', application: 'Astro' },
		{ extension: 'jsonc', application: 'JSON with Comments' },
		{ extension: 'json5', application: 'JSON5' },
		{ extension: 'lock', application: 'Lockfile' },
		{ extension: 'vbs', application: 'VBScript' },
		{ extension: 'wsf', application: 'Windows Script File' },
		{ extension: 'asm', application: 'Assembly Language' },
		{ extension: 's', application: 'Assembly Language' },
		{ extension: 'a51', application: 'Assembly 8051' },
		{ extension: 'm68k', application: 'Motorola 68K Assembly' },
		{ extension: 'vhdl', application: 'VHDL Hardware Description' },
		{ extension: 'verilog', application: 'Verilog Hardware Description' },
		{ extension: 'v', application: 'Verilog' },
		{ extension: 'sv', application: 'SystemVerilog' },
		{ extension: 'clj', application: 'Clojure' },
		{ extension: 'cljs', application: 'ClojureScript' },
		{ extension: 'lisp', application: 'Lisp' },
		{ extension: 'el', application: 'Emacs Lisp' },
		{ extension: 'scm', application: 'Scheme' },
		{ extension: 'pro', application: 'Prolog' },
		{ extension: 'awk', application: 'AWK Script' },
		{ extension: 'sed', application: 'SED Script' },
		{ extension: 'wasm', application: 'WebAssembly Binary File' },
		{ extension: 'wast', application: 'WebAssembly Text File' },
		{ extension: 'godot', application: 'Godot Engine Script' },
		{ extension: 'pck', application: 'Godot Engine Pack' },
		{ extension: 'gd', application: 'GDScript' },
		{ extension: 'makefile', application: 'Makefile' },
		{ extension: 'ninja', application: 'Ninja Build File' },
		{ extension: 'cmake', application: 'CMake Build Script' },
		{ extension: 'gradle', application: 'Gradle Build Script' },
		{ extension: 'maven', application: 'Maven POM File' },
		{ extension: 'graphql', application: 'GraphQL Schema' },
		{ extension: 'cloudfunctions', application: 'Google Cloud Functions' },
		{ extension: 'lambda', application: 'AWS Lambda Function' },
		{ extension: 'serverless.yml', application: 'Serverless Framework' },
		{
			extension: 'tf',
			application: 'Terraform Configuration',
			validMimeTypes: ['application/hcl'],
		},
		{ extension: 'tfvars', application: 'Terraform Variables' },
		{ extension: 'toml', application: 'TOML Configuration', validMimeTypes: ['application/toml'] },
		{ extension: 'dockerfile', application: 'Docker Build File' },
		{
			extension: 'ipynb',
			application: 'Jupyter Notebook',
			validMimeTypes: ['application/x-ipynb+json'],
		},
		{ extension: 'prisma', application: 'Prisma Schema' },
		{ extension: 'repl', application: 'REPL Script' },
		{ extension: 'robots.txt', application: 'Robots.txt for Web Crawlers' },
		{ extension: 'htaccess', application: 'Apache Configuration' },
		{ extension: 'htpasswd', application: 'Apache User Password File' },
	],

	'3D': [
		{ extension: 'obj', application: 'Wavefront OBJ File', validMimeTypes: ['model/obj'] },
		{ extension: 'mtl', application: 'Wavefront Material File' },
		{ extension: 'fbx', application: 'Autodesk FBX Format' },
		{
			extension: 'dae',
			application: 'COLLADA 3D Model Format',
			validMimeTypes: ['model/vnd.collada+xml'],
		},
		{
			extension: 'gltf',
			application: 'GL Transmission Format',
			validMimeTypes: ['model/gltf+json'],
		},
		{ extension: 'glb', application: 'Binary GLTF Model', validMimeTypes: ['model/gltf-binary'] },
		{ extension: 'stl', application: 'Stereolithography 3D Model', validMimeTypes: ['model/stl'] },
		{ extension: '3ds', application: '3D Studio Mesh' },
		{ extension: 'max', application: 'Autodesk 3ds Max Scene' },
		{ extension: 'blend', application: 'Blender Project File' },
		{ extension: 'abc', application: 'Alembic 3D File' },
		{ extension: 'usd', application: 'Universal Scene Description' },
		{ extension: 'usda', application: 'Universal Scene Description ASCII' },
		{ extension: 'usdz', application: 'Universal Scene Description Zip Archive' },
		{ extension: 'rvt', application: 'Autodesk Revit Model' },
		{ extension: 'rfa', application: 'Autodesk Revit Family File' },
		{ extension: 'skp', application: 'SketchUp Model' },
		{ extension: 'layout', application: 'SketchUp Layout File' },
		{ extension: 'pln', application: 'ArchiCAD Project File' },
		{ extension: 'gsm', application: 'ArchiCAD Library Object File' },
		{ extension: '3dm', application: 'Rhinoceros 3D Model File' },
		{ extension: 'igs', application: 'IGES Model File', validMimeTypes: ['model/iges'] },
		{
			extension: 'iges',
			application: 'Initial Graphics Exchange Specification',
			validMimeTypes: ['model/iges'],
		},
		{ extension: 'step', application: 'STEP 3D Model File', validMimeTypes: ['model/step'] },
		{ extension: 'stp', application: 'STEP 3D Model File', validMimeTypes: ['model/step'] },
		{ extension: 'x_t', application: 'Parasolid Model File' },
		{ extension: 'x_b', application: 'Parasolid Binary File' },
		{ extension: 'brep', application: 'Boundary Representation Model' },
		{ extension: 'sldprt', application: 'SolidWorks Part File' },
		{ extension: 'sldasm', application: 'SolidWorks Assembly File' },
		{ extension: 'slddrw', application: 'SolidWorks Drawing File' },
		{ extension: 'prt', application: 'PTC Creo Part File' },
		{ extension: 'neu', application: 'Neutral CAD File' },
		{ extension: 'ifc', application: 'Industry Foundation Classes (IFC)' },
		{ extension: 'ifczip', application: 'Compressed IFC File' },
		{ extension: 'sat', application: 'ACIS SAT 3D Model' },
		{ extension: 'catpart', application: 'CATIA Part File' },
		{ extension: 'catproduct', application: 'CATIA Product File' },
		{ extension: 'cgr', application: 'CATIA Graphical Representation' },
		{
			extension: 'gcode',
			application: 'G-Code CNC Instructions',
			validMimeTypes: ['text/x-gcode'],
		},
		{ extension: 'nc', application: 'Numerical Control File' },
		{ extension: 'tap', application: 'CNC Machine Toolpath File' },
		{ extension: '3mf', application: '3D Manufacturing Format' },
		{ extension: 'x3d', application: 'Extensible 3D Graphics' },
		{ extension: 'wrl', application: 'VRML Virtual Reality Modeling Language' },
		{ extension: 'ply', application: 'Polygon File Format' },
		{ extension: 'bvh', application: 'Biovision Hierarchy Animation' },
		{ extension: 'c3d', application: 'C3D Motion Capture Data' },
		{ extension: 'anim', application: 'Maya Animation File' },
		{ extension: 'xaf', application: '3ds Max Animation File' },
		{ extension: 'xsf', application: '3ds Max Skeleton File' },
		{ extension: 'mdd', application: 'Motion Designer Data' },
		{ extension: 'vrm', application: 'Virtual Reality Model' },
		{ extension: 'scn', application: 'Godot Engine Scene' },
		{ extension: 'res', application: 'Godot Engine Resource' },
		{ extension: 'unitypackage', application: 'Unity Package File' },
		{ extension: 'prefab', application: 'Unity Prefab File' },
		{ extension: 'uasset', application: 'Unreal Engine Asset File' },
		{ extension: 'umap', application: 'Unreal Engine Map File' },
		{ extension: 'lwo', application: 'LightWave Object' },
		{ extension: 'lws', application: 'LightWave Scene' },
		{ extension: 'cob', application: 'Caligari TrueSpace Object' },
		{ extension: 'x', application: 'DirectX 3D Model' },
		{ extension: 'ac', application: 'AC3D Model File' },
		{ extension: 'iv', application: 'Open Inventor File' },
	],

	Database: [
		{ extension: 'db', application: 'Generic Database File' },
		{
			extension: 'sqlite',
			application: 'SQLite Database File',
			validMimeTypes: ['application/vnd.sqlite3'],
		},
		{ extension: 'sqlite3', application: 'SQLite 3 Database File' },
		{ extension: 'db3', application: 'SQLite 3 Database File' },
		{
			extension: 'mdb',
			application: 'Microsoft Access Database',
			validMimeTypes: ['application/x-msaccess'],
		},
		{
			extension: 'accdb',
			application: 'Microsoft Access Database (2007+)',
			validMimeTypes: ['application/vnd.ms-access'],
		},
		{ extension: 'frm', application: 'MySQL Table Definition File' },
		{ extension: 'myd', application: 'MySQL Data File' },
		{ extension: 'myi', application: 'MySQL Index File' },
		{
			extension: 'sql',
			application: 'Structured Query Language Script',
			validMimeTypes: ['application/sql'],
		},
		{ extension: 'bak', application: 'Database Backup File' },
		{ extension: 'ibd', application: 'InnoDB Data File' },
		{ extension: 'mssql', application: 'Microsoft SQL Server Database' },
		{ extension: 'mdf', application: 'Microsoft SQL Server Primary Database File' },
		{ extension: 'ldf', application: 'Microsoft SQL Server Log File' },
		{ extension: 'ndf', application: 'Microsoft SQL Server Secondary Database File' },
		{ extension: 'ora', application: 'Oracle Database File' },
		{ extension: 'dmp', application: 'Oracle Database Dump File' },
		{ extension: 'accde', application: 'Microsoft Access Executable File' },
		{ extension: 'adp', application: 'Access Data Project' },
		{ extension: 'bson', application: 'Binary JSON (MongoDB Data File)' },
		{ extension: 'fdb', application: 'Firebird Database File' },
		{ extension: 'gdb', application: 'InterBase Database File' },
		{ extension: 'neo4j', application: 'Neo4j Graph Database File' },
		{ extension: 'arangodb', application: 'ArangoDB Database File' },
		{ extension: 'realm', application: 'Realm Database File' },
		{ extension: 'couchdb', application: 'CouchDB Database File' },
		{ extension: 'rdb', application: 'Redis Database File' },
		{ extension: 'dat', application: 'Generic Database Data File' },
		{ extension: 'rox', application: 'RocksDB Data File' },
		{ extension: 'ldb', application: 'LevelDB Database File' },
		{ extension: 'exp', application: 'Export File' },
		{ extension: 'bkp', application: 'Backup Database File' },
		{ extension: 'xsql', application: 'XML SQL Export File' },
		{ extension: 'wdb', application: 'Microsoft Works Database' },
		{ extension: 'sdf', application: 'SQL Server Compact Edition Database' },
		{ extension: 'pdb', application: 'Palm Database File' },
		{ extension: 'cdb', application: 'Pocket Access Database' },
		{ extension: 'cnf', application: 'Database Configuration File' },
		{ extension: 'cub', application: 'Analysis Services Cube File' },
		{ extension: 'olap', application: 'Online Analytical Processing Cube' },
		{ extension: 'vw', application: 'Database View File' },
		{ extension: 'nsf', application: 'Lotus Notes Database' },
		{ extension: 'ntf', application: 'Lotus Notes Template File' },
		{ extension: 'dbx', application: 'Outlook Express Database File' },
		{ extension: 'edb', application: 'Exchange Database File' },
		{ extension: 'fp3', application: 'FileMaker Pro 3 Database' },
		{ extension: 'fp5', application: 'FileMaker Pro 5 Database' },
		{ extension: 'fp7', application: 'FileMaker Pro 7 Database' },
		{ extension: 'gdbtable', application: 'ArcGIS Geodatabase Table File' },
		{ extension: 'gdbindex', application: 'ArcGIS Geodatabase Index File' },
	],

	Data: [
		{ extension: 'csv', application: 'Comma-Separated Values File', validMimeTypes: ['text/csv'] },
		{
			extension: 'tsv',
			application: 'Tab-Separated Values File',
			validMimeTypes: ['text/tab-separated-values'],
		},
		{ extension: 'psv', application: 'Pipe-Separated Values File' },
		{
			extension: 'json',
			application: 'JavaScript Object Notation',
			validMimeTypes: ['application/json'],
		},
		{ extension: 'jsonl', application: 'JSON Lines File', validMimeTypes: ['application/jsonl'] },
		{
			extension: 'xml',
			application: 'Extensible Markup Language',
			validMimeTypes: ['application/xml', 'text/xml'],
		},
		{
			extension: 'yaml',
			application: "YAML Ain't Markup Language",
			validMimeTypes: ['application/x-yaml'],
		},
		{
			extension: 'yml',
			application: "YAML Ain't Markup Language",
			validMimeTypes: ['application/x-yaml'],
		},
		{
			extension: 'rdf',
			application: 'Resource Description Framework',
			validMimeTypes: ['application/rdf+xml'],
		},
		{ extension: 'ttl', application: 'Turtle RDF Data' },
		{ extension: 'n3', application: 'Notation3 RDF Data' },
		{ extension: 'msgpack', application: 'MessagePack Serialized Data' },
		{ extension: 'ubj', application: 'Universal Binary JSON' },
		{ extension: 'arff', application: 'Attribute-Relation File Format (WEKA)' },
		{ extension: 'dta', application: 'Stata Data File' },
		{ extension: 'sav', application: 'SPSS Data File' },
		{ extension: 'por', application: 'SPSS Portable Data File' },
		{ extension: 'sd2', application: 'SAS Data File' },
		{ extension: 'xpt', application: 'SAS Transport File' },
		{ extension: 'rdata', application: 'R Statistical Data File' },
		{ extension: 'rds', application: 'R Serialized Data File' },
		{ extension: 'mat', application: 'MATLAB Data File' },
		{ extension: 'grib', application: 'GRIB Meteorological Data' },
		{ extension: 'pcap', application: 'Packet Capture File' },
		{ extension: 'pcapng', application: 'Packet Capture Next Generation' },
		{ extension: 'las', application: 'LIDAR Point Cloud Data' },
		{ extension: 'xyz', application: 'XYZ Point Cloud Data' },
		{ extension: 'fasta', application: 'FASTA Sequence File' },
		{ extension: 'fastq', application: 'FASTQ Sequence File' },
		{ extension: 'bam', application: 'Binary Alignment Map' },
		{ extension: 'sam', application: 'Sequence Alignment Map' },
		{ extension: 'vcf', application: 'Variant Call Format' },
		{ extension: 'gff', application: 'General Feature Format' },
		{ extension: 'gtf', application: 'Gene Transfer Format' },
		{ extension: 'pkl', application: 'Pickle Serialized Data' },
		{ extension: 'joblib', application: 'Joblib Serialized Model' },
		{ extension: 'npy', application: 'NumPy Binary File' },
		{ extension: 'npz', application: 'NumPy Compressed Archive' },
		{ extension: 'h5', application: 'HDF5 Data Format' },
		{ extension: 'pb', application: 'TensorFlow Model File' },
		{ extension: 'onnx', application: 'Open Neural Network Exchange Format' },
		{
			extension: 'parquet',
			application: 'Apache Parquet Data Format',
			validMimeTypes: ['application/vnd.apache.parquet'],
		},
		{ extension: 'avro', application: 'Apache Avro Data File' },
		{ extension: 'orc', application: 'Optimized Row Columnar Data File' },
		{ extension: 'feather', application: 'Feather Data File' },
		{ extension: 'zarr', application: 'Zarr Compressed Data File' },
		{ extension: 'log', application: 'Log File', validMimeTypes: ['text/plain'] },
		{ extension: 'ini', application: 'Configuration File' },
		{ extension: 'cfg', application: 'Configuration File' },
		{ extension: 'properties', application: 'Java Properties File' },

		{ extension: 'arrow', application: 'Apache Arrow File Format' },
	],

	Font: [
		{ extension: 'ttf', application: 'TrueType Font', validMimeTypes: ['font/ttf'] },
		{ extension: 'otf', application: 'OpenType Font', validMimeTypes: ['font/otf'] },
		{ extension: 'woff', application: 'Web Open Font Format', validMimeTypes: ['font/woff'] },
		{ extension: 'woff2', application: 'Web Open Font Format 2', validMimeTypes: ['font/woff2'] },
		{
			extension: 'eot',
			application: 'Embedded OpenType Font',
			validMimeTypes: ['application/vnd.ms-fontobject'],
		},
		{ extension: 'dfont', application: 'Mac OS Data Fork Font' },
		{ extension: 'bdf', application: 'Bitmap Distribution Format' },
		{ extension: 'pcf', application: 'Portable Compiled Format' },
		{ extension: 'fnt', application: 'Windows Bitmap Font' },
		{ extension: 'psf', application: 'PC Screen Font' },
		{ extension: 'pfb', application: 'PostScript Type 1 Font Binary' },
		{ extension: 'pfm', application: 'PostScript Type 1 Font Metrics' },
		{ extension: 'afm', application: 'Adobe Font Metrics' },
		{ extension: 'fon', application: 'Windows FON Bitmap Font' },
		{ extension: 'txf', application: 'Texture Font Format' },
		{ extension: 'ps', application: 'PostScript Font' },
		{ extension: 'chm', application: 'Compiled HTML Help Font' },
	],

	Security: [
		{
			extension: 'crt',
			application: 'Security Certificate',
			validMimeTypes: ['application/x-x509-ca-cert'],
		},
		{ extension: 'cer', application: 'Security Certificate' },
		{
			extension: 'pem',
			application: 'Privacy Enhanced Mail Certificate',
			validMimeTypes: ['application/x-pem-file'],
		},
		{ extension: 'key', application: 'Private Key File' },
		{ extension: 'pub', application: 'Public Key File' },
		{
			extension: 'p12',
			application: 'PKCS#12 Certificate Store',
			validMimeTypes: ['application/x-pkcs12'],
		},
		{
			extension: 'pfx',
			application: 'PKCS#12 Certificate Store',
			validMimeTypes: ['application/x-pkcs12'],
		},
		{ extension: 'asc', application: 'PGP Armored Key' },
		{ extension: 'gpg', application: 'GNU Privacy Guard Key' },
		{ extension: 'keystore', application: 'Java Keystore File' },
	],

	System: [
		{
			extension: 'sys',
			application: 'Windows System File',
			validMimeTypes: ['application/octet-stream'],
		},
		{
			extension: 'dll',
			application: 'Dynamic Link Library',
			validMimeTypes: ['application/x-msdownload'],
		},
		{ extension: 'drv', application: 'Windows Hardware Driver' },
		{ extension: 'cpl', application: 'Windows Control Panel Item' },
		{ extension: 'msc', application: 'Microsoft Management Console Snap-in' },
		{
			extension: 'reg',
			application: 'Windows Registry Entry',
			validMimeTypes: ['text/x-ms-regedit'],
		},
		{
			extension: 'inf',
			application: 'Setup Information File',
			validMimeTypes: ['application/inf'],
		},
		{
			extension: 'lnk',
			application: 'Windows Shortcut',
			validMimeTypes: ['application/x-ms-shortcut'],
		},
		{ extension: 'pif', application: 'Program Information File' },
		{ extension: 'cur', application: 'Windows Cursor' },
		{ extension: 'ani', application: 'Animated Windows Cursor' },
		{ extension: 'minidump', application: 'Windows Memory Dump' },
		{ extension: 'dmp', application: 'System Memory Dump' },
		{
			extension: 'cab',
			application: 'Windows Cabinet File',
			validMimeTypes: ['application/vnd.ms-cab-compressed'],
		},

		{ extension: 'ds_store', application: 'macOS Folder Settings' },
		{
			extension: 'plist',
			application: 'macOS Property List',
			validMimeTypes: ['application/x-plist'],
		},
		{ extension: 'kext', application: 'macOS Kernel Extension' },
		{ extension: 'webloc', application: 'macOS Web Shortcut' },
		{ extension: 'mobileconfig', application: 'Apple Configuration Profile' },

		{
			extension: 'so',
			application: 'Shared Object Library',
			validMimeTypes: ['application/x-sharedlib'],
		},
		{ extension: 'ko', application: 'Kernel Object Module' },
		{ extension: 'pid', application: 'Process ID File' },
		{ extension: 'sock', application: 'Unix Socket File' },
		{ extension: 'swap', application: 'Swap File' },
		{ extension: 'rc', application: 'Run Command Configuration' },

		{ extension: 'tmp', application: 'Temporary File' },
		{ extension: 'temp', application: 'Temporary File' },
		{ extension: 'bak', application: 'Generic Backup File' },
		{ extension: 'swp', application: 'Vim Swap File' },
		{ extension: 'old', application: 'Backup / Old Version File' },
		{ extension: 'log', application: 'System Log File', validMimeTypes: ['text/plain'] },
	],

	Email: [
		{ extension: 'eml', application: 'RFC 822 Email Message', validMimeTypes: ['message/rfc822'] },
		{ extension: 'msg', application: 'Outlook Message' },
		{ extension: 'mbox', application: 'Mailbox File' },
		{ extension: 'pst', application: 'Outlook Personal Storage Table' },
		{ extension: 'ost', application: 'Outlook Offline Storage Table' },

		{ extension: 'ics', application: 'iCalendar File', validMimeTypes: ['text/calendar'] },
		{ extension: 'vcf', application: 'vCard Contact File', validMimeTypes: ['text/vcard'] },
	],

	DiskImage: [
		{
			extension: 'iso',
			application: 'ISO Disc Image',
			validMimeTypes: ['application/x-iso9660-image'],
		},
		{ extension: 'img', application: 'Disk Image File' },
		{
			extension: 'dmg',
			application: 'Apple Disk Image',
			validMimeTypes: ['application/x-apple-diskimage'],
		},
		{ extension: 'sparsebundle', application: 'macOS Sparse Bundle Disk Image' },
		{ extension: 'toast', application: 'Roxio Toast Disc Image' },
	],

	VMImage: [
		{ extension: 'vhd', application: 'Virtual Hard Disk' },
		{ extension: 'vhdx', application: 'Virtual Hard Disk v2' },
		{ extension: 'vmdk', application: 'VMware Virtual Disk' },
		{ extension: 'vdi', application: 'VirtualBox Disk Image' },
		{ extension: 'qcow2', application: 'QEMU Copy-On-Write v2 Disk Image' },
		{ extension: 'ova', application: 'Open Virtual Appliance' },
		{ extension: 'ovf', application: 'Open Virtualization Format' },
	],

	ContainerImage: [
		{ extension: 'oci', application: 'OCI Image Layout' },
		{ extension: 'sif', application: 'Singularity Image Format' },
	],

	CAD: [
		{ extension: 'dwg', application: 'AutoCAD Drawing' },
		{ extension: 'dxf', application: 'Drawing Exchange Format' },
		{ extension: 'dwt', application: 'AutoCAD Drawing Template' },
		{ extension: 'dwf', application: 'Design Web Format' },
	],

	GIS: [
		{ extension: 'shp', application: 'ESRI Shapefile' },
		{ extension: 'shx', application: 'ESRI Shapefile Index' },
		{ extension: 'dbf', application: 'Shapefile Attribute Table' },
		{ extension: 'prj', application: 'Shapefile Projection' },
		{ extension: 'cpg', application: 'Shapefile Code Page' },
		{ extension: 'qpj', application: 'QGIS Projection File' },
		{ extension: 'geojson', application: 'GeoJSON' },
		{ extension: 'topojson', application: 'TopoJSON' },
		{ extension: 'kml', application: 'Keyhole Markup Language' },
		{ extension: 'kmz', application: 'Compressed KML' },
		{ extension: 'gpx', application: 'GPS Exchange Format' },
		{ extension: 'gml', application: 'Geography Markup Language' },

		{ extension: 'gpkg', application: 'GeoPackage' },
		{ extension: 'mbtiles', application: 'Mapbox MBTiles' },
	],

	Ebook: [
		{ extension: 'epub', application: 'EPUB eBook', validMimeTypes: ['application/epub+zip'] },
		{ extension: 'mobi', application: 'Mobipocket eBook' },
		{ extension: 'azw', application: 'Amazon Kindle eBook' },
		{ extension: 'azw3', application: 'Amazon Kindle eBook' },
		{ extension: 'kfx', application: 'Kindle Format 10 (KFX)' },
		{ extension: 'fb2', application: 'FictionBook eBook' },
		{ extension: 'ibooks', application: 'Apple iBooks' },
		{ extension: 'opf', application: 'Open Packaging Format (eBook metadata)' },
		{ extension: 'ncx', application: 'Navigation Control file for XML (eBook TOC)' },

		{ extension: 'cbz', application: 'Comic Book ZIP Archive' },
		{ extension: 'cbr', application: 'Comic Book RAR Archive' },
		{ extension: 'cb7', application: 'Comic Book 7-Zip Archive' },
	],

	Config: [
		{ extension: 'env', application: 'Environment Variables File (filename: .env)' },
		{ extension: 'editorconfig', application: 'EditorConfig (filename: .editorconfig)' },
		{ extension: 'gitignore', application: 'Git Ignore Rules (filename: .gitignore)' },
		{ extension: 'gitattributes', application: 'Git Attributes (filename: .gitattributes)' },
		{ extension: 'npmrc', application: 'npm Configuration (filename: .npmrc)' },
		{ extension: 'yarnrc', application: 'Yarn Configuration (filename: .yarnrc)' },
		{
			extension: 'yaml',
			application: "YAML Ain't Markup Language",
			validMimeTypes: ['application/x-yaml'],
		},
		{
			extension: 'yml',
			application: "YAML Ain't Markup Language",
			validMimeTypes: ['application/x-yaml'],
		},
		{ extension: 'toml', application: 'TOML Configuration', validMimeTypes: ['application/toml'] },
		{ extension: 'ini', application: 'INI Configuration' },
		{ extension: 'cfg', application: 'Config File' },
		{ extension: 'properties', application: 'Java Properties' },
		{ extension: 'json', application: 'JSON', validMimeTypes: ['application/json'] },
	],

	Package: [
		{ extension: 'jar', application: 'Java Archive' },
		{ extension: 'war', application: 'Web Application Archive' },
		{ extension: 'ear', application: 'Enterprise Application Archive' },

		{ extension: 'whl', application: 'Python Wheel Package' },

		{ extension: 'gem', application: 'RubyGems Package' },

		{ extension: 'nupkg', application: 'NuGet Package' },

		{ extension: 'xcarchive', application: 'Xcode Archive' },
	],
};

```

### File: packages\types\src\files\model.ts

```ts
export type FileStatus = 'pending' | 'processing' | 'ready' | 'error';
import { FileCategory } from './categories.ts';

export interface FileError {
	code: string;
	message: string;
}

export interface FileWithMeta {
	file: File;
	id?: string;
	preview?: string;
	status: FileStatus;
	progress: number;
	errors: FileError[];
	processingMeta?: Record<string, any>;
	type?: FileCategory | 'Other';
}

```

### File: packages\types\src\files\processing.ts

```ts
export interface ProcessorResult {
	file: File; // The new, processed file (e.g. image.webp)
	metadata?: Record<string, any>; // Extra info (e.g. { compressionRatio: '40%' })
}

export interface FileProcessor {
	id: string;
	name: string; // e.g. "Image Optimizer"
	match: (file: File) => boolean; // Does this processor handle this file?
	process: (file: File, onProgress?: (pct: number) => void) => Promise<ProcessorResult>;
}

```

### File: packages\types\src\finance\currency.ts

```ts
// lib/currencyCategories.ts

export type CurrencyCategory = 'Fiat' | 'Crypto' | 'Commodity';

export interface CurrencyDefinition {
	code: string;
	name: string;
	symbol: string;
	decimals: number;
}

export type CurrencyMap = Record<string, CurrencyDefinition[]>;

export const currencyCategories: CurrencyMap = {
	// 💵 TRADITIONAL GOVERNMENT BACKED CURRENCIES
	Fiat: [
		{ code: 'USD', name: 'United States Dollar', symbol: '$', decimals: 2 },
		{ code: 'EUR', name: 'Euro', symbol: '€', decimals: 2 },
		{ code: 'GBP', name: 'British Pound Sterling', symbol: '£', decimals: 2 },
		{ code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimals: 0 },
		{ code: 'CNY', name: 'Chinese Yuan', symbol: '¥', decimals: 2 },
		{ code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimals: 2 },
		{ code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', decimals: 2 },
		{ code: 'CHF', name: 'Swiss Franc', symbol: 'Fr', decimals: 2 },
		{ code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', decimals: 2 },
		{ code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', decimals: 2 },
		{ code: 'SEK', name: 'Swedish Krona', symbol: 'kr', decimals: 2 },
		{ code: 'KRW', name: 'South Korean Won', symbol: '₩', decimals: 0 },
		{ code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', decimals: 2 },
		{ code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', decimals: 2 },
		{ code: 'INR', name: 'Indian Rupee', symbol: '₹', decimals: 2 },
		{ code: 'MXN', name: 'Mexican Peso', symbol: '$', decimals: 2 },
		{ code: 'TWD', name: 'New Taiwan Dollar', symbol: 'NT$', decimals: 2 },
		{ code: 'ZAR', name: 'South African Rand', symbol: 'R', decimals: 2 },
		{ code: 'BRL', name: 'Brazilian Real', symbol: 'R$', decimals: 2 },
		{ code: 'DKK', name: 'Danish Krone', symbol: 'kr', decimals: 2 },
		{ code: 'PLN', name: 'Polish Złoty', symbol: 'zł', decimals: 2 },
		{ code: 'THB', name: 'Thai Baht', symbol: '฿', decimals: 2 },
		{ code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', decimals: 2 },
		{ code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', decimals: 2 },
		{ code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', decimals: 2 },
		{ code: 'ILS', name: 'Israeli New Shekel', symbol: '₪', decimals: 2 },
		{ code: 'CLP', name: 'Chilean Peso', symbol: '$', decimals: 0 },
		{ code: 'PHP', name: 'Philippine Peso', symbol: '₱', decimals: 2 },
		{ code: 'AED', name: 'United Arab Emirates Dirham', symbol: 'dh', decimals: 2 },
		{ code: 'COP', name: 'Colombian Peso', symbol: '$', decimals: 2 },
		{ code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', decimals: 2 },
		{ code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', decimals: 2 },
		{ code: 'RON', name: 'Romanian Leu', symbol: 'lei', decimals: 2 },
		{ code: 'VND', name: 'Vietnamese Đồng', symbol: '₫', decimals: 0 },
		{ code: 'ARS', name: 'Argentine Peso', symbol: '$', decimals: 2 },
		{ code: 'NGN', name: 'Nigerian Naira', symbol: '₦', decimals: 2 },
		{ code: 'TRY', name: 'Turkish Lira', symbol: '₺', decimals: 2 },
		{ code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', decimals: 2 },
		{ code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', decimals: 2 },
		{ code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', decimals: 2 },
	],

	// ⛓️ CRYPTOCURRENCIES (Blue chips & Major Chains)
	Crypto: [
		{ code: 'BTC', name: 'Bitcoin', symbol: '₿', decimals: 8 },
		{ code: 'ETH', name: 'Ethereum', symbol: 'Ξ', decimals: 18 },
		{ code: 'USDT', name: 'Tether', symbol: '₮', decimals: 6 },
		{ code: 'BNB', name: 'Binance Coin', symbol: 'BNB', decimals: 18 },
		{ code: 'SOL', name: 'Solana', symbol: 'SOL', decimals: 9 },
		{ code: 'USDC', name: 'USD Coin', symbol: '$', decimals: 6 },
		{ code: 'XRP', name: 'Ripple', symbol: 'XRP', decimals: 6 },
		{ code: 'ADA', name: 'Cardano', symbol: '₳', decimals: 6 },
		{ code: 'AVAX', name: 'Avalanche', symbol: 'AVAX', decimals: 18 },
		{ code: 'DOGE', name: 'Dogecoin', symbol: 'Ð', decimals: 8 },
		{ code: 'DOT', name: 'Polkadot', symbol: 'DOT', decimals: 10 },
		{ code: 'TRX', name: 'TRON', symbol: 'TRX', decimals: 6 },
		{ code: 'MATIC', name: 'Polygon', symbol: 'MATIC', decimals: 18 },
		{ code: 'LTC', name: 'Litecoin', symbol: 'Ł', decimals: 8 },
		{ code: 'SHIB', name: 'Shiba Inu', symbol: 'SHIB', decimals: 18 },
		{ code: 'DAI', name: 'Dai', symbol: '◈', decimals: 18 },
		{ code: 'BCH', name: 'Bitcoin Cash', symbol: 'Ƀ', decimals: 8 },
		{ code: 'ATOM', name: 'Cosmos', symbol: 'ATOM', decimals: 6 },
		{ code: 'UNI', name: 'Uniswap', symbol: 'UNI', decimals: 18 },
		{ code: 'LINK', name: 'Chainlink', symbol: 'LINK', decimals: 18 },
		{ code: 'XLM', name: 'Stellar', symbol: '*', decimals: 7 },
		{ code: 'XMR', name: 'Monero', symbol: '♏', decimals: 12 },
	],

	// 🏆 COMMODITIES & PRECIOUS METALS (ISO 4217 Standard Codes)
	Commodity: [
		{ code: 'XAU', name: 'Gold (Troy Ounce)', symbol: 'Au', decimals: 2 },
		{ code: 'XAG', name: 'Silver (Troy Ounce)', symbol: 'Ag', decimals: 2 },
		{ code: 'XPT', name: 'Platinum (Troy Ounce)', symbol: 'Pt', decimals: 2 },
		{ code: 'XPD', name: 'Palladium (Troy Ounce)', symbol: 'Pd', decimals: 2 },
		{ code: 'XCU', name: 'Copper', symbol: 'Cu', decimals: 2 },
		{ code: 'CL', name: 'Crude Oil (WTI)', symbol: '🛢️', decimals: 2 },
		{ code: 'BRN', name: 'Brent Crude Oil', symbol: '🛢️', decimals: 2 },
		{ code: 'NG', name: 'Natural Gas', symbol: '🔥', decimals: 2 },
	],
};

```

### File: packages\types\src\projects\enums.ts

```ts
// --- Status Enums ---

export enum ProjectStatus {
	Draft = 'draft',
	Active = 'active',
	OnHold = 'on_hold',
	Completed = 'completed',
	Cancelled = 'cancelled',
}

export enum StageStatus {
	Open = 'open',
	Assigned = 'assigned',
	InProgress = 'in_progress',
	Submitted = 'submitted',
	Approved = 'approved',
	Revisions = 'revisions',
	Paid = 'paid',
}

// --- Configuration Enums ---

export enum StageType {
	FileBased = 'file_based',
	SessionBased = 'session_based',
	GroupSessionBased = 'group_session_based',
	ManagementBased = 'management_based',
	MaintenanceBased = 'maintenance_based',
}

export enum BudgetType {
	FixedPrice = 'fixed_price',
	HourlyCap = 'hourly_cap',
}

export enum StartTriggerType {
	FixedDate = 'fixed_date',
	OnProjectStart = 'on_project_start',
	OnHireConfirmed = 'on_hire_confirmed',
	DependentOnStage = 'dependent_on_stage',
}

export enum TimelinePreset {
	Sequential = 'sequential',
	Simultaneous = 'simultaneous',
	Staggered = 'staggered',
	Custom = 'custom',
}

export enum IPOptionMode {
	ExclusiveTransfer = 'exclusive_transfer',
	LicensedUse = 'licensed_use',
	SharedOwnership = 'shared_ownership',
	ProjectivePartner = 'projective_partner',
}

export enum PortfolioDisplayRights {
	Allowed = 'allowed',
	Forbidden = 'forbidden',
	Embargoed = 'embargoed',
}

export enum StaffingModelType {
	DefinedRoles = 'defined_roles',
	OpenSeats = 'open_seats',
}

export enum DependencyTriggerEvent {
	AfterCompletion = 'after_completion',
	BeforeDeadline = 'before_deadline',
	AfterStart = 'after_start',
}

export enum DurationMode {
	FixedDeadline = 'fixed_deadline',
	RelativeDuration = 'relative_duration',
	NoDueDate = 'no_due_date',
}

// --- Scheduling & Management ---

export enum SchedulingWindowMode {
	SpecificDates = 'specific_dates',
	ToBeAgreed = 'to_be_agreed',
	RelativeWindow = 'relative_window',
}

export enum ContractMode {
	FixedDates = 'fixed_dates',
	DurationFromStart = 'duration_from_start',
}

export enum ReportingFrequency {
	Daily = 'daily',
	Weekly = 'weekly',
}

export enum MaintenanceCycleInterval {
	Weekly = 'weekly',
	Monthly = 'monthly',
}

export enum TerminationCondition {
	FixedDate = 'fixed_date',
	NumberOfCycles = 'number_of_cycles',
	Indefinite = 'indefinite',
}

```

### File: packages\types\src\projects\index.ts

```ts
export * from './enums.ts';
export * from './stageTabs.ts';

```

### File: packages\types\src\projects\stageTabs.ts

```ts
import { StageType } from './enums.ts';

export const stageTabs = (type: StageType) => {
	const tabs = [
		{ label: 'Chat', href: 'chat' },
		{ label: 'Files', href: 'files' },
	];

	if (type === StageType.SessionBased || type === StageType.GroupSessionBased) {
		tabs.push({ label: 'Sessions', href: 'sessions' });
	}

	if (type === StageType.ManagementBased) {
		tabs.push({ label: 'Tasks', href: 'tasks' });
	}

	if (type === StageType.MaintenanceBased) {
		tabs.push({ label: 'Tickets', href: 'tickets' });
	}

	if (type === StageType.FileBased) {
		tabs.push({ label: 'Submissions', href: 'submissions' });
	}

	return tabs;
};

```

### File: packages\types\src\ui\form.ts

```ts
import { VNode } from 'preact';

// deno-lint-ignore no-explicit-any
export interface BaseFieldProps<T = any> {
	// Core Binding
	name: string;
	value?: T;
	onChange?: (value: T) => void;

	// Identifiers
	id?: string;
	label?: string;

	// State
	disabled?: boolean;
	required?: boolean;
	readonly?: boolean;

	// Validation
	error?: string;
	success?: boolean;

	// Visuals
	placeholder?: string;
	hint?: string; // Bottom helper text (neutral)
	helperText?: string; // Bottom helper text (can be semantic)
	className?: string;

	// Layout
	floatingLabel?: boolean;

	// Slots (Generic icons for consistency)
	iconLeft?: VNode;
	iconRight?: VNode;
}

```

### File: packages\types\src\ui\select.ts

```ts
import { VNode } from 'preact';

export interface SelectOption<T> {
	label: string;
	value: string | T | number;
	icon?: VNode;
	avatarUrl?: string;
	group?: string;
	disabled?: boolean;
}

export interface SelectIcons {
	arrow?: VNode;
	arrowOpen?: VNode;
	clear?: VNode;
	loading?: VNode;
	valid?: VNode;
	invalid?: VNode;
}

export interface SelectFieldConfig<T> {
	multiple?: boolean;
	clearable?: boolean;
	searchable?: boolean;
	placeholder?: string;
	loading?: boolean; // Async loading state

	// UX Features
	enableSelectAll?: boolean;
	displayMode?: 'chips-inside' | 'chips-below' | 'count' | 'comma';

	// Customization
	icons?: SelectIcons;

	// Optional Renderers
	renderOption?: (option: SelectOption<T>) => VNode;
	renderSelection?: (selected: SelectOption<T>[]) => VNode;
}

```

### File: packages\types\src\ui\slider.ts

```ts
import { BaseFieldProps } from './form.ts';

export interface SliderMark {
	value: number;
	label?: string;
}

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right' | 'inside';
export type TooltipVisibility = 'hover' | 'always' | 'active';

export interface SliderFieldProps extends BaseFieldProps<number | number[]> {
	min?: number;
	max?: number;
	step?: number;
	range?: boolean;

	// --- Physics ---
	// Allow handles to cross each other.
	// If true, value can be [80, 20] instead of strictly [20, 80].
	passthrough?: boolean;
	minDistance?: number;
	scale?: 'linear' | 'logarithmic';

	// --- Visuals ---
	marks?: boolean | number[] | SliderMark[];
	snapToMarks?: boolean;
	vertical?: boolean;
	height?: string;

	// --- Tooltips / Labels ---
	// If true, uses defaults. Or pass config object.
	tooltip?: boolean | {
		format?: (val: number) => string;
		position?: TooltipPosition;
		visibility?: TooltipVisibility;
	};

	jumpOnClick?: boolean;
}

```

### File: packages\types\src\ui\text.ts

```ts
import { VNode } from 'preact';
import { BaseFieldProps } from './form.ts';

export type InputType =
	| 'text'
	| 'password'
	| 'email'
	| 'number'
	| 'search'
	| 'tel'
	| 'url';

export type InputMode =
	| 'text'
	| 'decimal'
	| 'numeric'
	| 'tel'
	| 'search'
	| 'email'
	| 'url';

export interface TextFieldProps extends BaseFieldProps<string | number> {
	type?: InputType;
	inputMode?: InputMode;

	// --- Variants & Presets ---
	// "default" is standard.
	// "currency" adds onBlur formatting.
	// "credit-card" adds masking + luhn validation.
	variant?: 'default' | 'currency' | 'credit-card' | 'percentage';

	// --- Masking ---
	mask?: string;

	multiline?: boolean;
	rows?: number;
	autoGrow?: boolean;

	maxLength?: number;
	showCount?: boolean;

	clearable?: boolean;
	showPasswordToggle?: boolean;

	prefix?: string | VNode;
	suffix?: string | VNode;

	onFocus?: (e: FocusEvent) => void;
	onBlur?: (e: FocusEvent) => void;
	onKeyDown?: (e: KeyboardEvent) => void;
}

```

