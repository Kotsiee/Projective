import '../../styles/components/cards/entity-card.css';
import {
	IconArrowRight,
	IconBriefcase,
	IconCheck,
	IconClock,
	IconEye,
	IconGitCommit,
	IconGitFork,
	IconLayersSubtract,
	IconMapPin,
	IconSparkles,
	IconStarFilled,
	IconUsersGroup,
} from '@tabler/icons-preact';
import type { VNode } from 'preact';
import type { EntityCardModel, EntityCardStatKey, EntityType } from '@projective/types';
import { Avatar } from '../media/index.ts';
import type { EntityCardProps } from '../../types/components/entity-card.ts';
import { CardActions } from './CardActions.tsx';

// #region Static maps & helpers

const TAXONOMY_LABEL: Record<string, string> = {
	solo: 'Solo',
	agency: 'Agency',
	team: 'Team',
	business: 'Business',
	studio: 'Studio',
};

const TYPE_LABEL: Record<EntityType, string> = {
	service: 'Service',
	product: 'Product',
	person: 'Freelancer',
	team: 'Team',
	business: 'Business',
	project: 'Project',
};

const STAT_ICON: Record<EntityCardStatKey, VNode> = {
	stars: <IconStarFilled size={14} />,
	forks: <IconGitFork size={14} />,
	contributions: <IconGitCommit size={14} />,
	members: <IconUsersGroup size={14} />,
	views: <IconEye size={14} />,
	clock: <IconClock size={14} />,
};

