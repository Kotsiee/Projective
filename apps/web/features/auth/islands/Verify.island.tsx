/**
 * @file Verify.island.tsx
 * @description The user-facing verification page island, handling email resends and cooldowns.
 */

// #region Imports
import '../styles/pages/verify.css';
import { Icon, IconButton } from '@projective/ui';
import { IconArrowLeft } from '@tabler/icons-preact';
import VerifyEmail from '../components/verify/VerifyEmail.tsx';
// #endregion

// #region Interfaces
export interface VerifyIslandProps {
	/**
	 * Pre-fills the email field if the user was just redirected from onboarding.
	 */
	initialEmail?: string;
}
// #endregion

// #region Component
export default function VerifyIsland({ initialEmail = '' }: VerifyIslandProps) {
	return (
		<div class='verify'>
			<div class='verify__left'>
				<div class='verify__header'>
					<IconButton className='verify__back' href='/' aria-label='Back' ghost>
						<Icon>
							<IconArrowLeft />
						</Icon>
					</IconButton>
					<div class='verify__logo'>Logo</div>
				</div>
			</div>

			<div class='verify__right'>
				<VerifyEmail initialEmail={initialEmail} />
			</div>
		</div>
	);
}
// #endregion
