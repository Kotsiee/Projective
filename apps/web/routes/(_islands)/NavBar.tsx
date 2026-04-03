import NavBarGuest from '../../features/shared/components/navigation/NavBarGuest.tsx';
import NavBarUser from '../../features/shared/components/navigation/NavBarUser.tsx';
import NavBarUserSide from '../../features/shared/components/navigation/NavBarUserSide.tsx';
import '../../features/shared/styles/components/navigation/nav-bar.css';

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
