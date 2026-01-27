# Projective Monorepo: Packages

The `packages/` directory contains the core library ecosystem that powers the Projective platform.
These packages are designed to be modular, highly typed, and optimized for the **Deno Fresh** and
**Preact** environment.

## 📦 Package Directory

| Package                  | Description                                                              | Key Technologies          |
| :----------------------- | :----------------------------------------------------------------------- | :------------------------ |
| **`@projective/ui`**     | High-level interactive components (Accordion, Splitter, Stepper, Toast). | Preact, Preact Signals    |
| **`@projective/fields`** | Schema-driven form fields with integrated validation and masking.        | Preact Signals, Quill.js  |
| **`@projective/data`**   | Virtualization-first data display engine (List, Grid, Table, Chat).      | TanStack Virtual, Signals |
| **`@projective/types`**  | Central source of truth for platform enums, interfaces, and permissions. | TypeScript                |
| **`@projective/utils`**  | Shared business logic, formatting, and platform-specific helpers.        | Deno Standard Lib         |

---

## 🏗️ Architecture Philosophy

The Projective package ecosystem follows a strict "bottom-up" dependency model to prevent circular
references and ensure maintainability:

### 1. The Type Foundation (`@projective/types`)

Every package depends on the types library. This ensures that a `ProjectStatus` in the backend is
identical to the one driving a `SelectField` in the UI.

### 2. Logic and Utilities (`@projective/utils`)

Common tasks like date arithmetic via the `DateTime` class or currency formatting are centralized
here to avoid duplication across the frontend and backend edge functions.

### 3. Feature-Specific Libraries (`@projective/fields`, `@projective/data`)

These packages provide the "how" of data interaction.

- **`fields`** handles how data is _collected_ (inputs).
- **`data`** handles how data is _consumed_ (virtualized lists and tables).

### 4. Component Library (`@projective/ui`)

The uppermost layer focusing on pure layout and feedback components. These are largely "dumb"
components that focus on accessibility and performance rather than specific domain logic.

---

## 🛠 Shared Development Patterns

### Signal-Driven Reactivity

All packages utilize **Preact Signals** for state management. This allows for:

- **Fine-grained updates**: Only the specific text node or CSS class changes, not the entire
  component tree.
- **Zero-Prop Drilling**: Complex states like "active step" in a Stepper or "dragging" in a FileDrop
  are shared via signals.

### CSS Architecture

We use a **Two-Tier CSS Variable** system across all packages:

1. **Global Tokens**: Defined in the platform theme (e.g., `--primary-500`, `--field-radius`).
2. **Component Semantics**: Local variables within each package that map to tokens (e.g.,
   `--btn-bg: var(--primary-500)`).
