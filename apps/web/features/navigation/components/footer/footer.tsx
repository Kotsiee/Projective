import { useUserContext } from '../../contexts/UserContext.tsx';
import '../../styles/components/footer/footer.mobile.css';

export default function NavigationMobileFooter() {
	const { isAuthenticated } = useUserContext();

	// Do not render the footer if the user is not logged in
	if (!isAuthenticated.value) return null;

	return (
		<footer class='navigation__footer'>
		</footer>
	);
}
