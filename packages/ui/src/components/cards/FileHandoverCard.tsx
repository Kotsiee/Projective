import '../../styles/components/file-handover-card.css';
import { IconCalendarCheck, IconDownload, IconFiles, IconLockOpen2 } from '@tabler/icons-preact';
import type { FileHandoverCardProps } from '../../types/components/file-handover-card.ts';

/** Friendly labels for the well-known IP-mode keys. */
const IP_MODE_LABELS: Record<string, string> = {
	exclusive_transfer: 'Exclusive IP Transfer',
	license: 'Licensed',
	non_exclusive: 'Non-exclusive',
};

/** Map a raw IP-mode key to its friendly label, humanizing unknown keys. */
function ipModeLabel(mode: string): string {
	return IP_MODE_LABELS[mode] ??
		mode
			.split('_')
			.map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
			.join(' ');
}

/** Locale-format an ISO timestamp, returning undefined for missing/invalid input. */
function unlockedDateLabel(iso?: string): string | undefined {
	if (!iso) return undefined;
	const date = new Date(iso);
	return Number.isNaN(date.getTime()) ? undefined : date.toLocaleDateString();
}

/**
 * @function FileHandoverCard
 * @description Cinematic confirmation card announcing the "Projective Unlock" (E7): the protected
 * phase has ended and IP assets are released to the client. A diagonal sheen sweeps the surface,
 * the hero lock pops open, and content rows stagger in — all disabled under reduced motion.
 */
export function FileHandoverCard(props: FileHandoverCardProps) {
	const {
		projectTitle,
		ipMode,
		unlockedAt,
		fileCount,
		onDownloadAll,
		className,
	} = props;

	const classes = [
		'handover-card',
		className,
	].filter(Boolean).join(' ');

	const unlockedLabel = unlockedDateLabel(unlockedAt);

	return (
		<div class={classes}>
			<div class='handover-card__hero'>
				<span class='handover-card__hero-icon' aria-hidden='true'>
					<IconLockOpen2 size={26} stroke={1.8} />
				</span>
			</div>
			<div class='handover-card__row'>
				<h3 class='handover-card__headline'>Secure Transfer Complete</h3>
				<p class='handover-card__subtext'>
					IP assets released — the protected phase has ended.
				</p>
			</div>
			<div class='handover-card__row handover-card__meta'>
				{ipMode && <span class='handover-card__ip-badge'>{ipModeLabel(ipMode)}</span>}
				<span class='handover-card__project'>{projectTitle}</span>
			</div>
			{(fileCount !== undefined || unlockedLabel) && (
				<div class='handover-card__row handover-card__details'>
					{fileCount !== undefined && (
						<span class='handover-card__detail'>
							<IconFiles size={14} stroke={2} aria-hidden='true' />
							{fileCount} {fileCount === 1 ? 'file' : 'files'} ready to download
						</span>
					)}
					{unlockedLabel && (
						<span class='handover-card__detail'>
							<IconCalendarCheck size={14} stroke={2} aria-hidden='true' />
							Unlocked {unlockedLabel}
						</span>
					)}
				</div>
			)}
			{onDownloadAll && (
				<div class='handover-card__row handover-card__actions'>
					<button type='button' class='handover-card__download' onClick={onDownloadAll}>
						<IconDownload size={16} stroke={2} aria-hidden='true' />
						Download all assets
					</button>
				</div>
			)}
		</div>
	);
}
