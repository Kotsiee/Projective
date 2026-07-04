/**
 * @file ProfileEditFooter.tsx
 * @description The action drawer pinned to the bottom of the editor side nav —
 * an unsaved-changes hint on the left, Discard / Save actions on the right. Uses
 * the base `.profile-edit-footer*` classes from styles/islands/profile.css.
 */

import '../../styles/components/edit.css';
import { Button, toast } from '@projective/ui';
import { IconAlertCircle, IconDeviceFloppy } from '@tabler/icons-preact';
import { useProfileContext } from '../../contexts/ProfileContext.tsx';

export default function ProfileEditFooter() {
	const { cancelEditing, saveEditing } = useProfileContext();

	const handleSave = () => {
		saveEditing();
		toast.success('Profile saved');
	};

	return (
		<div class='profile-edit-footer'>
			<span class='profile-edit-footer__hint'>
				<IconAlertCircle size={16} /> Unsaved changes
			</span>
			<div class='profile-edit-footer__actions'>
				<Button variant='danger' ghost onClick={cancelEditing}>
					Discard
				</Button>
				<Button
					variant='primary'
					startIcon={<IconDeviceFloppy size={16} />}
					onClick={handleSave}
				>
					Save changes
				</Button>
			</div>
		</div>
	);
}
