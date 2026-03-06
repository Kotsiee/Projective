/* #region Imports */
import '../../../styles/components/project/stage/files/message-files.css';
import { JSX } from 'preact';
import { useEffect, useMemo, useRef } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { IconGridDots, IconList, IconSearch } from '@tabler/icons-preact';
import { ButtonGroup, IconButton } from '@projective/ui';
import { DataDisplay, DisplayMode, RestDataSource } from '@projective/data';
import { SelectField } from '@projective/fields';
import { SelectOption } from '@projective/types';
import { useProjectContext } from '../../../contexts/ProjectContext.tsx';
import { useStageContext } from '../../../contexts/StageContext.tsx';
import { ChatMessageAttachment, ChatMessageData } from './ChatNetworkSource.ts';
import StageFilesFooter from '../../../components/project/stage/files/StageFilesFooter.tsx';
import { StageFilesItem } from '../../../components/project/stage/files/StageFilesItem.tsx';
/* #endregion */

/* #region Interfaces */
/**
 * Represents a single file entry returned from the stage files endpoint.
 */
export interface StageFileItem {
	id: string;
	attachment: ChatMessageAttachment;
	message: ChatMessageData;
	total_count?: number | undefined;
}
/* #endregion */

/* #region Component */
/**
 * @function ProjectFilesIsland
 * @description Interactive island displaying a searchable, filterable grid or list of files shared within a stage.
 * @returns {JSX.Element}
 */
export default function ProjectFilesIsland(): JSX.Element {
	const { project_id } = useProjectContext();
	const { footer, stage, stage_id } = useStageContext();

	// State Signals
	const searchQuery = useSignal('');
	const displayMode = useSignal<DisplayMode>('grid');
	const selectedCategory = useSignal('all');
	const selectedFile = useSignal<StageFileItem | null>(null);

	// Click Tracking Refs
	const lastClickTime = useRef<number>(0);
	const lastClickedId = useRef<string | null>(null);

	const fileCategories: SelectOption<string>[] = [
		{ value: 'all', label: 'All Files' },
		{ value: 'image', label: 'Images' },
		{ value: 'document', label: 'Documents' },
		{ value: 'video', label: 'Videos' },
	];

	const getFileUrl = (fileId: string): string | undefined => {
		const pid = project_id.value;
		const sid = stage_id.value;
		if (pid && sid && fileId) {
			return `/projects/${pid}/${sid}/files/${fileId}`;
		}
		return undefined;
	};

	const handleItemAction = (item: StageFileItem, e: Event) => {
		// Stop propagation so the background click listener doesn't immediately deselect it
		e.stopPropagation();

		const now = Date.now();
		const isSameItem = lastClickedId.current === item.id;
		const isDoubleClick = isSameItem && (now - lastClickTime.current < 300);

		if (isDoubleClick) {
			// Do NOT prevent default. Let the anchor navigation (and f-partial) execute natively.
			lastClickTime.current = 0;
			lastClickedId.current = null;
		} else {
			// Single click: Prevent navigation and handle selection state internally
			e.preventDefault();
			lastClickTime.current = now;
			lastClickedId.current = item.id;

			if (selectedFile.value?.id === item.id) {
				selectedFile.value = null;
				lastClickedId.current = null;
			} else {
				selectedFile.value = item;
			}
		}
	};

	// Sync Footer with selected file
	useEffect(() => {
		if (selectedFile.value) {
			footer.value = (
				<StageFilesFooter
					attachment={selectedFile.value.attachment}
					message={selectedFile.value.message}
					openUrl={getFileUrl(selectedFile.value.id)}
				/>
			);
		} else {
			footer.value = null;
		}

		return () => {
			footer.value = null;
		};
	}, [selectedFile.value, project_id.value, stage_id.value]);

	const dataSource = useMemo(() => {
		if (!stage.value?.channel_id) return [];

		return new RestDataSource<StageFileItem, StageFileItem>({
			url: `/api/v1/dashboard/comms/channels/${stage.value.channel_id}/files`,
			keyExtractor: (item) => item.id,
			defaultParams: {
				category: selectedCategory.value,
				search: searchQuery.value,
			},
		});
	}, [stage.value?.channel_id, selectedCategory.value, searchQuery.value]);

	const handleSearchInput = (e: Event) => {
		const target = e.target as HTMLInputElement;
		searchQuery.value = target.value;
		selectedFile.value = null;
	};

	const handleCategoryChange = (value: unknown) => {
		selectedCategory.value = value as string;
		selectedFile.value = null;
	};

	return (
		<div class='project-files'>
			<div class='project-files__filters'>
				<div class='project-files__search'>
					<input
						type='text'
						class='project-files__search-input'
						placeholder='Search files...'
						value={searchQuery}
						onInput={handleSearchInput}
					/>
					<IconButton
						variant='secondary'
						size='small'
						aria-label='Search Files'
						ghost
					>
						<IconSearch size={18} class='project-files__search-icon' />
					</IconButton>
				</div>

				<div class='project-files__category'>
					<SelectField
						name='file-category'
						value={selectedCategory}
						options={fileCategories}
						multiple={false}
						searchable={false}
						onChange={handleCategoryChange}
					/>
				</div>

				<div class='project-files__display-type'>
					<ButtonGroup>
						<IconButton
							variant={displayMode.value === 'list' ? 'primary' : 'secondary'}
							size='small'
							aria-label='List View'
							onClick={() => displayMode.value = 'list'}
						>
							<IconList size={18} />
						</IconButton>
						<IconButton
							variant={displayMode.value === 'grid' ? 'primary' : 'secondary'}
							size='small'
							aria-label='Grid View'
							onClick={() => displayMode.value = 'grid'}
						>
							<IconGridDots size={18} />
						</IconButton>
					</ButtonGroup>
				</div>
			</div>

			<div
				class='project-files__content'
				onClick={() => {
					// Clicking the empty space background deselects any active item
					selectedFile.value = null;
					lastClickedId.current = null;
				}}
			>
				<DataDisplay<StageFileItem, StageFileItem>
					dataSource={dataSource}
					mode={displayMode.value}
					gridItemWidth={156}
					gridColumns={4}
					estimateHeight={displayMode.value === 'grid' ? 160 : 72}
					pageSize={30}
					selectionMode='single'
					renderItem={(item) => (
						<StageFilesItem
							attachment={item.attachment}
							message={item.message}
							isSelected={selectedFile.value?.id === item.id}
							openUrl={getFileUrl(item.id)}
							onAction={(e) => handleItemAction(item, e)}
						/>
					)}
					interactive={false}
				/>
			</div>
		</div>
	);
}
/* #endregion */
