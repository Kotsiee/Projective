import '../../styles/components/avatar.css';

// #region Types
export interface AvatarProps {
	/** Display name — used for the initials fallback and accessible label. */
	name: string;
	/** Optional image URL. Falls back to initials when absent or on load error. */
	src?: string;
	/** Diameter in pixels. @default 36 */
	size?: number;
	className?: string;
	title?: string;
}
// #endregion

// #region Helpers
/** Derives up to two uppercase initials from a display name. */
function toInitials(name: string): string {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return '?';
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Stable hue (0–359) derived from the name so a user always gets one colour. */
function hueFromName(name: string): number {
	let hash = 0;
	for (let i = 0; i < name.length; i++) {
		hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
	}
	return hash % 360;
}
// #endregion

/**
 * @function Avatar
 * @description A circular user avatar rendering an image when available and a
 * deterministically-coloured initials chip otherwise.
 */
export function Avatar({ name, src, size = 36, className, title }: AvatarProps) {
	const hue = hueFromName(name || '?');

	const style = {
		width: `${size}px`,
		height: `${size}px`,
		fontSize: `${Math.round(size * 0.4)}px`,
		'--avatar-hue': String(hue),
	} as Record<string, string>;

	return (
		<div
			className={['avatar', className].filter(Boolean).join(' ')}
			style={style}
			title={title ?? name}
			aria-label={name}
		>
			{src
				? (
					<img
						className='avatar__img'
						src={src}
						alt={name}
						onError={(e) => {
							(e.currentTarget as HTMLImageElement).style.display = 'none';
						}}
					/>
				)
				: <span className='avatar__initials'>{toInitials(name)}</span>}
		</div>
	);
}
