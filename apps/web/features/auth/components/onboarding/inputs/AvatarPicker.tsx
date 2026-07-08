/**
 * @file AvatarPicker.tsx
 * @description Circular profile-picture picker for onboarding step 2. Hovering the
 * circle reveals an overlay to add/change the image. A chosen image previews
 * immediately; when the user is authenticated (the OAuth onboarding flow) it is
 * persisted through the full files pipeline and its id is stored for provisioning.
 */

import '../../../styles/components/onboarding/inputs/avatar-picker.css';
import { useRef } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { IconCamera } from '@tabler/icons-preact';
import { toast } from '@projective/ui';
import { useOnboardingContext } from '../../../contexts/OnboardingContext.tsx';
import { AvatarUploadService } from '../../../services/AvatarUploadService.ts';

export function AvatarPicker() {
	const { firstName, lastName, profilePicture, avatarFileId, oauthOnboarding } =
		useOnboardingContext();
	const inputRef = useRef<HTMLInputElement>(null);
	const isUploading = useSignal(false);

	const initials = `${firstName.value?.[0] ?? ''}${lastName.value?.[0] ?? ''}`.toUpperCase() || '?';

	const openPicker = () => inputRef.current?.click();

	const handleFile = async (e: Event) => {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		if (!file.type.startsWith('image/')) {
			toast.error('Please choose an image file.');
			input.value = '';
			return;
		}
		if (file.size > 5 * 1024 * 1024) {
			toast.error('Image must be under 5MB.');
			input.value = '';
			return;
		}

		// Immediate local preview.
		profilePicture.value = URL.createObjectURL(file);

		// Persistence needs an authenticated session — only the OAuth flow has one
		// at this step. Email/password accounts don't exist yet, so we preview only.
		if (!oauthOnboarding.value) {
			input.value = '';
			return;
		}

		isUploading.value = true;
		try {
			const { fileId, publicUrl } = await AvatarUploadService.upload(file);
			avatarFileId.value = fileId;
			profilePicture.value = publicUrl;
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Could not upload the image.');
		} finally {
			isUploading.value = false;
			input.value = '';
		}
	};

	return (
		<div class='avatar-picker'>
			<button
				type='button'
				class='avatar-picker__circle'
				onClick={openPicker}
				aria-label='Add a profile picture'
				aria-busy={isUploading.value}
			>
				{profilePicture.value
					? <img src={profilePicture.value} alt='Profile preview' class='avatar-picker__img' />
					: <span class='avatar-picker__initials'>{initials}</span>}

				<span class='avatar-picker__overlay'>
					<IconCamera size={22} stroke={1.5} />
					<span class='avatar-picker__overlay-text'>
						{profilePicture.value ? 'Change' : 'Add photo'}
					</span>
				</span>

				{isUploading.value && <span class='avatar-picker__spinner' aria-hidden='true' />}
			</button>

			<input
				ref={inputRef}
				type='file'
				accept='image/*'
				class='avatar-picker__input'
				onChange={handleFile}
			/>
		</div>
	);
}
