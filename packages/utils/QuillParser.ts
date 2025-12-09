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
