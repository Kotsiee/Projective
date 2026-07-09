import '../../styles/components/channel-tabs.css';
import { IconLock } from '@tabler/icons-preact';
import type { ChannelTabsProps } from '../../types/components/channel-tabs.ts';

/**
 * @function ChannelTabs
 * @description Locked-aware tab strip for stage-room channels (E7). The active tab gets a sliding
 * accent underline; locked channels render dimmed with a lock glyph, a `lockedHint` tooltip and no
 * click affordance. All colours are palette tokens, so the strip re-themes automatically.
 */
export function ChannelTabs(props: ChannelTabsProps) {
	const { tabs, activeId, onSelect, className } = props;

	const classes = [
		'channel-tabs',
		className,
	].filter(Boolean).join(' ');

	return (
		<div class={classes} role='tablist'>
			{tabs.map((tab) => {
				const active = tab.id === activeId;
				const tabClasses = [
					'channel-tabs__tab',
					active && 'channel-tabs__tab--active',
					tab.locked && 'channel-tabs__tab--locked',
				].filter(Boolean).join(' ');

				return (
					<button
						key={tab.id}
						type='button'
						role='tab'
						aria-selected={active}
						class={tabClasses}
						disabled={tab.locked}
						title={tab.locked ? tab.lockedHint : undefined}
						onClick={() => {
							if (!tab.locked) onSelect(tab.id);
						}}
					>
						{tab.locked
							? (
								<span class='channel-tabs__lock' aria-hidden='true'>
									<IconLock size={13} stroke={2} />
								</span>
							)
							: tab.icon && <span class='channel-tabs__icon' aria-hidden='true'>{tab.icon}</span>}
						<span class='channel-tabs__label'>{tab.label}</span>
					</button>
				);
			})}
		</div>
	);
}
