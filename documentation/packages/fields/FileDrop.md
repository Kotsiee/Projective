# Field Component: FileDrop

A sophisticated file upload and processing component. It features a drag-and-drop zone, support for
multiple files, MIME type filtering, and an integrated asynchronous processing pipeline for tasks
like virus scanning or image optimization.

## 📂 Project Structure

```text
packages/fields/
├── src/
│   ├── components/
│   │   └── FileDrop.tsx          # Main dropzone UI component
│   ├── hooks/
│   │   ├── useFileProcessor.ts   # Async processing queue logic
│   │   └── useGlobalDrag.ts      # Tracks window-level drag events
│   ├── styles/
│   │   └── fields/
│   │       └── file-drop.css     # Dropzone and file list styling
│   └── types/
│       └── file.ts               # FileWithMeta and Processor interfaces
└── wrappers/
    └── GlobalFileDrop.tsx        # App-wide drag-to-upload overlay
```

## 🚀 Usage

### Standard Dropzone

A simple file input with type restrictions and multi-file support.

```tsx
import { FileDrop } from '@projective/fields';

export default function DocumentUpload() {
	return (
		<FileDrop
			label='Identity Proof'
			accept='.pdf,.jpg,.png'
			multiple
			maxSize={5 * 1024 * 1024} // 5MB
			onChange={(files) => 
		/>
	);
}
```

### Global Drag Overlay

Wrap your application or specific layouts with `GlobalFileDrop` to enable "drop anywhere" uploads.

```tsx
import { GlobalFileDrop } from '@projective/fields';

export default function Layout({ children }) {
	return (
		<GlobalFileDrop overlayText='Drop project assets to upload'>
			{children}
		</GlobalFileDrop>
	);
}
```

## ⚙️ API Reference

### FileDrop Props

Extends `ValueFieldProps<FileWithMeta[]>`.

| Prop            | Type                           | Default | Description                                    |
| :-------------- | :----------------------------- | :------ | :--------------------------------------------- |
| `accept`        | `string`                       | -       | Standard HTML file input accept string.        |
| `multiple`      | `boolean`                      | `false` | Allow more than one file selection.            |
| `maxSize`       | `number`                       | -       | Maximum file size in bytes.                    |
| `processors`    | `FileProcessor[]`              | `[]`    | List of async tasks to run on drop.            |
| `dropzoneLabel` | `string`                       | -       | Custom text for the drop target.               |
| `onDrop`        | `(accepted, rejected) => void` | -       | Callback for immediate drag/selection results. |

## 🕹️ Logic & Processing Pipeline

- **FileWithMeta**: Files are wrapped in a metadata object that tracks `id`, `status` (`pending`,
  `processing`, `ready`, `error`), and a `progress` signal.
- **Processor Matcher**: The `useFileProcessor` hook iterates through the `processors` array. If a
  processor's `match(file)` function returns true, it executes the async `process` function.
- **Global Drag State**: `useGlobalDrag` manages a window-level counter to ensure the
  `GlobalFileDrop` overlay persists correctly when dragging over child elements without flickering.
- **Progress Tracking**: Processors can report granular progress (0-100), allowing the UI to show
  real-time upload or processing bars.

## 🎨 Styling

Styles are defined in `file-drop.css`:

- **Drag States**: The dropzone applies a `--dragging` variant with high-contrast borders and a
  `--primary-50` background to indicate a valid drop target.
- **Virtualized Overlay**: `GlobalFileDrop` uses a `fixed` inset overlay with
  `backdrop-filter: blur(4px)` to capture global events while blurring the main application content.
- **Disabled State**: When `disabled` is true, the dropzone reduces opacity and disables all pointer
  events.
