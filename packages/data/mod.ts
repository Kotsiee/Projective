// Models & Types
export * from './src/core/index.ts';

// Components
export * from './src/components/DataDisplay.tsx';
export { LedgerTable } from './src/components/table/LedgerTable.tsx';
export type { LedgerColumn, LedgerTableProps } from './src/components/table/LedgerTable.tsx';

// Hooks (exposed for advanced custom renderers)
export { useVirtual } from './src/hooks/useVirtual.ts';
export { useDataManager } from './src/hooks/useDataManager.ts';
export { useSelection } from './src/hooks/useSelection.ts';
export { useCarousel } from './src/hooks/useCarousel.ts';
export { useMasonryVirtual } from './src/hooks/useMasonryVirtual.ts';

// Displays
export { ChatList } from './src/components/displays/ChatList.tsx';
export { Carousel } from './src/components/displays/Carousel.tsx';
export { MasonryGrid } from './src/components/displays/MasonryGrid.tsx';

// Prop Types
export type { DisplayMode } from './src/types/DataDisplayProps.ts';
export type { CarouselOptions, CarouselState } from './src/types/carousel.ts';

// Utils
export {
	type BurstPosition,
	DEFAULT_BURST_WINDOW_MINUTES,
	getBurstPosition,
	type GroupableMessage,
	isSameBurst,
} from './src/utils/chatGrouping.ts';

export {
	categorizeFile,
	filterStageFiles,
	formatFileSize,
	formatLongDate,
	formatShortDate,
	getExtension,
	getInitials,
	matchesCategory,
	parseStageFile,
	parseStageFiles,
	type RawStageFile,
	sortStageFiles,
	type StageFileCategory,
	type StageFileEntry,
	type StageFileSort,
} from './src/utils/stageFiles.ts';
