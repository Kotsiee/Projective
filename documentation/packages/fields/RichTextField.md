# Field Component: RichTextField

A powerful WYSIWYG editor built on **Quill.js**, integrated into the Projective field system. It
supports multiple output formats (Delta, HTML, Markdown), image uploads, character counting, and
secure link handling.

## 📂 Project Structure

```text
packages/fields/
├── src/
│   ├── components/
│   │   └── RichTextField.tsx      # Preact wrapper for Quill.js
│   ├── styles/
│   │   └── fields/
│   │       └── rich-text-field.css # Snow theme overrides and container layout
│   ├── types/
│   │   └── components/
│   │       └── rich-text-field.ts  # Prop definitions and format types
│   └── utils/
│       └── QuillParser.ts         # Utility for Markdown conversions
```

## 🚀 Usage

### Basic Editor

Standard framed editor with basic formatting tools (Bold, Italic, Lists, Links).

```tsx
import { RichTextField } from '@projective/fields';

export default function MyForm() {
	return (
		<RichTextField
			label='Project Description'
			placeholder='Describe the scope of work...'
			toolbar='basic'
			minHeight='200px'
		/>
	);
}
```

### Markdown Output & Image Uploads

Configuring the editor to emit Markdown strings and handle image storage via a custom provider.

```tsx
<RichTextField
	label='Detailed Pitch'
	outputFormat='markdown'
	toolbar='full'
	onImageUpload={async (file) => {
		// Custom upload logic to Supabase/S3
		const url = await uploadService.push(file);
		return url;
	}}
	showCount
	maxLength={2000}
/>;
```

### Inline Mode

A "borderless" variant that only shows the toolbar when the container is hovered or focused—ideal
for comments or quick replies.

```tsx
<RichTextField
	variant='inline'
	placeholder='Write a comment...'
	toolbar='basic'
/>;
```

## ⚙️ API Reference

### RichTextField Props

Extends `ValueFieldProps<string>`.

| Prop            | Type                              | Default    | Description                                          |
| :-------------- | :-------------------------------- | :--------- | :--------------------------------------------------- |
| `outputFormat`  | `'delta' \| 'html' \| 'markdown'` | `'delta'`  | Data format for the `onChange` callback.             |
| `toolbar`       | `'basic' \| 'full' \| any[]`      | `'basic'`  | Predefined or custom Quill toolbar configuration.    |
| `variant`       | `'framed' \| 'inline'`            | `'framed'` | Visual style of the editor container.                |
| `minHeight`     | `string \| number`                | `'150px'`  | Minimum height of the editable area.                 |
| `maxLength`     | `number`                          | -          | Soft limit for character counting.                   |
| `showCount`     | `boolean`                         | `false`    | Displays a counter (e.g., 150/2000).                 |
| `secureLinks`   | `boolean`                         | `true`     | Sanitizes links to prevent `javascript:` execution.  |
| `onImageUpload` | `(file: File) => Promise<string>` | -          | Callback to handle image drag-and-drop or selection. |

## 🕹️ Logic & Implementation

- **Quill Integration**: Uses dynamic imports to load Quill.js only on the client side, ensuring
  compatibility with Deno Fresh SSR.
- **SecureLink Blot**: Extends the standard Quill Link blot to automatically apply
  `rel="noopener noreferrer"` and `target="_blank"` to all user-generated links.
- **Format Parsing**: If the initial value is valid JSON, it is parsed as a Quill Delta. If it looks
  like HTML or Markdown, it is parsed accordingly to maintain document structure.
- **Character Counting**: Automatically strips trailing newlines added by Quill to provide an
  accurate character count to the user.

## 🎨 Styling

Styles are defined in `rich-text-field.css`:

- **Theme Overrides**: Overwrites the default Quill "Snow" theme to use the platform's semantic
  colors (e.g., `--text-brand` for active buttons).
- **Read-Only State**: When `readOnly` is true, the toolbar is hidden, and the background shifts to
  `--bg-surface-disabled`.
- **Error Transitions**: Applies a high-contrast border color (`--field-border-error`) when the
  error signal is active.
