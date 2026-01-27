# Form Fields Library: @projective/fields

A comprehensive, signal-driven form field library optimized for the Projective platform. This
package provides high-level components, specialized hooks, and composable wrappers designed to
handle complex data types—from monetary values and rich text to date ranges and file processing.

## 📦 Package Overview

```text
packages/fields/
├── mod.ts                # Global entry point
├── deno.json             # Package configuration
├── src/
│   ├── components/       # High-level field components
│   ├── core/             # Base types and shared logic
│   ├── hooks/            # State, interaction, and masking hooks
│   ├── styles/           # Semantic CSS variables and component styles
│   ├── types/            # TypeScript interfaces
│   └── wrappers/         # Composable UI shells (Labels, Effects, Messages)
```

## 🚀 Key Features

- **Signal-First Architecture**: Built from the ground up to support `@preact/signals`, allowing for
  fine-grained reactivity and minimal re-renders.
- **Edge-Ready Components**: Optimized for Deno Fresh, utilizing dynamic imports for heavy
  client-side libraries like Quill.js.
- **Semantic Theming**: Uses a three-tier CSS variable system (Primitives → Semantics → Components)
  supporting instant light/dark mode switching.
- **Advanced Data Handling**: Includes built-in support for currency masking, Markdown/Delta
  parsing, and multi-stage file processing.
- **Consistent UX Shells**: Every field shares a common set of wrappers for labels, floating logic,
  and validation messaging.

## 🧩 Component Directory

| Component         | Key Features                                             | Docs                              |
| :---------------- | :------------------------------------------------------- | :-------------------------------- |
| **TextField**     | Standard/Multiline, Adornments, Password modes.          | [View Docs](./text-field.md)      |
| **SelectField**   | Multi-select, Hierarchical grouping, Chip display.       | [View Docs](./select-field.md)    |
| **RichTextField** | Markdown/HTML support, Secure links, Image uploads.      | [View Docs](./rich-text-field.md) |
| **DateField**     | Single/Range/Multiple selection, Year/Month navigation.  | [View Docs](./date-field.md)      |
| **TimeField**     | Interactive Analog Clock, AM/PM context, Multi-time.     | [View Docs](./time-field.md)      |
| **FileDrop**      | Drag & Drop, Processing pipeline, Global overlay.        | [View Docs](./file-drop.md)       |
| **SliderField**   | Single/Range handles, Logarithmic scale, Marks/Snapping. | [View Docs](./slider-field.md)    |
| **ComboboxField** | Text-based fuzzy filtering for large lists.              | [View Docs](./combobox-field.md)  |

## 🛠 Composable Infrastructure

Beyond high-level components, you can use the internal building blocks to create custom fields that
fit the platform's design system:

- **Hooks**: Leverage `useFieldState` for validation or `useInteraction` for tracking field focus.
- **Wrappers**: Use `LabelWrapper` and `EffectWrapper` to give any custom input the Projective "look
  and feel," including floating labels and focus rings.
