/* #region Imports */
import '../../../styles/components/project/stage/files/stage-files.css';
import { useEffect, useRef } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { IconArrowsSort, IconFolderOpen, IconLoader2, IconSearch } from '@tabler/icons-preact';
import { FilterTags, MenuSelect, type ViewMode, ViewToggle } from '@projective/fields';
import {
	filterStageFiles,
	parseStageFiles,
	sortStageFiles,
	type StageFileCategory,
	type StageFileEntry,
	type StageFileSort,
} from '@projective/data';
import type { LightboxMedia } from '@projective/ui';
import { MediaViewerProvider, useMediaViewer } from '../../../contexts/MediaViewerContext.tsx';
import { useStageContext } from '../../../contexts/StageContext.tsx';
import { StageFilesItem } from '../../../components/project/stage/files/StageFilesItem.tsx';
import { StageFilesList } from '../../../components/project/stage/files/StageFilesList.tsx';
import { StageFileDetails } from '../../../components/project/stage/files/StageFileDetails.tsx';
/* #endregion */

/* #region Constants */
const SORT_OPTIONS: { label: string; value: StageFileSort }[] = [
	{ label: 'Recent', value: 'recent' },
	{ label: 'Oldest', value: 'oldest' },
	{ label: 'Name', value: 'name' },
	{ label: 'Largest', value: 'size' },
];

const FILTER_OPTIONS: { label: string; value: 'all' | StageFileCategory }[] = [
	{ label: 'All', value: 'all' },
	{ label: 'Images', value: 'image' },
	{ label: 'Docs', value: 'doc' },
	{ label: 'Other', value: 'other' },
];

/** Upper bound on files pulled in a single sweep — plenty for a stage channel. */
const FETCH_LIMIT = 200;
/* #endregion */

/* #region Mapping */
/** Projects a canonical entry into the shared lightbox media descriptor. */
function toLightboxMedia(entry: StageFileEntry): LightboxMedia {
	return {
		url: entry.url,
		name: entry.name,
		type: entry.mimeType,
		size: entry.size,
		uploadedAt: entry.timestamp,
		senderName: entry.senderName,
		senderInitials: entry.senderInitials,
		messageId: entry.messageId,
	};
}
/* #endregion */

/* #region View */
/**
 * The interactive Files surface. Fetches the channel's aggregated attachments
 * once (via the internal API route — islands never touch Supabase directly),
 * then filters/sorts/searches client-side to feed either the Grid or List
 * renderer. Selecting a file opens the shared media lightbox.
 */
