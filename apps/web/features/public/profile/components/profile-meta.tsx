/**
 * @file profile-meta.tsx
 * @description Sidebar metadata component for the Profile view.
 * Displays logistical information, communication SLAs, and primary interaction triggers.
 */

// #region Imports
import { Skeleton } from '@projective/ui';
import {
	IconCalendarEvent,
	IconCircleFilled,
	IconLanguage,
	IconMapPin,
} from '@tabler/icons-preact';
import { useProfileContext } from '../contexts/ProfileContext.tsx';
import {
	ProfileActionConnect,
	ProfileActionFollow,
	ProfileActionInvite,
	ProfileActionMessage,
	ProfileActionUnfollow,
	ProfileActionViewSchedule,
} from './profile-actions.tsx';
import { DateTime } from '@projective/types';
import '../styles/components/profile-meta.css';
// #endregion

/**
 * @interface ProfileMetaProps
 * @property {boolean} [hideActions] - Triggers visually hiding the action buttons when scrolled.
 */
export interface ProfileMetaProps {
	hideActions?: boolean;
}

export default function ProfileMeta({ hideActions }: ProfileMetaProps) {
	const { data, isLoading } = useProfileContext();

	// #region 1. Loading State
	if (isLoading.value) {
		return (
			<div className='profile-meta profile-meta--loading'>
				{/* ... [Skeleton layout remains unchanged] ... */}
				<div className='profile-meta__status-time'>
					<div className='profile-meta__status'>
						<Skeleton variant='avatar' width='12px' height='12px' style={{ borderRadius: '50%' }} />
						<Skeleton variant='text' width='60px' height='1rem' />
					</div>
					<div className='profile-meta__time'>
						<Skeleton variant='text' width='80px' height='0.75rem' />
						<Skeleton variant='text' width='120px' height='2rem' style={{ margin: '0.25rem 0' }} />
						<Skeleton variant='text' width='160px' height='1rem' />
					</div>
				</div>
				<div className='profile-meta__info'>
					<Skeleton variant='text' width='140px' height='1rem' style={{ marginBottom: '0.5rem' }} />
					<Skeleton variant='text' width='180px' height='1rem' />
				</div>
				{!hideActions && (
					<div className='profile-meta__actions'>
						<div className='profile-meta__response-time'>
							<Skeleton variant='text' width='120px' height='1rem' />
						</div>
						<div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
							<div className='profile-meta__actions__top'>
								<Skeleton variant='button' width='100%' height='36px' />
								<Skeleton variant='button' width='100%' height='36px' />
							</div>
							<div className='profile-meta__actions__main'>
								<Skeleton variant='button' width='100%' height='40px' />
							</div>
						</div>
					</div>
				)}
			</div>
		);
	}
	// #endregion

	// #region 2. Empty Guard
	if (!data.value) return null;
	// #endregion

	// #region 3. Data Extraction & Formatting
	const { type, viewerConnectionStatus, logistics } = data.value;
	const isConnected = viewerConnectionStatus === 'connected';

	const isOnline = logistics?.isOnline || false;
	const location = logistics?.location || 'Not specified';
	const languages = logistics?.languages?.length ? logistics.languages.join(', ') : 'Not specified';
	const timezone = logistics?.timezone || 'UTC';
	const availabilitySummary = logistics?.availabilitySummary || 'Schedule not set';
	const averageResponseTime = logistics?.averageResponseTime || undefined;

	// Determine if the profile has an actionable schedule
	const hasSchedule = !!logistics?.hasSchedule || availabilitySummary !== undefined;

	/**
	 * Formats the raw timezone string into the viewer's local equivalent.
	 * @param {string} tz - The IANA timezone string.
	 * @returns {string} The formatted local time or 'Unknown'.
	 */
	const getLocalTime = (tz: string) => {
		try {
			return DateTime.toNewTimezone(DateTime.now(), tz).toFormat('h:mm t');
		} catch {
			return 'Unknown';
		}
	};

	const handleViewSchedule = () => {
		console.log('[ProfileMeta] Open Schedule Modal');
	};
	// #endregion

	// #region 4. Action Distribution
	const renderActions = () => {
		const topActions: preact.JSX.Element[] = [];
		let mainAction: preact.JSX.Element | null = null;

		// Reusable split actions
		const followSplit = isConnected
			? <ProfileActionUnfollow key='unfollow' isSplit />
			: <ProfileActionFollow key='follow' isSplit />;
		const messageSplit = <ProfileActionMessage key='message' isSplit />;
		const connectSplit = <ProfileActionConnect key='connect' isSplit />;
		const scheduleSplit = (
			<ProfileActionViewSchedule key='schedule' isSplit onClick={handleViewSchedule} />
		);

		// Reusable main actions
		const followMain = isConnected
			? <ProfileActionUnfollow key='unfollow' isMain className='button--full-width' />
			: <ProfileActionFollow key='follow' isMain className='button--full-width' />;
		const inviteMain = <ProfileActionInvite key='invite' isMain className='button--full-width' />;
		const connectMain = (
			<ProfileActionConnect
				key='connect'
				isMain
				className='button--full-width'
			/>
		);

		// Persona routing
		switch (type) {
			case 'freelancer':
				topActions.push(followSplit, messageSplit, connectSplit);
				if (hasSchedule) topActions.push(scheduleSplit);
				mainAction = inviteMain;
				break;
			case 'user':
				topActions.push(followSplit, messageSplit);
				mainAction = connectMain;
				break;
			case 'team':
				topActions.push(followSplit, messageSplit);
				if (hasSchedule) topActions.push(scheduleSplit);
				mainAction = inviteMain;
				break;
			case 'business':
				topActions.push(messageSplit);
				mainAction = followMain;
				break;
		}

		return (
			<>
				{topActions.length > 0 && (
					<div className='profile-meta__actions__top'>
						{topActions}
					</div>
				)}
				{mainAction && (
					<div className='profile-meta__actions__main'>
						{mainAction}
					</div>
				)}
			</>
		);
	};
	// #endregion

	return (
		<div className='profile-meta'>
			{/* Status & Time Module */}
			<div className='profile-meta__status-time'>
				<div className='profile-meta__status'>
					<IconCircleFilled
						size={12}
						color={isOnline ? 'var(--success)' : 'var(--text-disabled)'}
						style={{ marginRight: '6px' }}
					/>
					<span style={{ color: isOnline ? 'var(--success)' : 'inherit' }}>
						{isOnline ? 'Online' : 'Offline'}
					</span>
				</div>
				<div className='profile-meta__time'>
					<p className='profile-meta__time__timezone'>{timezone}</p>
					<p className='profile-meta__time__local'>{getLocalTime(timezone)}</p>
					<p className='profile-meta__time__availability'>
						{availabilitySummary}
						<IconCalendarEvent size={14} className='profile-meta__time__icon' />
					</p>
				</div>
			</div>

			{/* Info Module */}
			<div className='profile-meta__info'>
				<div className='profile-meta__info-row'>
					<IconMapPin size={16} className='profile-meta__info-icon' />
					<span>{location}</span>
				</div>
				<div className='profile-meta__info-row'>
					<IconLanguage size={16} className='profile-meta__info-icon' />
					<span>{languages}</span>
				</div>
			</div>

			{/* Actions & SLA Module */}
			<div
				className={`profile-meta__actions ${hideActions ? 'profile-meta__actions--hidden' : ''}`}
			>
				{averageResponseTime && (
					<div className='profile-meta__response-time'>
						<span>Replies in {averageResponseTime}</span>
					</div>
				)}
				<div className='profile-meta__actions-wrapper'>
					{renderActions()}
				</div>
			</div>
		</div>
	);
}
