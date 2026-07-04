import './styles/local-time-chip.css';
import { useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { IconClock } from '@tabler/icons-preact';

export interface LocalTimeChipProps {
	/** IANA timezone, e.g. 'America/New_York'. Falls back to local time if invalid/empty. */
	timezone: string;
	/** Optional prefix label, e.g. "Local time". */
	label?: string;
	/** Include seconds in the time (also ticks every second). Default false. */
	showSeconds?: boolean;
	/** Use 24-hour clock. Default false → 12h with am/pm. */
	use24h?: boolean;
	/** Append the short timezone abbreviation. Default true. */
	showZone?: boolean;
	/** Extra class names for the wrapping span. */
	className?: string;
}

/**
 * Formats the current instant as wall-clock time in the target timezone.
 *
 * @remarks
 * Uses `Intl.DateTimeFormat` with an explicit `timeZone` so the hour/minute
 * digits reflect the TARGET timezone (not the local machine clock), and the
 * `timeZoneName: 'short'` part yields the zone abbreviation. Any error (e.g. an
 * invalid IANA id) throws to the caller, which falls back to local time.
 */
function formatNow(
	timezone: string,
	showSeconds: boolean,
	use24h: boolean,
	showZone: boolean,
): string {
	const opts: Intl.DateTimeFormatOptions = {
		hour: use24h ? '2-digit' : 'numeric',
		minute: '2-digit',
		hour12: !use24h,
	};
	if (showSeconds) opts.second = '2-digit';
	if (showZone) opts.timeZoneName = 'short';
	if (timezone) opts.timeZone = timezone;
	return new Intl.DateTimeFormat('en-US', opts).format(new Date());
}

/**
 * Live, self-updating chip showing the current wall-clock time in a target timezone.
 *
 * @remarks
 * Ticks every second when {@link LocalTimeChipProps.showSeconds} is set, otherwise every 30s.
 * Any formatting/timezone error falls back to plain local time so it can never crash the tree.
 */
export function LocalTimeChip(props: LocalTimeChipProps) {
	const {
		timezone,
		label,
		showSeconds = false,
		use24h = false,
		showZone = true,
		className,
	} = props;

	const time = useSignal('');

	useEffect(() => {
		const tick = () => {
			try {
				time.value = formatNow(timezone, showSeconds, use24h, showZone);
			} catch {
				// Invalid timezone → fall back to local time without the zone abbreviation.
				time.value = formatNow('', showSeconds, use24h, false);
			}
		};

		tick();
		const interval = setInterval(tick, showSeconds ? 1000 : 30000);
		return () => clearInterval(interval);
	}, [timezone, showSeconds, use24h, showZone]);

	return (
		<span class={`local-time-chip${className ? ` ${className}` : ''}`}>
			<IconClock class='local-time-chip__icon' size={14} stroke={1.75} />
			{label && <span class='local-time-chip__label'>{label}</span>}
			<span class='local-time-chip__time'>{time.value}</span>
		</span>
	);
}
