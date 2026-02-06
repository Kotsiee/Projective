# Selected Codebase Context

> Included paths: ./packages/utils

## Project Tree (Selected)

```text
./packages/utils/
  utils/
  date-math.ts
  deno.json
  html-to-markdown.ts
  math.ts
  mod.ts
  processors/
  mock-wasm.ts
  QuillParser.ts
  time-math.ts
```

## File Contents

### File: packages\utils\date-math.ts

```ts
import { DateTime } from '@projective/types';
import { DateValue } from '../fields/src/types/components/date-field.ts';

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

### File: packages\utils\deno.json

```json
{
  "name": "@projective/utils",
  "version": "0.0.0",
  "exports": "./mod.ts"
}

```

### File: packages\utils\html-to-markdown.ts

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

### File: packages\utils\math.ts

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

### File: packages\utils\mod.ts

```ts
export * from './math.ts';
export * from './date-math.ts';
export * from './time-math.ts';
export * from './processors/mock-wasm.ts';
export * from './QuillParser.ts';

```

### File: packages\utils\processors\mock-wasm.ts

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

### File: packages\utils\QuillParser.ts

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

// #endregion

```

### File: packages\utils\time-math.ts

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

