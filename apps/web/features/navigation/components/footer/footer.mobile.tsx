import { useUserContext } from '../../contexts/UserContext.tsx';
import {
	IconCalendarEvent,
	IconCompass,
	IconHome,
	IconMessage,
	IconPlus,
} from '@tabler/icons-preact';
import '../../styles/components/footer/footer.mobile.css';
import { IconButton } from '@projective/ui';

export default function NavigationMobileFooter() {
	const { isAuthenticated } = useUserContext();

	// Do not render the footer if the user is not logged in
	if (!isAuthenticated.value) return null;

	return (
		<footer class='navigation__mobile__footer'>
			<a href='/home' class='navigation__mobile__footer-link'>
				<IconHome size={24} stroke={1.5} />
				<span>Home</span>
			</a>
			<a href='/explore' class='navigation__mobile__footer-link'>
				<IconCompass size={24} stroke={1.5} />
				<span>Explore</span>
			</a>

			<div class='navigation__mobile__footer-action-wrapper'>
				<IconButton
					variant='primary'
					className='navigation__mobile__footer-action'
					aria-label='Create'
					ghost={false}
					rounded
				>
					<IconPlus size={28} stroke={2} />
				</IconButton>
			</div>

			<a href='/messages' class='navigation__mobile__footer-link'>
				<IconMessage size={24} stroke={1.5} />
				<span>Messages</span>
			</a>
			<a href='/calendar' class='navigation__mobile__footer-link'>
				<IconCalendarEvent size={24} stroke={1.5} />
				<span>Calendar</span>
			</a>
		</footer>
	);
}
