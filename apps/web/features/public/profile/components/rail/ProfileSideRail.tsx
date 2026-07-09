/**
 * @file ProfileSideRail.tsx
 * @description The side-nav action core (middle-nav side content). It mirrors the main website
 * sidebar behaviour: a flat, icon-first list that adapts to the expand/collapse animation, with a
 * portalled tooltip surfacing each label while collapsed. There is deliberately NO condensed
 * profile card at the top, and no "Workload Intensity", "Base Rate" or "Services" nav buttons.
 *
 * Three modes:
 *  - Public viewer → page nav + engagement actions (Message / Follow / Connect / Save / Share).
 *  - Owner, viewing → page nav + a highly-visible "Edit profile" button.
 *  - Owner, editing → the specialised editing-module list (Details, Services, Projects, Portfolio,
 *    Teams, Experience, Education, Members, Settings, Availability) that drives the edit canvas.
 *
 * Collapse state is persisted to localStorage (`profile_sidebar_collapsed`); it defaults to
 * collapsed when viewing and auto-expands on entering Editor Mode (see ProfileContext).
 */

import '../../styles/components/rail.css';

import type { JSX } from 'preact';
import { Button, toast, Tooltip } from '@projective/ui';
import {
	IconArrowLeft,
	IconBookmark,
	IconBookmarkFilled,
	IconBriefcase,
	IconCalendarEvent,
	IconChevronLeft,
	IconChevronRight,
	IconDeviceFloppy,
	IconFolder,
	IconId,
	IconLayoutGrid,
	IconMessage,
	IconPencil,
	IconPlus,
	IconSchool,
	IconSettings,
	IconShare,
	IconTimeline,
	IconUser,
	IconUserCheck,
	IconUserPlus,
	IconUsers,
	IconUsersGroup,
	IconX,
} from '@tabler/icons-preact';
import { useProfileContext } from '../../contexts/ProfileContext.tsx';
import type { EditSectionKey } from '../../contexts/ProfileContext.tsx';

export type RailPage = 'profile' | 'availability';

/** A single rail row. Mirrors the main sidebar: a portalled tooltip fills in the collapsed label. */
function RailLink(
	{ icon, label, href, active, collapsed, onClick }: {
		icon: JSX.Element;
		label: string;
		href?: string;
		active?: boolean;
		collapsed: boolean;
		onClick?: () => void;
	},
) {
	return (
		<Tooltip label={label} position='right' disabled={!collapsed} className='profile-rail__tip'>
			<Button
				href={href}
				onClick={onClick}
				ghost
				variant='secondary'
				startIcon={icon}
				fullWidth
				className='profile-rail__navbtn'
				aria-label={label}
				aria-current={active ? 'page' : undefined}
				data-selected={active ? 'true' : 'false'}
			>
				{label}
			</Button>
		</Tooltip>
	);
}

/** The editing modules mounted into the rail while in Editor Mode. */
const EDIT_MODULES: { key: EditSectionKey; label: string; icon: JSX.Element }[] = [
	{ key: 'details', label: 'Details', icon: <IconId size={18} /> },
	{ key: 'services', label: 'Services', icon: <IconBriefcase size={18} /> },
	{ key: 'projects', label: 'Projects', icon: <IconFolder size={18} /> },
	{ key: 'portfolio', label: 'Portfolio', icon: <IconLayoutGrid size={18} /> },
	{ key: 'teams', label: 'Teams', icon: <IconUsersGroup size={18} /> },
	{ key: 'experience', label: 'Experience', icon: <IconTimeline size={18} /> },
	{ key: 'education', label: 'Education', icon: <IconSchool size={18} /> },
	{ key: 'members', label: 'Members', icon: <IconUsers size={18} /> },
	{ key: 'settings', label: 'Settings', icon: <IconSettings size={18} /> },
	{ key: 'availability', label: 'Availability', icon: <IconCalendarEvent size={18} /> },
];