/** Pre-formatted `price_label` wins; otherwise derive a compact string from cents + unit. */
function formatPrice(e: EntityCardModel): string | null {
	if (e.price_label) return e.price_label;
	if (e.price_cents == null) return null;
	const n = e.price_cents / 100;
	const money = n >= 1000 ? `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `$${n}`;
	switch (e.price_unit) {
		case 'per_hour':
			return `${money}/hr`;
		case 'per_seat':
			return `${money}/seat`;
		case 'from':
			return `From ${money}`;
		default:
			return money;
	}
}

function budgetRange(e: EntityCardModel): string | null {
	if (!e.scope) return null;
	const lo = Math.round(e.scope.budget_min_cents / 100_000) / 10;
	const hi = Math.round(e.scope.budget_max_cents / 100_000) / 10;
	return `$${lo}k – $${hi}k`;
}

/** Deterministic pseudo-height so the product masonry feels organic without per-item ratios. */
function productRatio(id: string): number {
	const sum = [...id].reduce((a, c) => a + c.charCodeAt(0), 0);
	return [0.72, 1, 1.28, 0.86][sum % 4];
}

// #endregion

/**
 * @function EntityCard
 * @description The unified discovery/entity card — the single visual foundation behind every
 * `Service`, `Profile` (Freelancer / Team / Business), `Project`, and `Product` surface. Freelancers,
 * Teams, and Businesses share one foundation differentiated by a micro-bordered taxonomy flag.
 * Sponsored entries keep native styling with a soft accent indicator + hairline frame.
 *
 * Guardrail: face actions are strictly limited to Save · Share · kebab (see {@link CardActions});
 * every secondary / destructive action lives inside the kebab. Navigation is route-agnostic —
 * `onSelect` (inspector) takes precedence, else the card navigates to `href`.
 */
export function EntityCard(props: EntityCardProps) {
	const {
		entity,
		variant = 'service',
		href,
		onSelect,
		active,
		onTagClick,
		saved,
		onSave,
		menuItems,
		shareUrl,
		actions = true,
	} = props;

	const price = formatPrice(entity);
	const taxonomy = entity.taxonomy ? TAXONOMY_LABEL[entity.taxonomy] : null;

	const stop = (e: Event) => e.stopPropagation();

	const activate = () => {
		if (onSelect) onSelect(entity);
		else if (href) globalThis.location.href = href;
	};

	const actionBar = actions
		? (
			<CardActions
				title={entity.display_title}
				shareUrl={shareUrl ?? href}
				saved={saved}
				onSave={onSave}
				menuItems={menuItems}
			/>
		)
		: null;

	const sponsoredBadge = entity.is_sponsored && (
		<span class='entity-card__sponsored' title='Sponsored placement'>
			<IconSparkles size={12} />
			Sponsored
		</span>
	);

	const owner = entity.owner_name
		? (
			<a class='entity-card__owner' href={`/${entity.owner_handle}`} onClick={stop}>
				<Avatar name={entity.owner_name} src={entity.owner_avatar ?? undefined} size={22} />
				<span class='entity-card__owner-name'>{entity.owner_name}</span>
			</a>
		)
		: null;

	const tags = (
		<div class='entity-card__tags'>
			{entity.tags.slice(0, 3).map((t) => (
				<button
					type='button'
					key={t}
					class='entity-card__tag'
					onClick={(e) => {
						stop(e);
						onTagClick?.(t);
					}}
				>
					{t}
				</button>
			))}
		</div>
	);

	const classes = [
		'entity-card',
		`entity-card--${variant}`,
		`accent-${entity.accent}`,
		entity.is_sponsored && 'entity-card--sponsored',
		active && 'is-active',
		onSelect && 'entity-card--selectable',
		(onSelect || href) && 'entity-card--interactive',
	].filter(Boolean).join(' ');

	// #region COMPACT variant — horizontal list / switcher row
	if (variant === 'compact') {
		return (
			<article class={classes} onClick={activate} tabIndex={0} aria-current={active ?? undefined}>
				<span class='entity-card__compact-avatar'>
					<Avatar
						name={entity.owner_name || entity.display_title}
						src={entity.owner_avatar ?? undefined}
						size={38}
					/>
				</span>
				<div class='entity-card__compact-id'>
					<span class='entity-card__compact-name'>{entity.display_title}</span>
					<span class='entity-card__compact-handle'>@{entity.owner_handle}</span>
				</div>
				{entity.role_label && <span class='entity-card__compact-role'>{entity.role_label}</span>}
				{(active || onSelect) && (
					<span class='entity-card__compact-indicator'>
						{active ? <IconCheck size={16} /> : <IconArrowRight size={16} />}
					</span>
				)}
				{actionBar}
			</article>
		);
	}
	// #endregion

	// #region PROJECT variant — banner-free, high-density metadata only
	if (variant === 'project') {
		const budget = budgetRange(entity);
		return (
			<article class={classes} onClick={activate} tabIndex={0}>
				<div class='entity-card__project-body'>
					<div class='entity-card__topline'>
						<div class='entity-card__typeline'>
							<span class='entity-card__type'>{TYPE_LABEL[entity.entity_type]}</span>
							{entity.subtitle && <span class='entity-card__subtitle'>{entity.subtitle}</span>}
							{sponsoredBadge}
						</div>
						{actionBar}
					</div>

					<h3 class='entity-card__title'>{entity.display_title}</h3>
					{entity.display_description && (
						<p class='entity-card__desc'>{entity.display_description}</p>
					)}

					{entity.scope
						? (
							<div class='entity-card__scope'>
								<div class='entity-card__scope-cell'>
									<IconUsersGroup size={15} />
									<span>{entity.scope.role_count} roles</span>
								</div>
								<div class='entity-card__scope-cell'>
									<IconLayersSubtract size={15} />
									<span>{entity.scope.stage_count} stages</span>
								</div>
								<div class='entity-card__scope-cell'>
									<IconClock size={15} />
									<span>{entity.scope.duration_weeks} wks</span>
								</div>
								<div class='entity-card__scope-cell entity-card__scope-cell--budget'>
									<IconBriefcase size={15} />
									<span>{budget}</span>
								</div>
							</div>
						)
						: (entity.stats && entity.stats.length > 0) && (
							<div class='entity-card__statstrip'>
								{entity.stats.map((s) => (
									<span class='entity-card__stat' key={s.key}>
										{STAT_ICON[s.key]}
										{s.value}
									</span>
								))}
							</div>
						)}

					{(entity.status || entity.timeline_note) && (
						<div class='entity-card__metarow'>
							{entity.status && (
								<span class={`entity-card__status entity-card__status--${entity.status.tone}`}>
									{entity.status.label}
								</span>
							)}
							{entity.timeline_note && (
								<span class='entity-card__timeline'>{entity.timeline_note}</span>
							)}
						</div>
					)}

					<div class='entity-card__foot'>
						{owner}
						{tags}
					</div>
				</div>
			</article>
		);
	}
	// #endregion

	// #region PRODUCT variant — image-forward masonry poster
	if (variant === 'product') {
		return (
			<article class={classes} onClick={activate} tabIndex={0}>
				<div
					class='entity-card__poster'
					style={{
						background: entity.banner ?? undefined,
						aspectRatio: String(productRatio(entity.id)),
					}}
				>
					<div class='entity-card__poster-top'>
						{sponsoredBadge}
						{actionBar}
					</div>
					<div class='entity-card__poster-glow' />
				</div>
				<div class='entity-card__poster-meta'>
					<div class='entity-card__poster-text'>
						<h3 class='entity-card__title'>{entity.display_title}</h3>
						{owner}
					</div>
					{price && <span class='entity-card__price'>{price}</span>}
				</div>
			</article>
		);
	}
	// #endregion

	// #region SERVICE / PROFILE variant — premium asset layout
	const isProfile = variant === 'profile';
	return (
		<article class={classes} onClick={activate} tabIndex={0}>
			<div
				class={`entity-card__banner ${entity.banner ? '' : 'entity-card__banner--empty'}`}
				style={{ background: entity.banner ?? undefined }}
			>
				<div class='entity-card__banner-top'>
					<div class='entity-card__flags'>
						{taxonomy && <span class='entity-card__flag'>{taxonomy}</span>}
						{sponsoredBadge}
					</div>
					{actionBar}
				</div>
				{isProfile && (
					<div class='entity-card__avatar-mount'>
						<Avatar name={entity.owner_name} src={entity.owner_avatar ?? undefined} size={54} />
					</div>
				)}
			</div>

			<div class='entity-card__content'>
				<div class='entity-card__typeline'>
					<span class='entity-card__type'>{TYPE_LABEL[entity.entity_type]}</span>
					{entity.rating_count > 0 && (
						<span class='entity-card__rating'>
							<IconStarFilled size={13} />
							{entity.rating_average.toFixed(1)}
							<i>({entity.rating_count})</i>
						</span>
					)}
				</div>
				<h3 class='entity-card__title'>{entity.display_title}</h3>
				{entity.display_description && <p class='entity-card__desc'>{entity.display_description}
				</p>}

				{tags}

				<div class='entity-card__foot'>
					{isProfile
						? (
							<div class='entity-card__meta-left'>
								{entity.member_count != null && (
									<span class='entity-card__members'>
										<IconUsersGroup size={13} />
										{entity.member_count} members
									</span>
								)}
								{entity.availability && (
									<span class={`entity-card__avail entity-card__avail--${entity.availability}`}>
										<i class='entity-card__dot' />
										{entity.availability}
									</span>
								)}
								{entity.location && (
									<span class='entity-card__loc'>
										<IconMapPin size={13} />
										{entity.location}
									</span>
								)}
								{entity.role_label && <span class='entity-card__role'>{entity.role_label}</span>}
							</div>
						)
						: (owner ?? (entity.timeline_note
							? (
								<span class='entity-card__timeline entity-card__timeline--icon'>
									<IconClock size={13} />
									{entity.timeline_note}
								</span>
							)
							: null))}
					{price && <span class='entity-card__price'>{price}</span>}
				</div>
			</div>
		</article>
	);
	// #endregion
}

export default EntityCard;
