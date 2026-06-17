import { Button } from '@projective/ui';
import '../../../styles/components/onboarding/actions/sso-actions.css'; // Make sure to adjust the import path based on your file structure

export function SSOActions() {
	return (
		<div className='ssoactions'>
			<div className='ssoactions__divider'>
				<div className='ssoactions__line' />
				<span className='ssoactions__text'>OR</span>
				<div className='ssoactions__line' />
			</div>

			<Button
				className='ssoactions__button'
				variant='secondary'
				fullWidth
				onClick={() => globalThis.location.href = '/api/v1/auth/google'}
			>
				<img
					src='https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg'
					alt='GitHub'
					className='ssoactions__github-icon'
				/>
				Continue with Google
			</Button>

			<Button
				className='ssoactions__button'
				variant='secondary'
				fullWidth
				onClick={() => globalThis.location.href = '/api/v1/auth/github'}
			>
				<img
					src='/images/GitHub_Invertocat_Black.svg'
					alt='GitHub'
					className='ssoactions__github-icon'
				/>
				Continue with GitHub
			</Button>
		</div>
	);
}
