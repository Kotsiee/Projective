import '@styles/components/navigation/nav-bar-guest.css';
import { theme } from '@ui';

export default function NavBarGuest() {
	const switchTheme = () => {
		if (theme.value === 'light') {
			theme.value = 'dark';
		} else {
			theme.value = 'light';
		}
	};

	return (
		<div class='header-container'>
			<div class='header__logo'>
				<h1>Projective</h1>
			</div>
			<div class='header__buttons'>
				<button type='button'>search</button>
				<button type='button' onClick={() => switchTheme()}>{theme.value}</button>
				<a href='#'>Explore</a>
				<a class='header__buttons__user header__buttons__login' href='/login'>Login</a>
				<a class='header__buttons__user header__buttons__join' href='/register'>Join</a>
			</div>
		</div>
	);
}
