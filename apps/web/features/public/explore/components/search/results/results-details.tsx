import '../../../styles/components/search/results/results-details.css';
import { useExploreContext } from '../../../contexts/ExploreContext.tsx';
import { useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { Button, Skeleton } from '@projective/ui';
import { StringModifier } from '@projective/utils';
import {
	IconBriefcase,
	IconClock,
	IconCurrencyDollar,
	IconLayoutGridAdd,
	IconMapPin,
	IconX,
} from '@tabler/icons-preact';
import { DateTime } from 'packages/types/src/core/datetime.ts';

export default function ExploreSearchResultsDetails() {
	const { selectedItem } = useExploreContext();
	const isLoading = useSignal(false);
	const parsedData = useSignal<any | null>(null);

	// Map raw polymorphic data into a clean, uniform object for the details pane
	useEffect(() => {
		if (!selectedItem.value) {
			parsedData.value = null;
			return;
		}

		let isMounted = true;
		isLoading.value = true;

		// Helper to execute the data mapping once we have the full object
		const processRawData = (raw: any) => {
			const mapped: any = {
				id: raw.id || raw.project_id || raw.entity_id || raw.service_id,
				type: 'Item',
				title: 'Unknown',
				subtitle: '',
				description: '',
				bannerUrl: '',
				avatarUrl: '',
				tags: [],
				attributes: [],
			};

			// Project Mapping
			if (raw.project_id) {
				mapped.type = 'Project';
				mapped.title = raw.title;
				mapped.subtitle = raw.owner?.name ? `Posted by ${raw.owner.name}` : '';
				mapped.description = raw.description || '';
				mapped.bannerUrl = raw.thumbnail_url;
				mapped.avatarUrl = raw.owner?.avatar_url;
				mapped.tags = raw.skills || [];

				if (raw.locations?.[0]) {
					mapped.attributes.push({ icon: <IconMapPin size={16} />, label: raw.locations[0] });
				}
				if (raw.target_project_start_date) {
					mapped.attributes.push({
						icon: <IconClock size={16} />,
						label: new DateTime(raw.target_project_start_date).toFormat('DD MMM YYYY'),
					});
				}
				if (raw.roles?.length) {
					mapped.attributes.push({
						icon: <IconBriefcase size={16} />,
						label: `${raw.roles.length} Role(s) Open`,
					});
				}
			} // People Mapping
			else if (raw.entity_id) {
				mapped.type = StringModifier.titleCase(raw.entity_type || 'Profile');
				mapped.title = raw.display_name;
				mapped.subtitle = raw.headline || '';
				mapped.description = raw.metadata?.bio || '';
				mapped.avatarUrl = raw.metadata?.avatar_url;
				mapped.tags = raw.metadata?.skills || [];
				if (raw.metadata?.hourly_rate) {
					mapped.attributes.push({
						icon: <IconCurrencyDollar size={16} />,
						label: `$${raw.metadata.hourly_rate}/hr`,
					});
				}
			} // Services Mapping
			else if (raw.service_id) {
				mapped.type = 'Service';
				mapped.title = raw.title;
			}

			if (isMounted) {
				parsedData.value = mapped;
				isLoading.value = false;
			}
		};

		const rawState = selectedItem.value;

		// If the context hydrated from the URL, it needs to fetch the full object
		if (rawState.fetchNeeded && rawState.id && rawState.type) {
			fetch(`/api/v1/public/search/${rawState.type}?id=${rawState.id}`)
				.then((res) => {
					if (!res.ok) throw new Error('Failed to fetch details');
					return res.json();
				})
				.then((data) => {
					if (!isMounted) return;
					if (data.items && data.items.length > 0) {
						const fullItem = data.items[0];
						// Update the context so we don't fetch again if the user navigates away and back
						selectedItem.value = fullItem;
						processRawData(fullItem);
					} else {
						// 404 Fallback
						isLoading.value = false;
					}
				})
				.catch((err) => {
					console.error('[Explore Details] Hydration Fetch Error:', err);
					if (isMounted) isLoading.value = false;
				});
		} else {
			// We already have the full object (user clicked a card in the UI)
			// Small timeout for polish to ensure skeletons flash nicely on rapid clicks
			setTimeout(() => {
				processRawData(rawState);
			}, 150);
		}

		return () => {
			isMounted = false;
		};
	}, [selectedItem.value]);

	// STATE 1: Empty
	if (!selectedItem.value) {
		return (
			<div class='explore-search-results-details explore-search-results-details--empty'>
				<div class='explore-search-results-details__empty-state'>
					<IconLayoutGridAdd size={48} color='var(--text-disabled)' />
					<h3>Select an item</h3>
					<p>Click on any result to view its full details here.</p>
				</div>
			</div>
		);
	}

	// STATE 2: Loading (Using your official Skeleton UI primitives)
	if (isLoading.value || !parsedData.value) {
		return (
			<div class='explore-search-results-details explore-search-results-details--loading'>
				<Skeleton variant='image' height={140} style={{ borderRadius: 0 }} />

				<div style={{ position: 'relative', marginTop: '-2.5rem', marginLeft: '2rem' }}>
					<Skeleton
						variant='avatar'
						width={80}
						height={80}
						style={{ border: '4px solid var(--card)' }}
					/>
				</div>

				<div
					style={{
						padding: '0 2rem',
						marginTop: '1.5rem',
						display: 'flex',
						flexDirection: 'column',
						gap: '1rem',
					}}
				>
					<Skeleton variant='text' width='25%' height={12} />
					<Skeleton variant='text' width='75%' height={28} />
					<Skeleton variant='text' width='40%' height={14} />

					<div style={{ marginTop: '1.5rem' }}>
						<Skeleton variant='multiline' lines={5} />
					</div>
				</div>
			</div>
		);
	}

	// STATE 3: Populated
	const data = parsedData.value;

	const generateViewUrl = () => {
		switch (data.type.toLowerCase()) {
			case 'project':
				return `/view/project?id=${data.id}`;
			case 'service':
				return `/view/service?id=${data.id}`;
			default:
				return data.username ? `/${data.username}` : `/view/profile?id=${data.id}`;
		}
	};

	return (
		<div class='explore-search-results-details'>
			<div class='explore-search-results-details__hero'>
				{data.bannerUrl
					? <img class='explore-search-results-details__banner' src={data.bannerUrl} alt='Banner' />
					: (
						<div class='explore-search-results-details__banner explore-search-results-details__banner--fallback' />
					)}

				<div class='explore-search-results-details__identity'>
					{data.avatarUrl
						? (
							<img
								class='explore-search-results-details__avatar'
								src={data.avatarUrl}
								alt='Avatar'
							/>
						)
						: (
							<div class='explore-search-results-details__avatar explore-search-results-details__avatar--fallback'>
								{data.title.charAt(0)}
							</div>
						)}
				</div>
			</div>

			<div class='explore-search-results-details__body'>
				<div class='explore-search-results-details__header'>
					<span class='explore-search-results-details__type'>{data.type}</span>
					<h2 class='explore-search-results-details__title'>{data.title}</h2>
					{data.subtitle && <p class='explore-search-results-details__subtitle'>{data.subtitle}</p>}
				</div>

				{data.attributes && data.attributes.length > 0 && (
					<ul class='explore-search-results-details__attributes'>
						{data.attributes.map((attr: any, idx: number) => (
							<li key={idx}>
								{attr.icon}
								<span>{attr.label}</span>
							</li>
						))}
					</ul>
				)}

				{data.description && (
					<div class='explore-search-results-details__section'>
						<h3>Description</h3>
						<p class='explore-search-results-details__description'>
							{data.description}
						</p>
					</div>
				)}

				{data.tags && data.tags.length > 0 && (
					<div class='explore-search-results-details__section'>
						<h3>Skills & Tags</h3>
						<ul class='explore-search-results-details__tags'>
							{data.tags.map((tag: string) => (
								<li key={tag} class='explore-search-results-details__tag'>{tag}</li>
							))}
						</ul>
					</div>
				)}
			</div>

			<div class='explore-search-results-details__footer'>
				<Button
					variant='primary'
					size='large'
					style={{ width: '100%' }}
					onClick={() => {
						globalThis.location.href = generateViewUrl();
					}}
				>
					View Full {data.type}
				</Button>
			</div>
		</div>
	);
}
