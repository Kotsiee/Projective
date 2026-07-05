/**
 * @file ProfileSideRail.tsx
 * @description The side-nav action core (middle-nav side content). Minimalist,
 * heading-less list: Back to Explore, page navigation (Profile / Availability /
 * Services / Settings) and the utility actions — engagement (public) or the
 * Edit Profile toggle (owner). Collapses to an icon-only rail via a toggle
 * pinned to the very bottom; the state persists in localStorage.
 *
 * All controls are the design-system `Button` (polymorphic: renders an anchor
 * when `href` is set, a button otherwise). The active nav item is conveyed by
 * the `secondary` variant; everything else is the subtle `link` variant.
 */

import '../../styles/components/rail.css';

import type { JSX } from 'preact';
import { Avatar, Button, toast } from '@projective/ui';
import {
	IconArrowLeft,
	IconBookmark,
	IconBookmarkFilled,
	IconBriefcase,
	IconCalendarEvent,
	IconChevronLeft,
	IconChevronRight,
	IconMessage,
	IconPencil,
	IconPlus,
	IconSettings,
	IconShare,
	IconUser,
	IconUserCheck,
	IconUserPlus,
} from '@tabler/icons-preact';
import { useProfileContext } from '../../contexts/ProfileContext.tsx';

export type RailPage = 'profile' | 'availability';

function RailLink(
	{ icon, label, href, active, onClick }: {
		icon: JSX.Element;
		label: string;
		href?: string;
		active?: boolean;
		onClick?: () => void;
	},
) {
	return (
		<Button
			href={href}
			onClick={onClick}
			startIcon={icon}
			variant={active ? 'secondary' : 'link'}
			fullWidth
			className='profile-rail__navbtn'
		>
			{label}
		</Button>
	);
}

export default function ProfileSideRail({ activePage = 'profile' }: { activePage?: RailPage }) {
	const {
		profile,
		viewer,
		isOwn,
		isEditing,
		railCollapsed,
		setTab,
		startEditing,
		cancelEditing,
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

	const goServices = () => {
		if (editing) cancelEditing();
		setTab('services');
	};

	return (
		<div class='profile-rail' data-collapsed={collapsed ? 'true' : 'false'}>
			<RailLink
				icon={<IconArrowLeft size={18} />}
				label='Back to Explore'
				href='/explore'
			/>

			<div class='profile-rail__id'>
				<Avatar name={p.displayName} src={p.avatarUrl} size={collapsed ? 34 : 32} />
				<div class='profile-rail__id-text'>
					<span class='profile-rail__id-name'>{p.displayName}</span>
					<span class='profile-rail__id-handle'>@{p.handle}</span>
				</div>
			</div>

			{/* Navigation — strictly one active item */}
			<div class='profile-rail__group'>
				<RailLink
					icon={<IconUser size={18} />}
					label='Profile'
					href={base}
					active={activePage === 'profile' && !editing}
				/>
				<RailLink
					icon={<IconCalendarEvent size={18} />}
					label='Availability'
					href={`${base}/availability`}
					active={activePage === 'availability'}
				/>
				<RailLink icon={<IconBriefcase size={18} />} label='Services' onClick={goServices} />
				{own && <RailLink icon={<IconSettings size={18} />} label='Settings' href='/settings' />}
			</div>

			{/* Actions — no heading */}
			<div class='profile-rail__group'>
				{own
					? (
						<Button
							variant={editing ? 'secondary' : 'primary'}
							outlined={!editing}
							startIcon={<IconPencil size={16} />}
							fullWidth
							className='profile-rail__navbtn'
							onClick={() => (editing ? cancelEditing() : startEditing())}
						>
							{editing ? 'Editing… exit' : 'Edit profile'}
						</Button>
					)
					: (
						<>
							<RailLink
								icon={<IconMessage size={18} />}
								label='Message'
								onClick={() => toast.success('Message thread opened')}
							/>
							<RailLink
								icon={v.isFollowing ? <IconUserCheck size={18} /> : <IconUserPlus size={18} />}
								label={v.isFollowing ? 'Following' : 'Follow'}
								active={v.isFollowing}
								onClick={toggleFollow}
							/>
							{p.kind === 'person' && (
								<RailLink
									icon={<IconPlus size={18} />}
									label={v.isConnected ? 'Connected' : 'Connect'}
									active={v.isConnected}
									onClick={toggleConnect}
								/>
							)}
							<RailLink
								icon={v.isSaved ? <IconBookmarkFilled size={18} /> : <IconBookmark size={18} />}
								label={v.isSaved ? 'Saved' : 'Save'}
								active={v.isSaved}
								onClick={toggleSaved}
							/>
							<RailLink
								icon={<IconShare size={18} />}
								label='Share'
								onClick={() => toast.success('Profile link copied')}
							/>
						</>
					)}
			</div>

			{/* Collapse toggle — pinned to the very bottom */}
			<Button
				variant='link'
				startIcon={collapsed ? <IconChevronRight size={18} /> : <IconChevronLeft size={18} />}
				fullWidth
				className='profile-rail__navbtn profile-rail__collapse'
				onClick={toggleRail}
			>
				Collapse
			</Button>
		</div>
	);
}
