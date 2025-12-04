import { ComponentChildren } from 'preact';
import { useGlobalDrag } from '../../hooks/useGlobalDrag.ts';
import { FileFieldProps } from 'packages/types/file.ts';
import FileDrop from '../fields/file/FileDrop.tsx';

interface GlobalFileDropProps extends FileFieldProps {
	children: ComponentChildren;
	overlayText?: string;
}

export default function GlobalFileDrop(props: GlobalFileDropProps) {
	const isDragging = useGlobalDrag();

	// If dragging, we hijack the drop event in the overlay
	// The FileDrop component already handles onDrop -> addFiles -> onChange

	return (
		<div className='global-drop-wrapper' style={{ position: 'relative', height: '100%' }}>
			{/* 1. The Normal UI (Chat) */}
			<div className='global-drop-content'>
				{props.children}
			</div>

			{/* 2. The Overlay (Only visible when dragging) */}
			{isDragging.value && (
				<div
					className='global-drop-overlay'
					style={{
						position: 'absolute',
						inset: 0,
						zIndex: 100,
						background: 'rgba(255, 255, 255, 0.95)',
						backdropFilter: 'blur(4px)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						padding: '2rem',
					}}
				>
					{/* We reuse FileDrop logic but style it as a big drop target */}
					<FileDrop
						{...props}
						className='file-drop--global' // Custom class for override styles
						dropzoneLabel={props.overlayText || 'Drop files to attach'}
						// We force active state visually since we are already dragging
						layout='list'
					/>
				</div>
			)}
		</div>
	);
}
