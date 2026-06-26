import { DateTime } from '@projective/types';

// Shared interfaces can be extracted to a separate file, defining them here for completeness
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
	fiduciary: FiduciaryMetrics;
	capacity: CapacityMetrics;
}

const formatCurrency = (cents: number) => {
	return (cents / 100).toLocaleString('en-US', {
		style: 'currency',
		currency: 'USD',
	});
};

export function BoardHeader(
	{ projectTitle, projectFormat, fiduciary, capacity }: BoardHeaderProps,
) {
	return (
		<header class='project-board__header'>
			<div class='project-board__panel'>
				<h1 class='project-board__title'>{projectTitle}</h1>
			</div>

			<div class='project-board__details'>
				<div class='project-board__details-section'>
					<h3>Tickets</h3>
					<div class='project-board__details-section__content'>
						<BoardMetric name='New' rawValue={3} />
						<BoardMetric name='Active' rawValue={5} />
						<BoardMetric name='Total' rawValue={8} />
					</div>
				</div>
				<div class='project-board__details-section'>
					<h3>Budget</h3>
					<div class='project-board__details-section__content'>
						<BoardMetric name='Ave. Cost / Ticket' rawValue={98327} type='currency' />
						<BoardMetric name='Spent' rawValue={3672353276} type='currency' />
					</div>
				</div>
			</div>
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
		<div class='project-board__details-metric'>
			<p class='project-board__details-metric__name'>{name}</p>
			<p class='project-board__details-metric__value'>{value}</p>
		</div>
	);
}
