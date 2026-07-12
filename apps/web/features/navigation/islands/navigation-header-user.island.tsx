import { Button, Icon, matchSystemTheme, ProgressMeter, setTheme, theme } from '@projective/ui';
import {
	IconBriefcase,
	IconCheck,
	IconDeviceDesktop,
	IconLogout,
	IconMenu,
	IconMoon,
	IconSettings,
	IconSun,
	IconUser,
	IconUsersGroup,
} from '@tabler/icons-preact';
import { useSignal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
import { useUserContext } from '../contexts/UserContext.tsx';
import '../styles/components/header/user-menu.css';

const AVATAR_FALLBACK = 'https://www.mamp.one/wp-content/uploads/2024/09/image-resources2.jpg';

/**
 * @island NavigationHeaderUser
 * @description Header avatar button that toggles a BEM-styled dropdown exposing
 * the four account surfaces required by the shell:
 *  1. **Context switching** — freelancer persona, owned/member businesses & teams,
 *     each dispatching to {@link UserContext} `switchProfile`/`switchTeam` (thin
 *     `/api/v1/auth/switch-*` routes that mutate `security.session_context`).
 *  2. **Theming** — light/dark override plus a "match system" reset, kept in sync
 *     with `document[data-theme]` through the shared {@link theme} signal.
 *  3. **Navigation** — public profile (`/[username]`) and account settings.
 *  4. **Logout** — delegates to {@link UserContext} `logout`, which clears cookies
 *     and redirects to `/login`.
 *
 * Reactive signals: `isOpen` (dropdown visibility) and, transitively, the user
 * signal from context plus the global theme signal.
 *
 * @returns {preact.JSX.Element} The avatar trigger and its absolute dropdown.
 */
export default function NavigationHeaderUser() {
	// #region State & Context
	const rootRef = useRef<HTMLDivElement>(null);
	const isOpen = useSignal(false);
	const { user, logout, switchProfile, switchTeam } = useUserContext();

	const profile = user.value;
	const avatar = profile?.avatarUrl && profile.avatarUrl.startsWith('http')
		? profile.avatarUrl
		: AVATAR_FALLBACK;
	const activeTheme = theme.value;
	// #endregion

	// #region Handlers
	const close = () => (isOpen.value = false);

	const onFreelancer = async () => {
		if (profile?.freelancerProfileId) {
			await switchProfile(profile.freelancerProfileId, 'freelancer');
		}
		close();
	};

	const onBusiness = async (id: string) => {
		await switchProfile(id, 'business');
		close();
	};

	const onTeam = async (id: string) => {
		await switchTeam(id);
		close();
	};

	const onLogout = async () => {
		close();
		await logout();
	};
	// #endregion

	// #region Outside-click / Escape dismissal
	useEffect(() => {
		if (!isOpen.value) return;

		const onPointer = (e: MouseEvent) => {
			if (rootRef.current && !rootRef.current.contains(e.target as Node)) close();
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') close();
		};

		document.addEventListener('mousedown', onPointer);
		document.addEventListener('keydown', onKey);
		return () => {
			document.removeEventListener('mousedown', onPointer);
			document.removeEventListener('keydown', onKey);
		};
	}, [isOpen.value]);
	// #endregion

	// #region Derived active-context flags
	const isFreelancerActive = profile?.activeProfileType === 'freelancer';
	const isBusinessActive = (id: string) =>
		profile?.activeProfileType === 'business' && profile?.activeProfileId === id;
	const isTeamActive = (id: string) => profile?.activeTeamId === id;
	// #endregion

	return (
		<div class='navigation__user-menu' ref={rootRef}>
			{/* #region Trigger */}
			<Button
				aria-label='User menu'
				rounded
				className='navigation__user'
				variant='secondary'
				onClick={() => (isOpen.value = !isOpen.value)}
			>
				<Icon class='navigation__user-icon' size={18}>
					<IconMenu />
				</Icon>
				<div class='navigation__user-avatar'>
					<img src={avatar} alt='' />
				</div>
			</Button>
			{/* #endregion */}

			{isOpen.value && (
				<div class='navigation__user-menu__dropdown' role='menu'>
					{/* #region Identity header */}
					<div class='navigation__user-menu__identity'>
						<img class='navigation__user-menu__avatar' src={avatar} alt='' />
						<div class='navigation__user-menu__identity-text'>
							<span class='navigation__user-menu__name'>
								{profile?.displayName ?? 'Your account'}
							</span>
							{profile?.username && (
								<span class='navigation__user-menu__handle'>@{profile.username}</span>
							)}
						</div>
					</div>
					{/* #endregion */}

					{/* #region Profile setup mirror — concise echo of the /home tracker */}
					{profile?.profileSetup && profile.profileSetup.percent < 100 && (
						<a class='navigation__user-menu__setup' href='/home' role='menuitem'>
							<div class='navigation__user-menu__setup-top'>
								<span class='navigation__user-menu__setup-label'>Complete your profile</span>
								<span class='navigation__user-menu__setup-pct'>
									{profile.profileSetup.percent}%
								</span>
							</div>
							<ProgressMeter
								value={profile.profileSetup.percent}
								tone='gold'
								showValue={false}
								thickness={5}
								milestone={profile.profileSetup.milestone}
							/>
							<span class='navigation__user-menu__setup-hint'>
								{profile.profileSetup.total - profile.profileSetup.completed} steps left →
							</span>
						</a>
					)}
					{/* #endregion */}

					{/* #region Context switching */}
					<div class='navigation__user-menu__section'>
						<span class='navigation__user-menu__label'>Switch context</span>

						{profile?.hasFreelancer && (
							<button
								type='button'
								class='navigation__user-menu__item'
								data-active={isFreelancerActive}
								onClick={onFreelancer}
							>
								<Icon size={18}>
									<IconUser />
								</Icon>
								<span class='navigation__user-menu__item-text'>Freelancer</span>
								{isFreelancerActive && (
									<Icon size={16} class='navigation__user-menu__check'>
										<IconCheck />
									</Icon>
								)}
							</button>
						)}

						{profile?.businesses.map((b) => (
							<button
								key={b.id}
								type='button'
								class='navigation__user-menu__item'
								data-active={isBusinessActive(b.id)}
								onClick={() => onBusiness(b.id)}
							>
								<Icon size={18}>
									<IconBriefcase />
								</Icon>
								<span class='navigation__user-menu__item-text'>{b.name}</span>
								{isBusinessActive(b.id) && (
									<Icon size={16} class='navigation__user-menu__check'>
										<IconCheck />
									</Icon>
								)}
							</button>
						))}

						{profile?.teams.map((t) => (
							<button
								key={t.id}
								type='button'
								class='navigation__user-menu__item'
								data-active={isTeamActive(t.id)}
								onClick={() => onTeam(t.id)}
							>
								<Icon size={18}>
									<IconUsersGroup />
								</Icon>
								<span class='navigation__user-menu__item-text'>{t.name}</span>
								{isTeamActive(t.id) && (
									<Icon size={16} class='navigation__user-menu__check'>
										<IconCheck />
									</Icon>
								)}
							</button>
						))}
					</div>
					{/* #endregion */}

					{/* #region Theming */}
					<div class='navigation__user-menu__section'>
						<span class='navigation__user-menu__label'>Appearance</span>
						<div class='navigation__user-menu__theme'>
							<button
								type='button'
								class='navigation__user-menu__theme-option'
								data-active={activeTheme === 'light'}
								onClick={() => setTheme('light')}
							>
								<Icon size={16}>
									<IconSun />
								</Icon>
								Light
							</button>
							<button
								type='button'
								class='navigation__user-menu__theme-option'
								data-active={activeTheme === 'dark'}
								onClick={() => setTheme('dark')}
							>
								<Icon size={16}>
									<IconMoon />
								</Icon>
								Dark
							</button>
							<button
								type='button'
								class='navigation__user-menu__theme-option'
								onClick={() => matchSystemTheme()}
							>
								<Icon size={16}>
									<IconDeviceDesktop />
								</Icon>
								System
							</button>
						</div>
					</div>
					{/* #endregion */}

					{/* #region Navigation links */}
					<div class='navigation__user-menu__section'>
						{profile?.username && (
							<a
								class='navigation__user-menu__item'
								href={`/${profile.username}`}
							>
								<Icon size={18}>
									<IconUser />
								</Icon>
								<span class='navigation__user-menu__item-text'>View public profile</span>
							</a>
						)}
						<a class='navigation__user-menu__item' href='/dashboard/settings'>
							<Icon size={18}>
								<IconSettings />
							</Icon>
							<span class='navigation__user-menu__item-text'>Account settings</span>
						</a>
					</div>
					{/* #endregion */}

					{/* #region Logout */}
					<div class='navigation__user-menu__section navigation__user-menu__section--footer'>
						<button
							type='button'
							class='navigation__user-menu__item navigation__user-menu__item--danger'
							onClick={onLogout}
						>
							<Icon size={18}>
								<IconLogout />
							</Icon>
							<span class='navigation__user-menu__item-text'>Log out</span>
						</button>
					</div>
					{/* #endregion */}
				</div>
			)}
		</div>
	);
}
