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
			{/* Left Panel: Context Identification */}
			<div class='project-board__panel'>
				<div>
					<h1 class='project-board__title'>{projectTitle}</h1>
					<span class='project-board__subtitle'>
						Workspace Engine: {projectFormat.replace('_', ' ')}
					</span>
				</div>
			</div>

			{/* Middle Panel: Fiduciary Ledger Telemetry */}
			<div class='project-board__panel project-board__panel--middle'>
				<div class='project-board__metrics-grid'>
					<div class='project-board__metric'>
						<span class='project-board__metric-label'>Total Budget</span>
						<span class='project-board__metric-value'>
							{formatCurrency(fiduciary.totalBudgetCents)}
						</span>
					</div>
					<div class='project-board__metric'>
						<span class='project-board__metric-label'>Escrow TVL</span>
						<span class='project-board__metric-value'>
							{formatCurrency(fiduciary.tvlEscrowCents)}
						</span>
					</div>
					<div class='project-board__metric'>
						<span class='project-board__metric-label'>Released</span>
						<span class='project-board__metric-value project-board__metric-value--success'>
							{formatCurrency(fiduciary.releasedBalanceCents)}
						</span>
					</div>
				</div>
			</div>

			{/* Right Panel: Operational Capacity Metrics */}
			<div class='project-board__panel'>
				<div class='project-board__metrics-grid'>
					<div class='project-board__metric'>
						<span class='project-board__metric-label'>Backlog Queue</span>
						<span class='project-board__metric-value'>{capacity.backlogQueueSize} Tickets</span>
					</div>
					<div class='project-board__metric'>
						<span class='project-board__metric-label'>Cumulative Wi</span>
						<span class='project-board__metric-value'>{capacity.cumulativeWi.toFixed(1)}</span>
					</div>
					<div class='project-board__metric'>
						<span class='project-board__metric-label'>Accuracy</span>
						<span class='project-board__metric-value'>{capacity.accuracyPercentage}%</span>
					</div>
				</div>
			</div>
		</header>
	);
}
