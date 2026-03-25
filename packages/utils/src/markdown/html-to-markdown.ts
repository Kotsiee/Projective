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
