import { Button, Icon, ProgressMeter, ThemeToggle } from '@projective/ui';
import {
	IconBell,
	IconBriefcase,
	IconChevronRight,
	IconLogout,
	IconMenu,
	IconSettings,
	IconUser,
	IconUserCircle,
	IconUsersGroup,
} from '@tabler/icons-preact';
import { useSignal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
import { useUserContext } from '../contexts/UserContext.tsx';
import '../styles/components/header/user-menu.css';

const AVATAR_FALLBACK = 'https://www.mamp.one/wp-content/uploads/2024/09/image-resources2.jpg';

/**
 * @island NavigationHeaderUser
 * @description Header avatar trigger opening a high-density, frosted-glass account panel:
 *
 *  1. **User short card** — avatar, display name, `@handle`, and the active operational
 *     mode, with the theme micro-switch tucked into its top-right corner.
 *  2. **Embedded persona toggle** — a compact two-segment control adjacent to the card
 *     that smoothly swaps the UI between **Freelancer** and **Client / Operator** modes
 *     (dispatching to {@link UserContext} `switchProfile`). Users with additional
 *     businesses/teams get a progressively-disclosed "more workspaces" reel so nothing is
 *     lost to the condensed control.
 *  3. **Profile completeness tracker** — an animated {@link ProgressMeter} echoing the
 *     /home milestone tracker.
 *  4. **Action matrix** — Settings, Public profile, Notifications, Logout.
 *
 * Reactive signals: `isOpen` (panel visibility), `showMore` (extra-context reel), and,
 * transitively, the user signal from context plus the global theme signal (via ThemeToggle).
 *
 * @returns {preact.JSX.Element} The avatar trigger and its absolute frosted panel.
 */
export default function NavigationHeaderUser() {
	// #region State & Context
	const rootRef = useRef<HTMLDivElement>(null);
	const isOpen = useSignal(false);
	const showMore = useSignal(false);
	const { user, logout, switchProfile, switchTeam } = useUserContext();

	const profile = user.value;
	const avatar = profile?.avatarUrl && profile.avatarUrl.startsWith('http')
		? profile.avatarUrl
		: AVATAR_FALLBACK;
	// #endregion

	// #region Persona model
	// The active side of the Freelancer ⇄ Client/Operator axis. A live team context counts as
	// the freelancer side (teams are a freelancer-only space).
	const isFreelancerSide = profile?.activeProfileType === 'freelancer' ||
		!!profile?.activeTeamId;
	const primaryBusiness = profile?.businesses?.[0] ?? null;
	// The toggle can only flip to a side that actually exists for this account.
	const canBeFreelancer = !!profile?.hasFreelancer && !!profile?.freelancerProfileId;
	const canBeClient = !!primaryBusiness || profile?.isOperator === true;
	const modeLabel = isFreelancerSide
		? 'Freelancer'
		: profile?.activeProfileType === 'business'
		? `Client · ${primaryBusiness?.name ?? 'Business'}`
		: 'Client / Operator';

	// Extra switchable contexts beyond the primary two (surfaced only on demand).
	const extraBusinesses = (profile?.businesses ?? []).filter((b) => b.id !== primaryBusiness?.id);
	const extraTeams = profile?.teams ?? [];
	const hasExtras = extraBusinesses.length > 0 || extraTeams.length > 0;
	// #endregion

	// #region Handlers
	const close = () => {
		isOpen.value = false;
		showMore.value = false;
	};

	const selectFreelancer = async () => {
		if (isFreelancerSide || !canBeFreelancer) return;
		await switchProfile(profile!.freelancerProfileId!, 'freelancer');
		close();
	};

	const selectClient = async () => {
		if (!isFreelancerSide || !canBeClient) return;
		if (primaryBusiness) await switchProfile(primaryBusiness.id, 'business');
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
				<Icon class='navigation__user-icon' size={20}>
					<IconMenu stroke={1.5} />
				</Icon>
				<div class='navigation__user-avatar'>
					<img src={avatar} alt='' />
				</div>
			</Button>
			{/* #endregion */}

			{isOpen.value && (
				<div class='navigation__user-menu__dropdown' role='menu'>
					{/* #region User short card + theme micro-switch */}
					<div class='navigation__user-menu__card'>
						<div class='navigation__user-menu__theme-slot'>
							<ThemeToggle compact />
						</div>
						<img class='navigation__user-menu__avatar' src={avatar} alt='' />
						<div class='navigation__user-menu__identity-text'>
							<span class='navigation__user-menu__name'>
								{profile?.displayName ?? 'Your account'}
							</span>
							{profile?.username && (
								<span class='navigation__user-menu__handle'>@{profile.username}</span>
							)}
							<span class='navigation__user-menu__mode'>
								<span class='navigation__user-menu__mode-dot' aria-hidden='true' />
								{modeLabel}
							</span>
						</div>
					</div>
					{/* #endregion */}

					{/* #region Embedded persona toggle */}
					<div
						class='navigation__user-menu__persona'
						role='group'
						aria-label='Switch operational mode'
					>
						<button
							type='button'
							class='navigation__user-menu__persona-seg'
							data-active={isFreelancerSide}
							disabled={!canBeFreelancer}
							onClick={selectFreelancer}
						>
							<Icon size={16}>
								<IconUser />
							</Icon>
							Freelancer
						</button>
						<button
							type='button'
							class='navigation__user-menu__persona-seg'
							data-active={!isFreelancerSide}
							disabled={!canBeClient}
							onClick={selectClient}
						>
							<Icon size={16}>
								<IconBriefcase />
							</Icon>
							Client
						</button>
					</div>

					{hasExtras && (
						<div class='navigation__user-menu__section'>
							<button
								type='button'
								class='navigation__user-menu__more'
								data-open={showMore.value}
								onClick={() => (showMore.value = !showMore.value)}
							>
								<span class='navigation__user-menu__item-text'>
									More workspaces ({extraBusinesses.length + extraTeams.length})
								</span>
								<Icon size={16} class='navigation__user-menu__more-chevron'>
									<IconChevronRight />
								</Icon>
							</button>

							{showMore.value && (
								<div class='navigation__user-menu__more-list'>
									{extraBusinesses.map((b) => (
										<button
											key={b.id}
											type='button'
											class='navigation__user-menu__item'
											onClick={() => onBusiness(b.id)}
										>
											<Icon size={18}>
												<IconBriefcase />
											</Icon>
											<span class='navigation__user-menu__item-text'>{b.name}</span>
										</button>
									))}
									{extraTeams.map((t) => (
										<button
											key={t.id}
											type='button'
											class='navigation__user-menu__item'
											data-active={profile?.activeTeamId === t.id}
											onClick={() => onTeam(t.id)}
										>
											<Icon size={18}>
												<IconUsersGroup />
											</Icon>
											<span class='navigation__user-menu__item-text'>{t.name}</span>
										</button>
									))}
								</div>
							)}
						</div>
					)}
					{/* #endregion */}

					{/* #region Profile completeness tracker */}
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
								tone='teal'
								showValue={false}
								thickness={5}
								milestone={profile.profileSetup.milestone}
							/>
							<span class='navigation__user-menu__setup-hint'>
								{profile.profileSetup.total - profile.profileSetup.completed}{' '}
								steps to partner status →
							</span>
						</a>
					)}
					{/* #endregion */}

					{/* #region Action matrix */}
					<div class='navigation__user-menu__section'>
						{profile?.username && (
							<a class='navigation__user-menu__item' href={`/${profile.username}`}>
								<Icon size={18}>
									<IconUserCircle />
								</Icon>
								<span class='navigation__user-menu__item-text'>Public profile</span>
							</a>
						)}
						<a class='navigation__user-menu__item' href='/dashboard/settings'>
							<Icon size={18}>
								<IconSettings />
							</Icon>
							<span class='navigation__user-menu__item-text'>Settings</span>
						</a>
						<a class='navigation__user-menu__item' href='/dashboard/notifications'>
							<Icon size={18}>
								<IconBell />
							</Icon>
							<span class='navigation__user-menu__item-text'>Notifications</span>
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