function StageFilesView({ initialEntries }: { initialEntries: StageFileEntry[] | null }) {
	const { stage } = useStageContext();
	const { open } = useMediaViewer();

	const entries = useSignal<StageFileEntry[]>(initialEntries ?? []);
	const isLoading = useSignal(initialEntries == null);
	const error = useSignal<string | null>(null);

	const search = useSignal('');
	const sort = useSignal<StageFileSort>('recent');
	const category = useSignal<'all' | StageFileCategory>('all');
	const view = useSignal<ViewMode>('grid');

	/** The file shown in the slide-out Details inspector (single-click). */
	const activeEntry = useSignal<StageFileEntry | null>(null);
	/** Debounce so a double-click opens the modal instead of the inspector. */
	const clickTimer = useRef<number | null>(null);

	const channelId = stage?.value?.channel_id ?? null;
	// The channel we already hold entries for — seeded from server hydration so the mount fetch is
	// skipped when the route pre-loaded this channel's files. Re-fetches on stage-to-stage nav.
	const loadedChannel = useRef<string | null>(initialEntries != null ? channelId : null);

	useEffect(() => {
		if (!channelId) {
			entries.value = [];
			isLoading.value = false;
			loadedChannel.current = null;
			return;
		}
		if (loadedChannel.current === channelId) return;

		let cancelled = false;
		isLoading.value = true;
		error.value = null;

		(async () => {
			try {
				const params = new URLSearchParams({
					type: 'channel',
					start: '0',
					limit: String(FETCH_LIMIT),
				});
				const res = await fetch(
					`/api/v1/dashboard/comms/channels/${channelId}/files?${params.toString()}`,
				);
				if (!res.ok) throw new Error(`Error ${res.status}`);
				const data = await res.json();
				if (cancelled) return;
				entries.value = parseStageFiles(data.items);
				loadedChannel.current = channelId;
			} catch (err) {
				if (!cancelled) error.value = (err as Error).message;
			} finally {
				if (!cancelled) isLoading.value = false;
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [channelId]);

	const jumpToMessage = (entry: StageFileEntry) => {
		const projectId = stage?.value?.project_id;
		const stageId = stage?.value?.stage_id;
		if (!projectId || !stageId || !entry.messageId) return;
		globalThis.location.assign(
			`/projects/${projectId}/${stageId}/chat?message=${entry.messageId}#msg-${entry.messageId}`,
		);
	};

	/** Double-click / expand: opens the shared full-view media modal. */
	const handleOpen = (entry: StageFileEntry) => {
		if (clickTimer.current) {
			clearTimeout(clickTimer.current);
			clickTimer.current = null;
		}
		open(toLightboxMedia(entry), {
			onJump: entry.messageId ? () => jumpToMessage(entry) : undefined,
		});
	};

	/** Single-click: debounced so a double-click wins, then reveals the inspector. */
	const handleSelect = (entry: StageFileEntry, e: MouseEvent) => {
		if (e.detail > 1) return; // part of a double-click — let handleOpen run
		if (clickTimer.current) clearTimeout(clickTimer.current);
		clickTimer.current = setTimeout(() => {
			activeEntry.value = entry;
			clickTimer.current = null;
		}, 200);
	};

	const visible = sortStageFiles(
		filterStageFiles(entries.value, { category: category.value, search: search.value }),
		sort.value,
	);

	const renderBody = () => {
		if (isLoading.value) {
			return (
				<div class='stage-files__state'>
					<IconLoader2 size={32} class='stage-files__spin' />
					<p>Loading files…</p>
				</div>
			);
		}
		if (error.value) {
			return (
				<div class='stage-files__state'>
					<p>Couldn't load files. {error.value}</p>
				</div>
			);
		}
		if (visible.length === 0) {
			const empty = entries.value.length === 0;
			return (
				<div class='stage-files__state'>
					<IconFolderOpen size={40} opacity={0.5} />
					<p>
						{empty
							? 'No files have been shared in this stage yet.'
							: 'No files match your filters.'}
					</p>
				</div>
			);
		}
		return view.value === 'grid'
			? (
				<div class='stage-files__grid'>
					{visible.map((entry) => (
						<StageFilesItem
							key={entry.id}
							entry={entry}
							onSelect={handleSelect}
							onOpen={handleOpen}
							active={activeEntry.value?.id === entry.id}
						/>
					))}
				</div>
			)
			: (
				<StageFilesList
					entries={visible}
					onSelect={handleSelect}
					onOpen={handleOpen}
					activeId={activeEntry.value?.id ?? null}
				/>
			);
	};

	return (
		<div class='stage-files'>
			<div class='stage-files__toolbar'>
				<div class='stage-files__search'>
					<span class='stage-files__search-icon'>
						<IconSearch size={16} />
					</span>
					<input
						class='stage-files__search-input'
						type='search'
						placeholder='Search files in this stage...'
						value={search.value}
						onInput={(e) => (search.value = e.currentTarget.value)}
					/>
				</div>

				<MenuSelect
					prefix='Sort by'
					icon={<IconArrowsSort size={16} />}
					value={sort.value}
					options={SORT_OPTIONS}
					onChange={(v) => (sort.value = v)}
					aria-label='Sort files'
				/>

				<FilterTags
					value={category.value}
					options={FILTER_OPTIONS}
					onChange={(v) => (category.value = v)}
					aria-label='Filter files by type'
				/>

				<div class='stage-files__toolbar-spacer' />

				<ViewToggle value={view.value} onChange={(v) => (view.value = v)} />
			</div>

			<div class='stage-files__body'>
				<div class='stage-files__canvas'>
					{renderBody()}
				</div>

				{activeEntry.value && (
					<aside class='stage-files__inspector'>
						<StageFileDetails
							entry={activeEntry.value}
							onOpenFull={handleOpen}
							onJump={jumpToMessage}
							onClose={() => (activeEntry.value = null)}
						/>
					</aside>
				)}
			</div>
		</div>
	);
}
/* #endregion */

/* #region Island */
export interface ProjectFileIslandProps {
	/**
	 * Server-hydrated stage file entries resolved by the route (Route → Service → props, one-way; see
	 * apps/web/CLAUDE.md). When present the Files tab paints instantly with no client fetch on mount;
	 * client-side search/sort/filter stay interactive, and it re-fetches on stage-to-stage navigation.
	 */
	initialEntries?: StageFileEntry[] | null;
}

export default function ProjectFileIsland({ initialEntries = null }: ProjectFileIslandProps = {}) {
	return (
		<MediaViewerProvider>
			<StageFilesView initialEntries={initialEntries} />
		</MediaViewerProvider>
	);
}
/* #endregion */
