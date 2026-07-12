/**
 * @module @projective/ui/data
 * Virtualized data surfaces — DataDisplay (list/grid/table/carousel), the LedgerTable, ChatList,
 * Carousel, MasonryGrid — and the data hooks (useVirtual, useDataManager, useSelection). Structural
 * only: these render whatever rows/items they are handed. They must NOT be mixed with field inputs —
 * keep data presentation and input mechanics in their own namespaces (`/data` vs `/fields`).
 */
export * from '@projective/data';
