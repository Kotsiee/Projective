/* #region Imports */
import '@styles/components/dashboard/messages/message-files.css';
import { JSX } from 'preact';
import { useEffect, useMemo } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { IconGridDots, IconList, IconSearch } from '@tabler/icons-preact';
import { ButtonGroup, IconButton } from '@projective/ui';
import { DataDisplay, DisplayMode, RestDataSource } from '@projective/data';
import { SelectField } from '@projective/fields';
import { SelectOption } from '@projective/types';
import { useStageContext } from '@contexts/StageContext.tsx';
import { ChatMessageAttachment, ChatMessageData } from './ChatNetworkSource.ts';
import StageFilesFooter from '@components/dashboard/projects/project/stage/StageFilesFooter.tsx';
import { StageFilesItem } from '@components/dashboard/projects/project/stage/StageFilesItem.tsx';
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
	const { footer, stage } = useStageContext();

	// State Signals
	const searchQuery = useSignal('');
	const displayMode = useSignal<DisplayMode>('grid');
	const selectedCategory = useSignal('all');
	const selectedFile = useSignal<StageFileItem | null>(null);

	const fileCategories: SelectOption<string>[] = [
		{ value: 'all', label: 'All Files' },
		{ value: 'image', label: 'Images' },
		{ value: 'document', label: 'Documents' },
		{ value: 'video', label: 'Videos' },
	];

	// Sync Footer with selected file
	useEffect(() => {
		if (selectedFile.value) {
			footer.value = (
				<StageFilesFooter
					attachment={selectedFile.value.attachment}
					message={selectedFile.value.message}
				/>
			);
		} else {
			footer.value = null;
		}

		return () => {
			footer.value = null;
		};
	}, [selectedFile.value]);

	// Data Source Memoization
	const dataSource = useMemo(() => {
		return new RestDataSource<StageFileItem, StageFileItem>({
			url: `/api/v1/dashboard/comms/channels/${stage.value!.channel_id}/files`,
			keyExtractor: (item) => item.id,
			defaultParams: {
				category: selectedCategory.value,
				search: searchQuery.value,
			},
		});
	}, [stage.value?.stage_id, stage.value?.channel_id, selectedCategory.value, searchQuery.value]);

	// Event Handlers
	const handleSearchInput = (e: Event) => {
		const target = e.target as HTMLInputElement;
		searchQuery.value = target.value;
		selectedFile.value = null; // Reset selection on search
	};

	const handleCategoryChange = (value: unknown) => {
		selectedCategory.value = value as string;
		selectedFile.value = null; // Reset selection on filter change
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

			<div class='project-files__content'>
				<DataDisplay<StageFileItem, StageFileItem>
					dataSource={dataSource}
					mode={displayMode.value}
					gridColumns={4}
					estimateHeight={displayMode.value === 'grid' ? 160 : 72}
					pageSize={30}
					selectionMode='single'
					renderItem={(item) => (
						<StageFilesItem
							attachment={item.attachment}
							message={item.message}
							isSelected={selectedFile.value?.id === item.id}
							onClick={() => selectedFile.value = item}
						/>
					)}
					interactive={false}
				/>
			</div>
		</div>
	);
}
/* #endregion */
