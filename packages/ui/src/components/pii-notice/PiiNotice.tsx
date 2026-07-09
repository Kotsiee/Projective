import '../../styles/components/pii-notice.css';
import { IconShieldLock } from '@tabler/icons-preact';
import type { PiiNoticeProps } from '../../types/components/pii-notice.ts';

/** Friendly labels for the raw masking-category keys the comms engine emits. */
const CATEGORY_LABELS: Record<string, string> = {
	email: 'email',
	phone: 'phone number',
	payment_link: 'payment link',
	handle: 'handle',
};

/**
 * @function PiiNotice
 * @description Inline warning banner shown beneath a message whose contact details were masked
 * during the protected phase (E7). Amber-toned via a single `--pii-accent`, with tiny chips naming
 * the masked categories and a soft entrance animation (disabled under reduced motion).
 */
export function PiiNotice(props: PiiNoticeProps) {
	const { categories = [], compact = false, className } = props;

	const classes = [
		'pii-notice',
		compact && 'pii-notice--compact',
		className,
	].filter(Boolean).join(' ');

	return (
		<div class={classes} role='note'>
			<span class='pii-notice__icon' aria-hidden='true'>
				<IconShieldLock size={compact ? 14 : 16} stroke={2} />
			</span>
			<span class='pii-notice__text'>Contact details hidden during the protected phase</span>
			{categories.length > 0 && (
				<span class='pii-notice__chips'>
					{categories.map((category) => (
						<span key={category} class='pii-notice__chip'>
							{CATEGORY_LABELS[category] ?? category}
						</span>
					))}
				</span>
			)}
		</div>
	);
}
