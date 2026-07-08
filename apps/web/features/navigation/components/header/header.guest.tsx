import '../../styles/components/header/header.guest.css';
import { Button, Icon, Logo, RippleSurface, ThemeToggle } from '@projective/ui';
import { SearchInput } from '@projective/fields';
import { IconSparkles } from '@tabler/icons-preact';
import LoginModal, {
	isLoginModalOpen,
} from '@features/navigation/components/overlays/login-modal.tsx';
import { useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';

/** Facet links — each isolates a single discovery surface on the Explore hub. */
const NAV_LINKS = [
	{ label: 'Explore', href: '/explore' },
	{ label: 'Services', href: '/explore?type=service' },
	{ label: 'Talent', href: '/explore?type=person' },
	{ label: 'Projects', href: '/explore?type=project' },
];

/**
 * @component NavigationGuestHeader
 * @description The premium glassmorphism top bar for signed-out visitors. Composed from atomic,
 * independently-hydrating primitives (ripple links, cinematic search, spring theme toggle) rather
 * than one monolith. Densifies its backdrop on scroll for depth.
 */
export default function NavigationGuestHeader() {
	const scrolled = useSignal(false);
	const query = useSignal('');

	useEffect(() => {
		const onScroll = () => {
			const next = (globalThis.scrollY ?? 0) > 6;
			if (next !== scrolled.value) scrolled.value = next;
		};
		onScroll();
		globalThis.addEventListener('scroll', onScroll, { passive: true });
		return () => globalThis.removeEventListener('scroll', onScroll);
	}, []);

	const submit = (q?: string) => {
		const term = (q ?? query.value).trim();
		globalThis.location.href = term ? `/explore?q=${encodeURIComponent(term)}` : '/explore';
	};

	return (
		<>
			<header
				class={['navigation__guest__header', scrolled.value && 'is-scrolled']
					.filter(Boolean)
					.join(' ')}
			>
				<div class='navigation__guest__left'>
					<a href='/' aria-label='Projective home' class='navigation__guest__logo'>
						<span class='navigation__guest__logo-mark'>
							<Icon size={28}>
								<Logo color='var(--primary)' />
							</Icon>
						</span>
						<span class='navigation__guest__wordmark'>Projective</span>
					</a>

					<nav class='navigation__guest__links' aria-label='Primary'>
						{NAV_LINKS.map((l) => (
							<RippleSurface
								key={l.href}
								as='a'
								href={l.href}
								class='navigation__guest__link'
							>
								{l.label}
							</RippleSurface>
						))}
					</nav>
				</div>

				<div class='navigation__guest__search'>
					<SearchInput
						variant='glass'
						value={query}
						onSearch={submit}
						placeholder='Search services, talent, projects…'
						aria-label='Search Projective'
					/>
				</div>

				<div class='navigation__guest__right'>
					<ThemeToggle compact />
					<Button
						ghost
						rounded
						onClick={() => (isLoginModalOpen.value = true)}
						className='navigation__guest__login'
					>
						Log in
					</Button>
					<Button
						variant='premium'
						rounded
						href='/join'
						className='navigation__guest__join'
						startIcon={<IconSparkles size={16} />}
					>
						Join free
					</Button>
				</div>
			</header>

			<LoginModal />
		</>
	);
}
