import { IconCheck, IconFile, IconLoader2, IconPhoto, IconX } from '@tabler/icons-preact';
import { formatBytes } from '@projective/shared';
import { FileWithMeta } from '@projective/types';

interface FileListItemProps {
	item: FileWithMeta;
	onRemove: (id: string) => void;
	layout?: 'list' | 'grid';
}

export default function FileListItem({ item, onRemove, layout = 'list' }: FileListItemProps) {
	const isError = item.status === 'error';
	const isProcessing = item.status === 'processing';
	const isReady = item.status === 'ready';

	const renderThumbnail = () => {
		if (isProcessing) {
			return (
				<div className='file-item__loader'>
					<IconLoader2 size={24} className='file-item__spin' />
				</div>
			);
		}
		if (item.preview) return <img src={item.preview} alt='' className='file-item__img' />;
		if (item.file.type.includes('image')) return <IconPhoto size={24} />;
		return <IconFile size={24} />;
	};

	const renderStatus = () => {
		if (isProcessing) {
			return <span className='file-item__status'>Processing {Math.round(item.progress)}%</span>;
		}
		if (isReady && item.processingMeta?.optimization) {
			return <span className='file-item__success'>{item.processingMeta.optimization}</span>;
		}
		return null;
	};

	if (layout === 'grid') {
		return (
			<div className={`file-card ${isError ? 'file-card--error' : ''}`}>
				<div className='file-card__preview'>
					{renderThumbnail()}
					<button type='button' className='file-card__remove' onClick={() => onRemove(item.id)}>
						<IconX size={14} />
					</button>
					{isProcessing && (
						<div className='file-card__progress-bar'>
							<div style={{ width: `${item.progress}%` }} />
						</div>
					)}
				</div>
				<div className='file-card__info'>
					<div className='file-card__name'>{item.file.name}</div>
					<div className='file-card__meta'>
						{isError ? item.errors[0].message : formatBytes(item.file.size)}
					</div>
					{renderStatus()}
				</div>
			</div>
		);
	}

	return (
		<div className={`file-item ${isError ? 'file-item--error' : ''}`}>
			<div className='file-item__preview'>{renderThumbnail()}</div>

			<div className='file-item__info'>
				<div className='file-item__header'>
					<span className='file-item__name'>{item.file.name}</span>
					{isReady && !item.processingMeta && <IconCheck size={14} className='file-item__check' />}
				</div>

				<div className='file-item__meta'>
					{formatBytes(item.file.size)}
					{isError && <span className='file-item__error-text'>• {item.errors[0].message}</span>}
					{renderStatus()}
				</div>

				{isProcessing && (
					<div className='file-item__progress-track'>
						<div className='file-item__progress-fill' style={{ width: `${item.progress}%` }} />
					</div>
				)}
			</div>

			<button type='button' className='file-item__remove' onClick={() => onRemove(item.id)}>
				<IconX size={16} />
			</button>
		</div>
	);
}
