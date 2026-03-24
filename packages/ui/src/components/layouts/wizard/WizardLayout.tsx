import '../../../styles/components/wizard.css';
import { ComponentChildren } from 'preact';
import { IconArrowLeft } from '@tabler/icons-preact';
import { IconButton } from '../../button/IconButton.tsx';

interface WizardLayoutProps {
	title: string;
	backHref?: string;
	children: ComponentChildren;
	className?: string;
}

export function WizardLayout({ title, backHref, children, className }: WizardLayoutProps) {
	return (
		<div className={`wizard ${className || ''}`}>
			<div className='wizard__header'>
				<h1 className='wizard__title'>
					{backHref && (
						<IconButton
							href={backHref}
							variant='secondary'
							ghost
							rounded
							aria-label='Go back'
						>
							<IconArrowLeft size={24} />
						</IconButton>
					)}
					{title}
				</h1>
			</div>

			<div className='wizard__card'>
				{children}
			</div>
		</div>
	);
}

// Sub-components for structure slots
export function WizardStage({ children }: { children: ComponentChildren }) {
	return <div className='wizard__stage'>{children}</div>;
}

export function WizardForm({ children }: { children: ComponentChildren }) {
	return <div className='wizard__form'>{children}</div>;
}

export function WizardPreview({ children }: { children: ComponentChildren }) {
	return <div className='wizard__preview'>{children}</div>;
}
