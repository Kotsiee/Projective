import '@styles/components/dashboard/business/business-island.css';

import { useMemo } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { IconPlus, IconSearch } from '@tabler/icons-preact';
import { DataDisplay, RestDataSource } from '@projective/data';
import { TextField } from '@projective/fields';
import { Button } from '@projective/ui';
import { DashboardBusiness } from '@contracts/dashboard/business/Business.ts';
import { BusinessCard } from '@components/dashboard/business/BusinessCard.tsx';

export default function BusinessesIsland() {
	const searchQuery = useSignal('');

	// DataSource configuration for the Businesses API
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
		<div className='business-island'>
			{/* Page Header */}
			<div className='business-island__page-header'>
				<h1>Businesses</h1>
				<p>
					Manage your legal entities, billing profiles, and client relationships.
				</p>
			</div>

			{/* Controls Toolbar */}
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

			{/* Data Grid */}
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
		</div>
	);
}
