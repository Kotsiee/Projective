/**
 * @file BoardHeader.tsx
 * @description The top-level statistics, metadata, and toolbar display for the Project Board.
 */

import { useSignal } from '@preact/signals';
import { DateTime } from '@projective/types';
import { Button } from '@projective/ui';
import {
	IconFilter,
	IconSearch,
	IconSortAscending,
	IconSortDescending,
} from '@tabler/icons-preact';

// #region Interfaces
export interface FiduciaryMetrics {
	totalBudgetCents: number;
	tvlEscrowCents: number;
	releasedBalanceCents: number;
}

export interface CapacityMetrics {
	backlogQueueSize: number;
	cumulativeWi: number;
	accuracyPercentage: number;
}

interface BoardHeaderProps {
	projectTitle: string;
	projectFormat: string;
	fiduciary?: FiduciaryMetrics;
	capacity?: CapacityMetrics;
}
// #endregion

const formatCurrency = (cents: number) => {
	return (cents / 100).toLocaleString('en-US', {
		style: 'currency',
		currency: 'USD',
	});
};

export function BoardHeader(
	{ projectTitle, projectFormat, fiduciary, capacity }: BoardHeaderProps,
) {
	const isFilterOpen = useSignal(false);
	const sortDesc = useSignal(true); // Toggle for Descending vs Ascending

	// Fallback to 0 if metrics aren't fully resolved yet
	const spent = fiduciary?.releasedBalanceCents ?? 0;
	const activeTickets = capacity?.backlogQueueSize ?? 0;

	return (
		<header class='project-board__header'>
			{/* 1. TOP ROW: Title & Metrics */}
			<div class='project-board__header-top'>
				<div class='project-board__panel'>
					<h1 class='project-board__title'>{projectTitle}</h1>
					<span class='project-board__subtitle'>
						{projectFormat.replace('_', ' ').toUpperCase()}
					</span>
				</div>

				<div class='project-board__details'>
					<div class='project-board__details-section'>
						<span class='project-board__details-label'>Tickets</span>
						<div class='project-board__details-section__content'>
							<BoardMetric name='New' rawValue={3} />
							<BoardMetric name='Active' rawValue={activeTickets} />
							<BoardMetric name='Total' rawValue={activeTickets + 3} />
						</div>
					</div>
					<div class='project-board__details-section'>
						<span class='project-board__details-label'>Budget</span>
						<div class='project-board__details-section__content'>
							<BoardMetric name='Avg.' rawValue={0} type='currency' />
							<BoardMetric name='Spent' rawValue={spent} type='currency' />
						</div>
					</div>
				</div>
			</div>

			{/* 2. MIDDLE ROW: Toolbar */}
			<div class='project-board__toolbar'>
				<div class='project-board__search'>
					<IconSearch size={18} class='project-board__search-icon' />
					<input
						type='text'
						class='project-board__search-input'
						placeholder='Search tickets by title or ID...'
					/>
				</div>

				<div class='project-board__toolbar-actions'>
					<Button
						variant='secondary'
						onClick={() => sortDesc.value = !sortDesc.value}
					>
						{sortDesc.value ? <IconSortDescending size={18} /> : <IconSortAscending size={18} />}
						Sort
					</Button>
					<Button
						variant={isFilterOpen.value ? 'primary' : 'secondary'}
						onClick={() => isFilterOpen.value = !isFilterOpen.value}
					>
						<IconFilter size={18} />
						Filter
					</Button>
				</div>
			</div>

			{/* 3. BOTTOM ROW: Collapsible Filters */}
			{isFilterOpen.value && (
				<div class='project-board__filters'>
					<div class='project-board__filter-group'>
						<label>Status</label>
						<select class='project-board__select'>
							<option value='all'>All Statuses</option>
							<option value='backlog'>Backlog</option>
							<option value='todo'>Todo</option>
							<option value='in_progress'>In Progress</option>
							<option value='in_review'>In Review</option>
							<option value='completed'>Completed</option>
						</select>
					</div>

					<div class='project-board__filter-group'>
						<label>Assignee</label>
						<select class='project-board__select'>
							<option value='all'>Anyone</option>
							<option value='me'>Assigned to me</option>
							<option value='unassigned'>Unassigned</option>
						</select>
					</div>

					<div class='project-board__filter-group'>
						<label>Start Date</label>
						<input type='date' class='project-board__input' />
					</div>

					<div class='project-board__filter-group'>
						<label>Last Updated</label>
						<select class='project-board__select'>
							<option value='any'>Any time</option>
							<option value='today'>Today</option>
							<option value='week'>Last 7 days</option>
							<option value='month'>Last 30 days</option>
						</select>
					</div>
				</div>
			)}
		</header>
	);
}

export function BoardMetric(
	{ name, rawValue, type }: { name: string; rawValue: string | number | DateTime; type?: string },
) {
	let value: string = rawValue as string;

	switch (type) {
		case 'currency':
			value = formatCurrency(rawValue as number);
			break;
	}

	return (
		<div class='project-board__metric'>
			<span class='project-board__metric-value'>{value}</span>
			<span class='project-board__metric-name'>{name}</span>
		</div>
	);
}