export default function ProfileSideRail({ activePage = 'profile' }: { activePage?: RailPage }) {
	const {
		profile,
		viewer,
		isOwn,
		isEditing,
		editSection,
		railCollapsed,
		startEditing,
		cancelEditing,
		saveEditing,
		setEditSection,
		toggleFollow,
		toggleSaved,
		toggleConnect,
		toggleRail,
	} = useProfileContext();

	const p = profile.value;
	const v = viewer.value;
	const own = isOwn.value;
	const editing = isEditing.value && own;
	const collapsed = railCollapsed.value;
	const base = `/${p.handle}`;

	return (
		<div class='profile-rail' data-collapsed={collapsed ? 'true' : 'false'}>
			<RailLink
				icon={<IconArrowLeft size={18} />}
				label='Back to Explore'
				href='/explore'
				collapsed={collapsed}
			/>

			{editing
				? (
					/* ---- Editor Mode: specialised editing-module navigation ---- */
					<>
						<div class='profile-rail__group'>
							{EDIT_MODULES.map((mod) => (
								<RailLink
									key={mod.key}
									icon={mod.icon}
									label={mod.label}
									active={editSection.value === mod.key}
									collapsed={collapsed}
									onClick={() => setEditSection(mod.key)}
								/>
							))}
						</div>

						<div class='profile-rail__group'>
							<Button
								variant='primary'
								startIcon={<IconDeviceFloppy size={16} />}
								fullWidth
								className='profile-rail__navbtn'
								onClick={() => {
									saveEditing();
									toast.success('Profile changes saved');
								}}
							>
								Done editing
							</Button>
							<RailLink
								icon={<IconX size={18} />}
								label='Discard & exit'
								collapsed={collapsed}
								onClick={cancelEditing}
							/>
						</div>
					</>
				)
				: (
					/* ---- Viewing: page navigation + owner/public actions ---- */
					<>
						<div class='profile-rail__group'>
							<RailLink
								icon={<IconUser size={18} />}
								label='Profile'
								href={base}
								active={activePage === 'profile'}
								collapsed={collapsed}
							/>
							<RailLink
								icon={<IconCalendarEvent size={18} />}
								label='Availability'
								href={`${base}/availability`}
								active={activePage === 'availability'}
								collapsed={collapsed}
							/>
							{own && (
								<RailLink
									icon={<IconSettings size={18} />}
									label='Settings'
									href='/settings'
									collapsed={collapsed}
								/>
							)}
						</div>

						<div class='profile-rail__group'>
							{own
								? (
									<Button
										variant='primary'
										startIcon={<IconPencil size={16} />}
										fullWidth
										className='profile-rail__navbtn profile-rail__edit-cta'
										onClick={startEditing}
									>
										Edit profile
									</Button>
								)
								: (
									<>
										<RailLink
											icon={<IconMessage size={18} />}
											label='Message'
											collapsed={collapsed}
											onClick={() => toast.success('Message thread opened')}
										/>
										<RailLink
											icon={v.isFollowing
												? <IconUserCheck size={18} />
												: <IconUserPlus size={18} />}
											label={v.isFollowing ? 'Following' : 'Follow'}
											active={v.isFollowing}
											collapsed={collapsed}
											onClick={toggleFollow}
										/>
										{p.kind === 'person' && (
											<RailLink
												icon={<IconPlus size={18} />}
												label={v.isConnected ? 'Connected' : 'Connect'}
												active={v.isConnected}
												collapsed={collapsed}
												onClick={toggleConnect}
											/>
										)}
										<RailLink
											icon={v.isSaved
												? <IconBookmarkFilled size={18} />
												: <IconBookmark size={18} />}
											label={v.isSaved ? 'Saved' : 'Save'}
											active={v.isSaved}
											collapsed={collapsed}
											onClick={toggleSaved}
										/>
										<RailLink
											icon={<IconShare size={18} />}
											label='Share'
											collapsed={collapsed}
											onClick={() => toast.success('Profile link copied')}
										/>
									</>
								)}
						</div>
					</>
				)}

			{/* Collapse toggle — pinned to the very bottom, mirrors the main sidebar. */}
			<Button
				ghost
				variant='secondary'
				startIcon={collapsed ? <IconChevronRight size={18} /> : <IconChevronLeft size={18} />}
				fullWidth
				className='profile-rail__navbtn profile-rail__collapse'
				onClick={toggleRail}
				aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
			>
				Collapse
			</Button>
		</div>
	);
}
