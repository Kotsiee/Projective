import { ComponentChildren } from 'preact';
import { useGlobalDrag } from '../hooks/useGlobalDrag.ts';
import { FileFieldProps } from '../types/file.ts';
import { FileDrop } from '../components/FileDrop.tsx';

interface GlobalFileDropProps extends FileFieldProps {
	children: ComponentChildren;
	overlayText?: string;
}

export default function GlobalFileDrop(props: GlobalFileDropProps) {
	const isDragging = useGlobalDrag();
	const { children, overlayText, ...fileDropProps } = props;

	return (
		<div
			className='global-drop-wrapper'
			style={{ position: 'relative', height: '100%', minHeight: '100vh' }}
		>
			{/* 1. Main Content */}
			<div className='global-drop-content'>
				{children}
			</div>

			{/* 2. Overlay (Visible on Drag) */}
			{isDragging.value && (
				<div
					className='global-drop-overlay'
					style={{
						position: 'fixed',
						inset: 0,
						zIndex: 9999,
						background: 'rgba(255, 255, 255, 0.9)',
						backdropFilter: 'blur(4px)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						padding: '3rem',
					}}
				>
					{
						/* We reuse FileDrop but apply specific styles to make it fill the modal
            and hide the default list, acting purely as a target.
          */
					}
					<div style={{ width: '100%', height: '100%', maxWidth: '800px', maxHeight: '600px' }}>
						<FileDrop
							{...fileDropProps}
							className='file-drop--global-active'
							dropzoneLabel={overlayText || 'Drop files anywhere to upload'}
							layout='list'
						/>
					</div>
				</div>
			)}
		</div>
	);
}
