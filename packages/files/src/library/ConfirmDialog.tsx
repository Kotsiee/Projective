import { Button, Overlay } from '@projective/ui';

interface ConfirmDialogProps {
	isOpen: boolean;
	title: string;
	message: string;
	confirmLabel?: string;
	cancelLabel?: string;
	danger?: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}

/**
 * A small centered confirmation modal used before destructive actions such as
 * deleting a directory or file.
 */
export function ConfirmDialog({
	isOpen,
	title,
	message,
	confirmLabel = 'Delete',
	cancelLabel = 'Cancel',
	danger = true,
	onConfirm,
	onCancel,
}: ConfirmDialogProps) {
	return (
		<Overlay
			type='modal'
			isOpen={isOpen}
			onClose={onCancel}
			title={title}
			width={420}
			// Keep this modal above the browser modal it is spawned from.
			isSticky
		>
			<div class='upload-confirm'>
				<p class='upload-confirm__message'>{message}</p>
				<div class='upload-confirm__actions'>
					<Button variant='secondary' onClick={onCancel}>{cancelLabel}</Button>
					<Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
						{confirmLabel}
					</Button>
				</div>
			</div>
		</Overlay>
	);
}
