import {
	ChatMessageAttachment,
	ChatMessageData,
} from '@islands/pages/dashboard/projects/project/stage/ChatNetworkSource.ts';

interface ChatMessageProps {
	message: ChatMessageData;
	onRetry?: (tempId: string) => void;
}

function formatBytes(bytes: number, decimals = 1) {
	if (!bytes || bytes === 0) return '0 B';
	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['B', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const FileAttachment = (
	{ file, isSelf }: { file: ChatMessageAttachment; isSelf: boolean },
) => {
	const isImage = file.type.startsWith('image/');

	if (isImage) {
		return (
			<div style={{ marginBottom: '8px', marginTop: '4px' }}>
				<a href={file.url} target='_blank' rel='noopener noreferrer'>
					<img
						src={file.url}
						alt={file.name}
						style={{
							maxWidth: '100%',
							maxHeight: '300px',
							borderRadius: '8px',
							objectFit: 'cover',
							border: '1px solid rgba(0,0,0,0.1)',
							display: 'block',
						}}
						onError={(e) => {
							(e.target as HTMLImageElement).style.display = 'none';
						}}
					/>
				</a>
			</div>
		);
	}

	return (
		<a
			href={file.url}
			target='_blank'
			rel='noopener noreferrer'
			style={{
				display: 'flex',
				alignItems: 'center',
				padding: '8px 12px',
				marginBottom: '8px',
				backgroundColor: isSelf ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.05)',
				borderRadius: '8px',
				textDecoration: 'none',
				color: 'inherit',
				border: isSelf ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(0,0,0,0.1)',
				transition: 'background-color 0.2s',
			}}
		>
			<div
				style={{
					marginRight: '10px',
					display: 'flex',
					alignItems: 'center',
				}}
			>
				<svg
					width='24'
					height='24'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='2'
					strokeLinecap='round'
					strokeLinejoin='round'
				>
					<path d='M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z' />
					<polyline points='14 2 14 8 20 8' />
				</svg>
			</div>
			<div style={{ overflow: 'hidden' }}>
				<div
					style={{
						fontSize: '0.85rem',
						fontWeight: '500',
						whiteSpace: 'nowrap',
						overflow: 'hidden',
						textOverflow: 'ellipsis',
					}}
					title={file.name}
				>
					{file.name}
				</div>
				<div
					style={{
						fontSize: '0.7rem',
						opacity: 0.8,
					}}
				>
					{formatBytes(file.size)} • {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
				</div>
			</div>
		</a>
	);
};

export default function ChatMessage({ message, onRetry }: ChatMessageProps) {
	const isSelf = message.isSelf;
	const hasAttachments = message.attachments && message.attachments.length > 0;

	// Evaluate status
	const isSending = message.status === 'sending';
	const isError = message.status === 'error';

	return (
		<div
			style={{
				display: 'flex',
				justifyContent: isSelf ? 'flex-end' : 'flex-start',
				padding: '8px 16px',
				width: '100%',
				boxSizing: 'border-box',
				opacity: isSending ? 0.6 : 1,
				transition: 'opacity 0.2s ease-in-out',
			}}
		>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					maxWidth: '70%',
					alignItems: isSelf ? 'flex-end' : 'flex-start',
				}}
			>
				{!isSelf && (
					<div
						style={{
							fontSize: '0.75rem',
							color: '#6b7280',
							marginBottom: '2px',
							marginLeft: '4px',
						}}
					>
						{message.sender.name}
					</div>
				)}

				<div
					style={{
						backgroundColor: isSelf ? 'var(--primary-500, #3b82f6)' : 'var(--gray-200, #e5e7eb)',
						color: isSelf ? 'white' : 'var(--text-primary, #111827)',
						borderRadius: '12px',
						borderBottomRightRadius: isSelf ? '2px' : '12px',
						borderBottomLeftRadius: isSelf ? '12px' : '2px',
						padding: '10px 14px',
						boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
						width: hasAttachments ? '100%' : 'auto',
						minWidth: hasAttachments ? '200px' : 'auto',
					}}
				>
					{hasAttachments && (
						<div style={{ display: 'flex', flexDirection: 'column' }}>
							{message.attachments!.map((att) => (
								<FileAttachment key={att.id} file={att} isSelf={isSelf} />
							))}
						</div>
					)}

					{message.text && (
						<div
							style={{
								fontSize: '0.9rem',
								lineHeight: '1.4',
								whiteSpace: 'pre-wrap',
								wordBreak: 'break-word',
							}}
						>
							{message.text}
						</div>
					)}

					<div style={{ fontSize: '0.7rem', marginTop: '4px', opacity: 0.8, textAlign: 'right' }}>
						{new Date(message.timestamp).toLocaleTimeString([], {
							hour: '2-digit',
							minute: '2-digit',
						})}
					</div>
				</div>

				{/* Status Indicators */}
				{isSending && (
					<div
						style={{
							fontSize: '0.7rem',
							color: '#6b7280',
							marginTop: '4px',
							display: 'flex',
							justifyContent: 'flex-end',
						}}
					>
						Sending...
					</div>
				)}

				{isError && (
					<div
						style={{
							fontSize: '0.7rem',
							color: '#ef4444',
							marginTop: '4px',
							display: 'flex',
							justifyContent: 'flex-end',
							alignItems: 'center',
							gap: '6px',
						}}
					>
						Failed to send
						<button
							type='button'
							onClick={() => onRetry?.(message.tempId!)}
							style={{
								background: 'none',
								border: 'none',
								color: '#ef4444',
								textDecoration: 'underline',
								cursor: 'pointer',
								padding: 0,
								fontSize: '0.7rem',
							}}
						>
							Retry
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
