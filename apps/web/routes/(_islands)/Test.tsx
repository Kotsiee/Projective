import { GanttChart, RowType } from '@projective/charts';

export default function TestIsland({ children }: { children?: any }) {
	const now = Date.now();
	const day = 24 * 60 * 60 * 1000;

	// #region Mock Data Generation
	const mockData = {
		rows: [
			// Phase 1 Group
			{ id: 'r1', label: 'Phase 1: Discovery', type: RowType.Group, orderIndex: 0 },
			{ id: 'r2', label: 'UX Research', type: RowType.Task, parentId: 'r1', orderIndex: 1 },
			{ id: 'r3', label: 'Wireframing', type: RowType.Task, parentId: 'r1', orderIndex: 2 },
			{
				id: 'r_m1',
				label: 'Discovery Sign-off',
				type: RowType.Milestone,
				parentId: 'r1',
				orderIndex: 3,
			},

			// Phase 2 Group
			{ id: 'r4', label: 'Phase 2: Execution', type: RowType.Group, orderIndex: 4 },
			{ id: 'r5', label: 'Frontend Dev', type: RowType.Task, parentId: 'r4', orderIndex: 5 },
			{ id: 'r6', label: 'Backend API', type: RowType.Task, parentId: 'r4', orderIndex: 6 },
			{ id: 'r_m2', label: 'Beta Release', type: RowType.Milestone, parentId: 'r4', orderIndex: 7 },

			// Final Milestone
			{ id: 'r_m3', label: 'Project Completion', type: RowType.Milestone, orderIndex: 8 },
		],
		tasks: [
			// Phase 1 Tasks
			{
				id: 't1',
				rowId: 'r1',
				name: 'User Interviews',
				startAt: now,
				endAt: now + (3 * day),
				progress: 100,
				status: 'complete',
				isMilestone: false,
			},
			{
				id: 't2',
				rowId: 'r3',
				name: 'Lo-Fi Prototypes',
				startAt: now + (4 * day),
				endAt: now + (7 * day),
				progress: 45,
				status: 'in-progress',
				isMilestone: false,
			},
			// Phase 1 Milestone
			{
				id: 'm1',
				rowId: 'r_m1',
				name: 'Approval Milestone',
				startAt: now + (7.5 * day),
				endAt: now + (7.5 * day), // Point in time
				progress: 0,
				status: 'todo',
				isMilestone: true,
			},

			// Phase 2 Tasks
			{
				id: 't3',
				rowId: 'r5',
				name: 'Component Library',
				startAt: now + (8 * day),
				endAt: now + (15 * day),
				progress: 10,
				status: 'todo',
				isMilestone: false,
			},
			{
				id: 't4',
				rowId: 'r6',
				name: 'Database Schema',
				startAt: now + (8 * day),
				endAt: now + (12 * day),
				progress: 80,
				status: 'in-progress',
				isMilestone: false,
			},
			// Phase 2 Milestone
			{
				id: 'm2',
				rowId: 'r_m2',
				name: 'v1.0-alpha',
				startAt: now + (16 * day),
				endAt: now + (16 * day),
				progress: 0,
				status: 'todo',
				isMilestone: true,
			},

			// Global Milestone
			{
				id: 'm3',
				rowId: 'r_m3',
				name: 'Final Delivery',
				startAt: now + (20 * day),
				endAt: now + (20 * day),
				progress: 0,
				status: 'todo',
				isMilestone: true,
			},
		],
		dependencies: [],
	};
	// #endregion

	return (
		<div className='dashboard-container'>
			<div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
				<h3 style={{ margin: 0 }}>Timeline Engine (PixiJS + Signals)</h3>
				<p style={{ margin: '0.5rem 0 0 0' }}>
					Testing 60fps virtualization and synchronized DOM/Canvas scrolling.
				</p>
			</div>

			<div style={{ height: '500px', width: '90%' }}>
				{/* @ts-ignore - Temporary bypass if strict type check still flags filtered arrays */}
				<GanttChart initialData={mockData} />
			</div>
		</div>
	);
}
