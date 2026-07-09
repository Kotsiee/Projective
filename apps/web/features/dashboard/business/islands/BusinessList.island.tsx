/**
 * @file BusinessList.island.tsx
 * @description Atomic island for the Businesses list: the search toolbar + the virtualized,
 * paginated `DataDisplay` grid (live search over `/api/v1/dashboard/business`). Only the
 * interactive surface lives here — the static page header is server-rendered by the route. The
 * grid's own `RestDataSource` owns its windowed fetching/pagination model.
 */

// business-island.css is loaded globally (styles.css) — the page header is server-rendered, so a
// CSS import here (an island bundle) is not where this stylesheet belongs.
import { useMemo } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { IconPlus, IconSearch } from '@tabler/icons-preact';
import { DataDisplay, RestDataSource } from '@projective/data';
import { TextField } from '@projective/fields';
import { Button } from '@projective/ui';
import { DashboardBusiness } from '../contracts/Business.ts';
import { BusinessCard } from '../components/BusinessCard.tsx';

export default function BusinessListIsland() {
	const searchQuery = useSignal('');

	const dataSource = useMemo(() => {
		return new RestDataSource<DashboardBusiness, DashboardBusiness>({
			url: '/api/v1/dashboard/business',
			keyExtractor: (item) => item.id,
			fetchOptions: {
				credentials: 'include',
			},
			defaultParams: {
				search: searchQuery.value,
				sortBy: 'created_at',
				sortDir: 'desc',
			},
		});
	}, [searchQuery.value]);

	const handleSearchInput = (e: InputEvent) => {
		searchQuery.value = (e.currentTarget as HTMLInputElement).value;
	};

	return (
		<>
			<div className='business-island__toolbar'>
				<div className='business-island__controls'>
					<div className='business-island__search'>
						<TextField
							name='business-search'
							placeholder='Search businesses...'
							value={searchQuery}
							onInput={handleSearchInput}
							prefix={<IconSearch size={16} style={{ color: 'var(--text-muted)' }} />}
							floating={false}
							className='business-island__search-input'
						/>
					</div>
				</div>

				<div className='business-island__actions'>
					<Button
						href='/business/new'
						variant='primary'
						startIcon={<IconPlus size={18} />}
					>
						Create Business
					</Button>
				</div>
			</div>

			<div className='business-island__content'>
				<DataDisplay<DashboardBusiness, DashboardBusiness>
					dataSource={dataSource}
					mode='grid'
					gridColumns={4}
					estimateHeight={200}
					pageSize={24}
					selectionMode='single'
					renderItem={(business) => <BusinessCard business={business} />}
					interactive
					scrollMode='window'
				/>
			</div>
		</>
	);
}
