import '../../../styles/components/search/results/results-details.css';
import { useSignal } from '@preact/signals';
import { Avatar, Button } from '@projective/ui';
import {
	IconArrowUpRight,
	IconBriefcase,
	IconClock,
	IconDots,
	IconExternalLink,
	IconFlag,
	IconLayersSubtract,
	IconMapPin,
	IconMessage,
	IconStarFilled,
	IconUsersGroup,
	IconX,
} from '@tabler/icons-preact';
import type { ExploreEntity } from '@projective/types';
import { useExploreContext } from '../../../contexts/ExploreContext.tsx';
import { isProfileType } from '../../../data/exploreSeed.ts';

const TYPE_LABEL: Record<ExploreEntity['entity_type'], string> = {
	service: 'Service',
	product: 'Product',
	person: 'Freelancer',
	team: 'Team',
	business: 'Business',
	project: 'Project',
};

function money(cents: number): string {
	const n = cents / 100;
	return n >= 1000 ? `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `$${n}`;
}

function priceLabel(e: ExploreEntity): string | null {
	if (e.price_cents == null) return null;
	const m = money(e.price_cents);
	if (e.price_unit === 'per_hour') return `${m}/hr`;
	if (e.price_unit === 'per_seat') return `${m}/seat`;
	if (e.price_unit === 'from') return `From ${m}`;
	return m;
}

function fullPageHref(e: ExploreEntity): string {
	return isProfileType(e.entity_type) ? `/${e.owner_handle}` : `/view/${e.id}`;
}

/**
 * @function ExploreSearchInspector
 * @description The right-hand quick-inspector. A top canopy (mini banner + overlapping avatar +
 * identity + primary CTAs) sits above a density-optimized content canvas that renders only the
 * metadata relevant to the selected entity type. The "Report Listing" action is tucked inside a
 * 3-dot kebab menu.
 */
export default function ExploreSearchInspector() {
	const { selectedItem } = useExploreContext();
	const menuOpen = useSignal(false);
	const e = selectedItem.value;

	if (!e) return null;

	const isProfile = isProfileType(e.entity_type);
	const price = priceLabel(e);

	// Contextual primary CTAs.
	const primaryLabel = isProfile
		? 'Hire'
		: e.entity_type === 'project'
		? 'Apply now'
		: 'Get started';

	return (
		<div class={`inspector accent-${e.accent}`}>
			{/* Top toolbar (close + kebab) floats over the canopy */}
			<div class='inspector__toolbar'>
				<div class='inspector__kebab'>
					<button
						type='button'
						class='inspector__icon-btn'
						aria-label='More actions'
						aria-haspopup='menu'
						aria-expanded={menuOpen.value}
						onClick={() => menuOpen.value = !menuOpen.value}
					>
						<IconDots size={18} />
					</button>
					{menuOpen.value && (
						<>
							<div class='inspector__menu-backdrop' onClick={() => menuOpen.value = false} />
							<div class='inspector__menu' role='menu'>
								<button
									type='button'
									class='inspector__menu-item inspector__menu-item--danger'
									role='menuitem'
									onClick={() => menuOpen.value = false}
								>
									<IconFlag size={15} />
									Report Listing
								</button>
							</div>
						</>
					)}
				</div>
				<button
					type='button'
					class='inspector__icon-btn'
					aria-label='Close inspector'
					onClick={() => selectedItem.value = null}
				>
					<IconX size={18} />
				</button>
			</div>

			{/* Canopy + identity overlay */}
			<div class='inspector__canopy' style={{ background: e.banner ?? undefined }} />
			<div class='inspector__identity'>
				<div class='inspector__avatar'>
					<Avatar name={e.owner_name} src={e.owner_avatar ?? undefined} size={72} />
				</div>
				<div class='inspector__id-text'>
					<span class='inspector__type'>{TYPE_LABEL[e.entity_type]}</span>
					<h2 class='inspector__title'>{e.display_title}</h2>
					<a class='inspector__owner' href={`/${e.owner_handle}`}>@{e.owner_handle}</a>
				</div>
			</div>

			{/* Primary CTAs */}
			<div class='inspector__cta'>
				<Button variant='primary' rounded onClick={() => {}}>{primaryLabel}</Button>
				<Button
					variant='secondary'
					outlined
					rounded
					startIcon={<IconMessage size={16} />}
					onClick={() => {}}
				>
					Message
				</Button>
			</div>

			{/* Density-optimized content canvas */}
			<div class='inspector__body'>
				{/* Rating + price strip */}
				<div class='inspector__stat-row'>
					<div class='inspector__stat'>
						<span class='inspector__stat-icon'>
							<IconStarFilled size={16} />
						</span>
						<div>
							<strong>{e.rating_average.toFixed(1)}</strong>
							<small>{e.rating_count} reviews</small>
						</div>
					</div>
					{price && (
						<div class='inspector__stat'>
							<span class='inspector__stat-icon'>
								<IconBriefcase size={16} />
							</span>
							<div>
								<strong>{price}</strong>
								<small>starting price</small>
							</div>
						</div>
					)}
					{e.location && (
						<div class='inspector__stat'>
							<span class='inspector__stat-icon'>
								<IconMapPin size={16} />
							</span>
							<div>
								<strong>{e.location}</strong>
								<small>location</small>
							</div>
						</div>
					)}
				</div>

				{e.display_description && (
					<section class='inspector__section'>
						<h3>Overview</h3>
						<p>{e.display_description}</p>
					</section>
				)}

				{/* Project-specific scope table */}
				{e.entity_type === 'project' && e.scope && (
					<section class='inspector__section'>
						<h3>Scope</h3>
						<div class='inspector__scope'>
							<div>
								<IconUsersGroup size={16} />
								<span>{e.scope.role_count} open roles</span>
							</div>
							<div>
								<IconLayersSubtract size={16} />
								<span>{e.scope.stage_count} stages</span>
							</div>
							<div>
								<IconClock size={16} />
								<span>{e.scope.duration_weeks} weeks</span>
							</div>
							<div class='inspector__scope-budget'>
								<IconBriefcase size={16} />
								<span>{money(e.scope.budget_min_cents)} – {money(e.scope.budget_max_cents)}</span>
							</div>
						</div>
					</section>
				)}

				{/* Availability (profiles) */}
				{isProfile && e.availability && (
					<section class='inspector__section'>
						<h3>Availability</h3>
						<span class={`inspector__avail inspector__avail--${e.availability}`}>
							<i />
							{e.availability}
						</span>
					</section>
				)}

				{/* Tech stack / skills / tags */}
				{e.tags.length > 0 && (
					<section class='inspector__section'>
						<h3>{e.entity_type === 'project' ? 'Tech stack' : 'Skills & tags'}</h3>
						<div class='inspector__tags'>
							{e.tags.map((t) => <span key={t} class='inspector__tag'>{t}</span>)}
						</div>
					</section>
				)}
			</div>

			{/* Footer link to the full page */}
			<div class='inspector__footer'>
				<a class='inspector__full-link' href={fullPageHref(e)}>
					<IconExternalLink size={16} />
					View full {isProfile ? 'profile' : `${TYPE_LABEL[e.entity_type].toLowerCase()} page`}
					<IconArrowUpRight size={16} />
				</a>
			</div>
		</div>
	);
}
