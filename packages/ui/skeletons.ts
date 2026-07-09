// Lightweight skeleton-only entry, deliberately kept OUT of the main `@projective/ui`
// barrel (`mod.ts`). The barrel re-exports `ledger/TransactionLedger`, which imports
// `@projective/data`; pulling the barrel from within `@projective/data` (as List.tsx does
// for its loading skeleton) creates a `data -> ui -> data` import cycle. Consumers that only
// need a skeleton import it from here instead, so no cycle is formed.
export { ListCardSkeleton } from './src/components/card/ListCardSkeleton.tsx';
