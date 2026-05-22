import { ComponentChildren } from 'preact';
import '../styles/layouts/auth.css';

export interface AuthLayoutProps {
	/** Content for the left pane (Hidden on mobile) */
	anchorContent: ComponentChildren;
	/** Main interactive form (Right pane) */
	children: ComponentChildren;
	/** Width ratio of the left pane. @default '50' */
	anchorRatio?: '45' | '50';
}

export default function AuthLayout(
	{ anchorContent, children, anchorRatio = '50' }: AuthLayoutProps,
) {
	return (
		<div class='auth-layout'>
			{/* Left Pane - Forced Dark Mode */}
			<div class={`auth-layout__anchor auth-layout__anchor--${anchorRatio}`} data-theme='dark'>
				{anchorContent}
			</div>

			{/* Right Pane - Form Canvas */}
			<div class='auth-layout__content'>
				<div class='auth-layout__form-wrapper'>
					{/* Mobile-only brand header */}
					<div class='auth-layout__mobile-header'>
						<img
							src='https://placehold.co/32x32/288690/FFFFFF?text=P'
							alt='Projective'
							class='auth-layout__mobile-logo'
						/>
						<span>Projective</span>
					</div>

					{children}
				</div>
			</div>
		</div>
	);
}
