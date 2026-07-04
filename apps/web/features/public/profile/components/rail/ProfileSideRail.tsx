/**
 * @file ProfileSideRail.tsx
 * @description The side-nav action core (middle-nav side content). Houses the
 * navigation controls and utility actions: Back to Explore, page navigation
 * (Profile / Availability / Services / Settings), the primary Availability
 * action, and — for public viewers — the engagement actions (Message, Follow,
 * Connect, Share, Save). For the owner it swaps engagement for the Edit Profile
 * toggle. The Save/Discard drawer is rendered separately in the footer slot.
 */

import '../../styles/components/rail.css';

import { Avatar, toast } from '@projective/ui';
import {
	IconArrowLeft,
	IconBookmark,
	IconBookmarkFilled,
	IconBriefcase,
	IconCalendarEvent,
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
	{ icon, label, href, active, onClick, primary }: {
		icon: preact.ComponentChildren;
		label: string;
		href?: string;
		active?: boolean;
		primary?: boolean;
		onClick?: () => void;
	},
) {
	const cls = ['profile-rail__link', primary && 'profile-rail__link--primary']
		.filter(Boolean).join(' ');
	if (href) {
		return (
			<a class={cls} href={href} data-active={active ? 'true' : 'false'}>
				<span class='profile-rail__icon'>{icon}</span>
				<span class='profile-rail__label'>{label}</span>
			</a>
		);
	}
	return (
		<button type='button' class={cls} data-active={active ? 'true' : 'false'} onClick={onClick}>
			<span class='profile-rail__icon'>{icon}</span>
			<span class='profile-rail__label'>{label}</span>
		</button>
	);
}

export default function ProfileSideRail({ activePage = 'profile' }: { activePage?: RailPage }) {
	const {
		profile,
		viewer,
		isOwn,
		isEditing,
		setTab,
		startEditing,
		cancelEditing,
		toggleFollow,
		toggleSaved,
		toggleConnect,
	} = useProfileContext();

	const p = profile.value;
	const v = viewer.value;
	const own = isOwn.value;
	const editing = isEditing.value && own;
	const base = `/${p.handle}`;

	const goServices = () => {
		if (editing) cancelEditing();
		setTab('services');
	};

	return (
		<div class='profile-rail'>
			<a class='profile-rail__back' href='/explore'>
				<IconArrowLeft size={18} /> Back to Explore
			</a>

			<div class='profile-rail__id'>
				<Avatar name={p.displayName} src={p.avatarUrl} size={32} />
				<div class='profile-rail__id-text'>
					<span class='profile-rail__id-name'>{p.displayName}</span>
					<span class='profile-rail__id-handle'>@{p.handle}</span>
				</div>
			</div>

			{/* Navigation */}
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
					primary
				/>
				<RailLink icon={<IconBriefcase size={18} />} label='Services' onClick={goServices} />
				{own && <RailLink icon={<IconSettings size={18} />} label='Settings' href='/settings' />}
			</div>

			{/* Actions */}
			{own
				? (
					<div class='profile-rail__group'>
						<span class='profile-rail__group-title'>Manage</span>
						<button
							type='button'
							class='profile-rail__edit'
							data-active={editing ? 'true' : 'false'}
							onClick={() => (editing ? cancelEditing() : startEditing())}
						>
							<IconPencil size={16} />
							{editing ? 'Editing… exit' : 'Edit profile'}
						</button>
					</div>
				)
				: (
					<div class='profile-rail__group'>
						<span class='profile-rail__group-title'>Actions</span>
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
					</div>
				)}
		</div>
	);
}
