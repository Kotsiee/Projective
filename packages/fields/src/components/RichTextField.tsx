import { useEffect, useRef } from 'preact/hooks';
import { Signal, useComputed, useSignal } from '@preact/signals';
import { RichTextFieldProps } from '../types/components/rich-text-field.ts';
import { LabelWrapper } from '../wrappers/LabelWrapper.tsx';
import { MessageWrapper } from '../wrappers/MessageWrapper.tsx';
import '../styles/fields/rich-text-field.css';

let Quill: any = null;

export function RichTextField(props: RichTextFieldProps) {
	const {
		id,
		label,
		value,
		defaultValue,
		onChange,
		outputFormat = 'delta',
		toolbar = 'basic',
		variant = 'framed',
		secureLinks = true,
		placeholder,
		readOnly,
		onImageUpload,
		error,
		hint,
		warning,
		info,
		disabled,
		required,
		minHeight = '150px',
		maxHeight,
		maxLength,
		showCount,
		className,
		style,
	} = props;

	const editorRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const quillInstance = useRef<any>(null);
	const parserRef = useRef<any>(null);

	// Signals for local state
	const length = useSignal(0);

	const getRawValue = () => {
		if (value instanceof Signal) return value.value;
		return value || defaultValue || '';
	};

	const isDisabled = disabled instanceof Signal ? disabled.value : disabled;
	const isReadOnly = !!readOnly || isDisabled;
	const isError = error instanceof Signal ? error.value : error;
	const isWarning = warning instanceof Signal ? warning.value : warning;

	// Computed for character limit style
	const isOverLimit = useComputed(() => maxLength ? length.value > maxLength : false);

	// --- Link Security Blot ---
	const registerSecureLink = (QuillArg: any) => {
		const Link = QuillArg.import('formats/link');
		class SecureLink extends Link {
			static create(value: string) {
				const node = super.create(value);
				value = this.sanitize(value);
				node.setAttribute('href', value);
				node.setAttribute('rel', 'noopener noreferrer');
				node.setAttribute('target', '_blank');
				return node;
			}
			static sanitize(url: string) {
				const protocol = url.slice(0, url.indexOf(':'));
				if (['javascript', 'vbscript', 'data'].includes(protocol.toLowerCase())) {
					return 'about:blank';
				}
				return super.sanitize(url);
			}
		}
		if (secureLinks) {
			QuillArg.register(SecureLink, true);
		}
	};

	// --- Image Upload Logic ---
	const insertImage = (url: string) => {
		const quill = quillInstance.current;
		if (!quill) return;
		const range = quill.getSelection(true);
		quill.insertEmbed(range.index, 'image', url);
		quill.setSelection(range.index + 1);
	};

	const handleFiles = async (files: FileList | File[]) => {
		if (!onImageUpload) return;

		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			if (file.type.startsWith('image/')) {
				try {
					const url = await onImageUpload(file);
					insertImage(url);
				} catch (err) {
					console.error('Image upload failed', err);
				}
			}
		}
	};

	const imageHandler = () => {
		const input = document.createElement('input');
		input.setAttribute('type', 'file');
		input.setAttribute('accept', 'image/*');
		input.click();

		input.onchange = () => {
			if (input.files && input.files[0]) {
				if (onImageUpload) {
					handleFiles([input.files[0]]);
				} else {
					const reader = new FileReader();
					reader.onload = (e) => {
						insertImage(e.target?.result as string);
					};
					reader.readAsDataURL(input.files[0]);
				}
			}
		};
	};

	useEffect(() => {
		if (typeof window === 'undefined' || !editorRef.current) return;

		const init = async () => {
			if (!Quill) {
				const mod = await import('quill');
				Quill = mod.default;
				registerSecureLink(Quill);
			}

			if (!parserRef.current) {
				const { MarkdownParser } = await import('../../../utils/QuillParser.ts');
				parserRef.current = new MarkdownParser();
			}

			if (quillInstance.current) {
				if (quillInstance.current.isEnabled() === isReadOnly) {
					quillInstance.current.enable(!isReadOnly);
				}
				return;
			}

			let toolbarConfig = toolbar;
			if (toolbar === 'basic') {
				toolbarConfig = [
					['bold', 'italic', 'underline', 'strike'],
					['link', 'blockquote'],
					[{ 'list': 'ordered' }, { 'list': 'bullet' }],
					['clean'],
				];
			} else if (toolbar === 'full') {
				toolbarConfig = [
					[{ 'header': [1, 2, 3, false] }],
					['bold', 'italic', 'underline', 'strike'],
					[{ 'color': [] }, { 'background': [] }],
					[{ 'script': 'sub' }, { 'script': 'super' }],
					['link', 'blockquote', 'code-block', 'image'],
					[{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
					[{ 'align': [] }],
					['clean'],
				];
			}

			const modules = {
				toolbar: isReadOnly ? false : {
					container: toolbarConfig,
					handlers: {
						image: imageHandler,
					},
				},
			};

			quillInstance.current = new Quill(editorRef.current, {
				theme: 'snow',
				modules,
				placeholder: isReadOnly ? '' : placeholder,
				readOnly: isReadOnly,
			});

			if (!isReadOnly) {
				quillInstance.current.root.addEventListener('drop', (e: DragEvent) => {
					if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
						e.preventDefault();
						handleFiles(e.dataTransfer.files);
					}
				});
			}

			const raw = getRawValue();
			if (raw) {
				try {
					const trimmed = raw.trim();
					if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
						quillInstance.current.setContents(JSON.parse(trimmed));
					} else if (trimmed.startsWith('<')) {
						const delta = quillInstance.current.clipboard.convert(trimmed);
						quillInstance.current.setContents(delta);
					} else {
						if (parserRef.current) {
							parserRef.current.markdownToDelta(raw).then((delta: any) => {
								quillInstance.current.setContents(delta);
							});
						} else {
							quillInstance.current.setText(raw);
						}
					}
				} catch (e) {
					quillInstance.current.setText(raw);
				}
			}

			// Initial length check
			length.value = Math.max(0, quillInstance.current.getLength() - 1);

			// --- Change Listener ---
			quillInstance.current.on('text-change', () => {
				const delta = quillInstance.current.getContents();
				// Update char count (Quill adds trailing newline)
				length.value = Math.max(0, quillInstance.current.getLength() - 1);

				let output = '';

				if (outputFormat === 'delta') {
					output = JSON.stringify(delta);
				} else if (outputFormat === 'html') {
					output = quillInstance.current.root.innerHTML;
				} else if (outputFormat === 'markdown' && parserRef.current) {
					output = parserRef.current.deltaToMarkdown(delta);
				}

				if (value instanceof Signal) {
					value.value = output;
				}
				onChange?.(output);
			});
		};

		init();
	}, [isReadOnly]);

	return (
		<div
			className={`field-rich-text field-rich-text--${variant} ${
				isReadOnly ? 'field-rich-text--readonly' : ''
			} ${className || ''}`}
			style={style}
		>
			<LabelWrapper
				id={id}
				label={label}
				required={required}
				error={!!isError}
				disabled={isDisabled}
				position='top'
				floatingRule='never'
			/>

			<div
				ref={containerRef}
				className={`field-rich-text__container ${
					isError ? 'field-rich-text__container--error' : ''
				} ${isWarning ? 'field-rich-text__container--warning' : ''}`}
			>
				<div
					ref={editorRef}
					style={{
						minHeight: variant === 'inline' ? 'auto' : minHeight,
						maxHeight: maxHeight, // Apply scrolling limit
					}}
				/>
			</div>

			<div style={{ display: 'flex', justifyContent: 'space-between' }}>
				<div style={{ flex: 1 }}>
					<MessageWrapper error={error} hint={hint} warning={warning} info={info} />
				</div>

				{showCount && (
					<div
						className={`field-rich-text__count ${
							isOverLimit.value ? 'field-rich-text__count--limit' : ''
						}`}
					>
						{length}/{maxLength || '∞'}
					</div>
				)}
			</div>
		</div>
	);
}
