// #region Imports
import { Button, IconButton } from '@projective/ui';
import {
	IconBookmark,
	IconBriefcase,
	IconCalendarEvent,
	IconMessageCircle,
	IconPlugConnected,
	IconShare,
	IconUserMinus,
	IconUserPlus,
} from '@tabler/icons-preact';
// #endregion

export interface ProfileActionProps {
	onClick?: (e: MouseEvent) => void;
	loading?: boolean;
	disabled?: boolean;
	className?: string;
	isMain?: boolean;
	isSplit?: boolean;
}

// #region Helper
/**
 * Internal wrapper to enforce the Main vs Split visual logic.
 * Main = Primary Button. Split = Secondary Icon Button.
 */
function BaseAction({
	isMain,
	isSplit,
	icon,
	label,
	defaultOutlined = false,
	...rest
}: ProfileActionProps & { icon: preact.JSX.Element; label: string; defaultOutlined?: boolean }) {
	const variant = isMain ? 'primary' : 'secondary';

	if (isSplit) {
		return (
			<IconButton
				aria-label={label}
				variant='secondary'
				ghost={false}
				outlined={defaultOutlined}
				{...rest}
			>
				{icon}
			</IconButton>
		);
	}

	return (
		<Button
			variant={variant}
			startIcon={icon}
			outlined={!isMain && defaultOutlined}
			{...rest}
		>
			{label}
		</Button>
	);
}
// #endregion

// #region Context-Aware Actions
export function ProfileActionFollow(props: ProfileActionProps) {
	return <BaseAction label='Follow' icon={<IconUserPlus size={18} />} {...props} />;
}

export function ProfileActionUnfollow(props: ProfileActionProps) {
	return (
		<BaseAction label='Unfollow' icon={<IconUserMinus size={18} />} defaultOutlined {...props} />
	);
}

export function ProfileActionMessage(props: ProfileActionProps) {
	return <BaseAction label='Message' icon={<IconMessageCircle size={18} />} {...props} />;
}

export function ProfileActionConnect(props: ProfileActionProps) {
	return (
		<BaseAction label='Connect' icon={<IconPlugConnected size={18} />} defaultOutlined {...props} />
	);
}

export function ProfileActionInvite(props: ProfileActionProps) {
	return <BaseAction label='Invite to Project' icon={<IconBriefcase size={18} />} {...props} />;
}

export function ProfileActionViewSchedule(props: ProfileActionProps) {
	return <BaseAction label='View Schedule' icon={<IconCalendarEvent size={18} />} {...props} />;
}
// #endregion

// #region Static Icon Actions
export function ProfileActionShare(props: ProfileActionProps) {
	return (
		<IconButton aria-label='Share Profile' variant='secondary' ghost {...props}>
			<IconShare size={20} />
		</IconButton>
	);
}

export function ProfileActionSave(props: ProfileActionProps) {
	return (
		<IconButton aria-label='Save Profile' variant='secondary' ghost {...props}>
			<IconBookmark size={20} />
		</IconButton>
	);
}
// #endregion
