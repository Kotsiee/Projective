/**
 * @file platformIcon.tsx
 * @description Maps a meeting platform to its brand icon + human label. Zoom /
 * Teams / Meet are the only supported digital locations for a session.
 */

import { IconBrandTeams, IconBrandZoom, IconVideo } from '@tabler/icons-preact';
import type { MeetingPlatform } from '../../contracts/Profile.ts';

export function platformLabel(platform: MeetingPlatform): string {
	switch (platform) {
		case 'zoom':
			return 'Zoom';
		case 'teams':
			return 'MS Teams';
		case 'meet':
			return 'Google Meet';
	}
}

export function PlatformIcon(
	{ platform, size = 14 }: { platform: MeetingPlatform; size?: number },
) {
	switch (platform) {
		case 'zoom':
			return <IconBrandZoom size={size} />;
		case 'teams':
			return <IconBrandTeams size={size} />;
		case 'meet':
			// Tabler has no Meet glyph — a neutral video icon reads correctly.
			return <IconVideo size={size} />;
	}
}
