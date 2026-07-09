import '../../styles/components/entity-roster.css';
import { RippleSurface } from '../ripple/RippleSurface.tsx';

/** Derive up-to-two-letter initials from a display name. */
export function entityInitials(name: string): string {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return '?';
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export interface RosterEntity {
	id: string;
	name: string;
	/** Bare handle (no leading `@` — the roster adds it). */
	handle: string;
	/** Optional avatar/logo URL; falls back to initials when absent. */
	avatarUrl?: string | null;
	/** Subscription/plan tier — rendered as a metadata badge (e.g. Free, Pro, Enterprise). */
	tier?: string | null;
	/** Lifecycle status; `draft` renders a distinct "Draft" pill. */
	status?: 'draft' | 'active' | 'archived' | string | null;
	accent?: 'primary' | 'mint' | 'violet' | 'amber';
}

export interface EntityRosterProps {
	entities: RosterEntity[];
	/** id of the currently active entity (highlighted). */
	activeId?: string | null;
	onSelect?: (entity: RosterEntity) => void;
	emptyLabel?: string;
	className?: string;
}

function TierBadge({ tier }: { tier: string }) {
	const label = tier === 'free' ? 'Free' : tier.charAt(0).toUpperCase() + tier.slice(1);
	return (
		<span class={`roster-item__badge roster-item__badge--tier-${tier.toLowerCase()}`}>{label}</span>
	);
}

/**
 * @function EntityRoster
 * @description The 30% workspace roster: a premium vertical list of the user's
 * active entities. Each row shows an initial-monogram (or logo), the display name,
 * `@handle`, and tier / draft metadata badges — leaving room for future Enterprise
 * tiers. Rows ripple and highlight the active context.
 */
export function EntityRoster(props: EntityRosterProps) {
	const { entities, activeId, onSelect, emptyLabel = 'Nothing here yet.', className } = props;

	if (!entities.length) {
		return (
			<div class={['entity-roster', 'entity-roster--empty', className].filter(Boolean).join(' ')}>
				{emptyLabel}
			</div>
		);
	}

	return (
		<ul class={['entity-roster', className].filter(Boolean).join(' ')}>
			{entities.map((e) => {
				const active = activeId != null && e.id === activeId;
				const accent = e.accent ?? 'primary';
				return (
					<RippleSurface
						key={e.id}
						as='li'
						class={`roster-item roster-item--${accent} ${active ? 'roster-item--active' : ''}`}
						onClick={() => onSelect?.(e)}
						aria-current={active ? 'true' : undefined}
					>
						<span class='roster-item__avatar' aria-hidden='true'>
							{e.avatarUrl
								? <img src={e.avatarUrl} alt='' class='roster-item__avatar-img' />
								: <span class='roster-item__initials'>{entityInitials(e.name)}</span>}
						</span>
						<span class='roster-item__body'>
							<span class='roster-item__name'>{e.name}</span>
							<span class='roster-item__handle'>@{e.handle}</span>
						</span>
						<span class='roster-item__badges'>
							{e.status === 'draft' && (
								<span class='roster-item__badge roster-item__badge--draft'>Draft</span>
							)}
							{e.tier && <TierBadge tier={e.tier} />}
						</span>
					</RippleSurface>
				);
			})}
		</ul>
	);
}

export default EntityRoster;
