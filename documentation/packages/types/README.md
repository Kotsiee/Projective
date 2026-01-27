# Types Library: @projective/types

The central source of truth for all shared TypeScript definitions across the Projective platform.
This package ensures strict type safety between the frontend (Preact/Fresh) and the backend
(Supabase/Deno), covering everything from platform permissions to UI field configurations.

## 📂 Project Structure

```text
packages/types/
├── mod.ts                # Global entry point and exports
├── deno.json             # Package configuration
├── src/
│   ├── auth/             # Permission and role definitions
│   ├── core/             # Fundamental helpers (DateTime, Enums)
│   ├── files/            # File categories, status, and processing
│   ├── finance/          # Currency maps (Fiat, Crypto, Commodities)
│   ├── projects/         # Project & Stage status and logic
│   └── ui/               # Schema-driven UI field properties
```

---

## 🛡️ Auth & Permissions

The platform uses a tiered permission system to handle access across projects, stages, and business
organizations.

```ts
export enum ProjectPermission {
	ManageSettings = 'manage_settings',
	ManageMembers = 'manage_members',
	ViewFinancials = 'view_financials',
	CreateStage = 'create_stage',
}

export enum StagePermission {
	FundEscrow = 'fund_escrow',
	SubmitWork = 'submit_work',
	ApproveWork = 'approve_work',
	RequestRevision = 'request_revision',
}
```

---

## 🗓️ Core Utilities

### DateTime Helper

A lightweight, immutable wrapper around the native `Date` object. It handles complex parsing (ISO,
Excel serials, custom formats), arithmetic, and human-friendly diffing.

- **Immutable Math**: Methods like `add()` and `minus()` return new instances.
- **Human Diffing**: `diffAuto()` calculates the most appropriate unit (e.g., "2 hours ago" vs "3
  months ago").
- **Formatting**: Support for tokens like `yyyy-MM-dd HH:mm:ss` with timezone-aware display.

---

## 🏗️ Domain Models

### Project & Stage Management

Defines the lifecycle and configuration of work on the platform.

| Enum            | Key Values                                            |
| :-------------- | :---------------------------------------------------- |
| `ProjectStatus` | `Draft`, `Active`, `Completed`, `Cancelled`           |
| `StageStatus`   | `InProgress`, `Submitted`, `Approved`, `Paid`         |
| `BudgetType`    | `FixedPrice`, `HourlyCap`                             |
| `IPOptionMode`  | `ExclusiveTransfer`, `LicensedUse`, `SharedOwnership` |

### Files & Media

Handles classification for over 100+ file extensions and provides a standardized `FileWithMeta`
interface for UI processing.

- **Categories**: Document, Presentation, Audio, Video, 3D, Medical, Scientific, etc.
- **Processing**: Defines `FileProcessor` for async tasks like image optimization or virus scanning.

---

## 🎨 UI & Form Schemas

Standardized props for UI components to ensure consistency across different library implementations.

### `BaseFieldProps`

The shared foundation for every input field on the platform.

```ts
export interface BaseFieldProps<T> {
	name: string;
	value?: T;
	label?: string;
	error?: string;
	disabled?: boolean;
	floatingLabel?: boolean;
	// ...
}
```

### Specialized Field Props

- **TextField**: Supports variants like `currency`, `credit-card`, and `percentage`.
- **SelectField**: Configuration for `multiple` select, `searchable` dropdowns, and different
  `displayMode` options (e.g., chips).
- **SliderField**: Handles logic for `range` sliders, `snapToMarks`, and `logarithmic` scales.
