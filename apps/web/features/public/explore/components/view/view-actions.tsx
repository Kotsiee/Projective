// #region Imports
import { useSignal } from '@preact/signals';
import { Button, IconButton } from '@projective/ui';
import {
	IconBolt,
	IconBookmark,
	IconMessageCircle,
	IconShare,
	IconUserMinus,
	IconUserPlus,
} from '@tabler/icons-preact';
import { ViewOverlayJoin } from './overlays/view-join.tsx';
// #endregion

export interface ViewActionProps {
	onClick?: (e: MouseEvent) => void;
	loading?: boolean;
	disabled?: boolean;
	className?: string;
}

export function ViewActionFollow(props: ViewActionProps) {
	return (
		<Button
			variant='primary'
			startIcon={<IconUserPlus size={18} />}
			{...props}
		>
			Follow
		</Button>
	);
}

export function ViewActionUnfollow(props: ViewActionProps) {
	return (
		<Button
			variant='secondary'
			outlined
			startIcon={<IconUserMinus size={18} />}
			{...props}
		>
			Unfollow
		</Button>
	);
}

export function ViewActionMessage(props: ViewActionProps) {
	return (
		<Button
			variant='secondary'
			startIcon={<IconMessageCircle size={18} />}
			{...props}
		>
			Message
		</Button>
	);
}

export function ViewActionShare(props: ViewActionProps) {
	return (
		<IconButton
			aria-label='Share'
			variant='secondary'
			ghost
			{...props}
		>
			<IconShare size={18} />
		</IconButton>
	);
}

export function ViewActionSave(props: ViewActionProps) {
	return (
		<Button
			aria-label='Save'
			variant='secondary'
			ghost
			{...props}
		>
			<IconBookmark size={18} />
		</Button>
	);
}

export function ViewActionJoin(props: ViewActionProps) {
	const isJoinOverlayOpen = useSignal(false);

	return (
		<>
			<Button
				variant='primary'
				startIcon={<IconUserPlus size={18} />}
				{...props}
				onClick={(e) => {
					isJoinOverlayOpen.value = true;
					props.onClick?.(e);
				}}
			>
				Join
			</Button>

			<ViewOverlayJoin
				isOpen={isJoinOverlayOpen.value}
				onClose={() => isJoinOverlayOpen.value = false}
			/>
		</>
	);
}

// Custom CTA for Services/Products
export function ViewActionPurchase(props: ViewActionProps) {
	return (
		<Button
			variant='primary'
			startIcon={<IconBolt size={18} />}
			{...props}
		>
			Book Service
		</Button>
	);
}
