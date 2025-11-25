import '@styles/components/navigation/nav-bar.css';
import NavBarGuest from '@components/navigation/NavBarGuest.tsx';
import NavBarUser from '@components/navigation/NavBarUser.tsx';
import NavBarUserSide from '@components/navigation/NavBarUserSide.tsx';

export default function NavBar(props: { isAuthenticated?: boolean }) {
	return (
		<>
			<header>
				<nav>
					{props.isAuthenticated ? <NavBarUser /> : <NavBarGuest />}
				</nav>
			</header>
			{props.isAuthenticated &&
				<NavBarUserSide />}
		</>
	);
}
