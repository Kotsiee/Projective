import { IconX } from '@tabler/icons-preact';
import { FileTypeIcon } from '@projective/ui';
import { LibraryStore } from './useLibraryStore.ts';

interface SelectionTrayProps {
	store: LibraryStore;
}

/**
 * The horizontal tray of selected-file pills shown above the footer. Clicking a
 * pill's name navigates the browser to the folder housing that file; clicking the
 * cross removes it from the selection.
 */
export function SelectionTray({ store }: SelectionTrayProps) {
	const selected = [...store.selected.value.values()];
	if (selected.length === 0) return null;

	return (
		<div class='uf-tray'>
			<div class='uf-tray__head'>
				<span class='uf-tray__label'>Selected · {selected.length}</span>
				<button type='button' class='uf-tray__clear' onClick={() => store.clearSelection()}>
					Clear all
				</button>
			</div>
			<div class='uf-tray__pills'>
				{selected.map((file) => (
					<div key={file.id} class='uf-tray__pill'>
						<span class='uf-tray__pill-icon'>
							<FileTypeIcon
								name={file.name}
								mimeType={file.mimeType}
								category={file.category}
								size={22}
							/>
						</span>
						<button
							type='button'
							class='uf-tray__pill-name'
							title={`Go to ${file.name}`}
							onClick={() => store.navigateToFile(file)}
						>
							{file.name}
						</button>
						<button
							type='button'
							class='uf-tray__pill-remove'
							aria-label={`Remove ${file.name} from selection`}
							onClick={() => store.removeSelect(file.id)}
						>
							<IconX size={13} />
						</button>
					</div>
				))}
			</div>
		</div>
	);
}
