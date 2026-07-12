/**
 * @file CrmFilterTray.tsx
 * @description The elegant, collapsible CRM filter tray for the Projects workspace. Segments the
 * active roster three holistic ways — by client account (General Clients), by the specific service
 * tier purchased (Specific Services), and by the distinct project contract (Specific Projects).
 * Chips are multi-select with live match counts; a summary bar shows the active count + a clear-all.
 */

import { IconAdjustmentsHorizontal, IconChevronDown, IconX } from '@tabler/icons-preact';
import type { CrmFilters, CrmOption, CrmOptionGroups } from '../../contracts/crm.ts';

interface CrmFilterTrayProps {
	open: boolean;
	onToggleOpen: () => void;
	options: CrmOptionGroups;
	filters: CrmFilters;
	activeCount: number;
	onToggleFilter: (axis: keyof CrmFilters, id: string) => void;
	onClear: () => void;
}

function ChipGroup(
	{ title, axis, options, selected, onToggle }: {
		title: string;
		axis: keyof CrmFilters;
		options: CrmOption[];
		selected: string[];
		onToggle: (axis: keyof CrmFilters, id: string) => void;
	},
) {
	if (options.length === 0) return null;
	return (
		<div class='pw-crm__group'>
			<span class='pw-crm__group-title'>{title}</span>
			<div class='pw-crm__chips'>
				{options.map((o) => {
					const active = selected.includes(o.id);
					return (
						<button
							key={o.id}
							type='button'
							class='pw-crm__chip'
							data-active={active}
							aria-pressed={active}
							onClick={() => onToggle(axis, o.id)}
						>
							<span class='pw-crm__chip-label'>{o.label}</span>
							<span class='pw-crm__chip-count'>{o.count}</span>
						</button>
					);
				})}
			</div>
		</div>
	);
}

export default function CrmFilterTray(
	{ open, onToggleOpen, options, filters, activeCount, onToggleFilter, onClear }:
		CrmFilterTrayProps,
) {
	return (
		<section class='pw-crm' data-open={open}>
			<header class='pw-crm__bar'>
				<button type='button' class='pw-crm__trigger' onClick={onToggleOpen} aria-expanded={open}>
					<IconAdjustmentsHorizontal size={16} />
					<span>Filter clients</span>
					{activeCount > 0 && <span class='pw-crm__badge'>{activeCount}</span>}
					<IconChevronDown size={15} class='pw-crm__chev' />
				</button>

				{activeCount > 0 && (
					<button type='button' class='pw-crm__clear' onClick={onClear}>
						<IconX size={14} /> Clear
					</button>
				)}
			</header>

			{open && (
				<div class='pw-crm__body'>
					<ChipGroup
						title='General clients'
						axis='clientIds'
						options={options.clients}
						selected={filters.clientIds}
						onToggle={onToggleFilter}
					/>
					<ChipGroup
						title='Specific services'
						axis='serviceIds'
						options={options.services}
						selected={filters.serviceIds}
						onToggle={onToggleFilter}
					/>
					<ChipGroup
						title='Specific projects'
						axis='projectIds'
						options={options.projects}
						selected={filters.projectIds}
						onToggle={onToggleFilter}
					/>
				</div>
			)}
		</section>
	);
}
