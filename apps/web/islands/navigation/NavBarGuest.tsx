import { theme } from '../../../../packages/ui/utils/ThemeSwitcher.ts';
import '@styles/islands/navigation/nav-bar-guest.css';

export default function NavBarGuest() {
	console.log(theme.value);

	const switchTheme = () => {
		if (theme.value === 'light') {
			theme.value = 'dark';
		} else {
			theme.value = 'light';
		}
	};

	return (
		<header>
			<div class='header-container'>
				<div class='header__logo'>
					<h1>Projective</h1>
				</div>
				<div class='header__buttons'>
					<button type='button'>search</button>
					<button type='button' onClick={() => switchTheme()}>{theme.value}</button>
					<a href='#'>Explore</a>
					<a class='header__buttons__user header__buttons__login' href='#'>Login</a>
					<a class='header__buttons__user header__buttons__join' href='#'>Join</a>
				</div>
			</div>
		</header>
	);
}

{
	/* <a href='#' onClick={() => (theme.value = 'dark')}>Login</a>
					<a href='#' onClick={() => (theme.value = 'light')}>Join</a> */
}
