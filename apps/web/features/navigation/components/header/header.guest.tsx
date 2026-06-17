import '../../styles/components/header/header.guest.css';
import { Button, Icon, Logo } from '@projective/ui';
import { IconChevronDown, IconSearch } from '@tabler/icons-preact';
import LoginModal, {
	isLoginModalOpen,
} from '@features/navigation/components/overlays/login-modal.tsx';

export default function NavigationGuestHeader() {
	return (
		<>
			<header class='navigation__guest__header'>
				<div class='navigation__guest__left'>
					<a href='/' aria-label='Home' class='navigation__guest__logo'>
						<Icon size={32}>
							<Logo color='var(--primary)' />
						</Icon>
					</a>

					<div class='navigation__guest__search'>
						<IconSearch class='navigation__guest__search-icon' size={18} stroke={2} />
						<input
							class='navigation__guest__search-input'
							type='text'
							placeholder='Search...'
							aria-label='Search'
						/>
					</div>

					<nav class='navigation__guest__links'>
						<a href='#' class='navigation__guest__link'>
							Explore <IconChevronDown size={14} stroke={2.5} />
						</a>
						<a href='#' class='navigation__guest__link'>
							Hire Talent <IconChevronDown size={14} stroke={2.5} />
						</a>
						<a href='#' class='navigation__guest__link'>
							Get Hired <IconChevronDown size={14} stroke={2.5} />
						</a>
					</nav>
				</div>

				<div class='navigation__guest__right'>
					{/* 2. Change from an href to an onClick handler */}
					<Button
						ghost
						rounded
						onClick={() => (isLoginModalOpen.value = true)}
						className='navigation__guest__login'
					>
						Login
					</Button>
					<Button
						variant='primary'
						rounded
						href='/join'
						className='navigation__guest__join'
					>
						Join
					</Button>
				</div>
			</header>

			{/* 3. Render the Modal outside the header flow */}
			<LoginModal />
		</>
	);
}
