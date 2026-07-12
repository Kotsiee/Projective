/**
 * @module @projective/ui/types
 * The folded PRESENTATION-type surface for the consolidated UI package — the shared MODEL types the
 * UI renders against (card models, ledger entries, file metadata, the DateTime value object).
 *
 * Consolidation note: these definitions are re-exported from `@projective/types` today so consumers
 * can adopt the `@projective/ui/types` import point now; the UI-facing subset physically relocates
 * into this package during the migration pass (the shared domain/DB contract types stay in
 * `@projective/types`, consumed by `@projective/backend`). Component PROP types are exported from
 * their own sub-namespace (e.g. `CheckboxProps` from `@projective/ui/fields`).
 */
export type {
	EntityCardModel,
	EntityCardStatKey,
	EntityCardVariant,
	EntityType,
	FileCategory,
	FileError,
	FileProcessor,
	FileWithMeta,
	LedgerEntryKind,
	LedgerEntryStatus,
	TransactionLedgerItem,
} from '@projective/types';

export { DateTime, getFileCategory } from '@projective/types';
