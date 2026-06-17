import LoginModal from '@features/navigation/components/overlays/login-modal.tsx';
import '../../styles/components/navigation/nav-bar-guest.css';

/**
 * NavBarGuest
 * * The public-facing navigation bar for unauthenticated users.
 * Provides links to explore the platform and triggers the Auth Modal island for login.
 */
export default function NavBarGuest() {
	return (
		<div class='nav-bar-guest'>
			{/* Brand / Logo */}
			<a href='/' class='nav-bar-guest__brand' aria-label='Projective Home'>
				<img
					src='https://placehold.co/140x40/288690/FFFFFF?text=Projective'
					alt='Projective Logo'
					class='nav-bar-guest__logo'
				/>
			</a>

			{/* Center Links */}
			<div class='nav-bar-guest__nav'>
				<a href='/explore' class='nav-bar-guest__link'>Explore</a>
				<a href='/services' class='nav-bar-guest__link'>Services</a>
				<a href='/about' class='nav-bar-guest__link'>How it Works</a>
			</div>

			{/* Actions - Rendered via an Island to manage Modal State */}
			<div class='nav-bar-guest__actions'>
				<LoginModal />
			</div>
		</div>
	);
}
