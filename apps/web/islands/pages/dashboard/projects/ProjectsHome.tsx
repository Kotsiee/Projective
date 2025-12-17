import { useMemo, useState } from 'preact/hooks';
import { ColumnDef, DataDisplay, DisplayMode } from '@projective/data';

// --- 1. Mock Data Generator (The "Sugar") ---
interface MockUser {
	id: string;
	name: string;
	email: string;
	role: 'Admin' | 'Editor' | 'Viewer';
	status: 'Active' | 'Inactive';
	joined: string;
}

const generateUsers = (count: number): MockUser[] => {
	return Array.from({ length: count }, (_, i) => ({
		id: `u-${i}`,
		name: `User ${i + 1}`,
		email: `user${i + 1}@projective.dev`,
		role: i % 10 === 0 ? 'Admin' : i % 3 === 0 ? 'Editor' : 'Viewer',
		status: i % 5 === 0 ? 'Inactive' : 'Active',
		joined: new Date(Date.now() - i * 10000000).toISOString().split('T')[0],
	}));
};

// --- 2. Configuration Definitions ---

// Table Columns
const columns: ColumnDef<MockUser>[] = [
	{ id: 'id', field: 'id', label: 'ID', width: 80, sortable: true },
	{ id: 'name', field: 'name', label: 'Name', width: 200, sortable: true },
	{ id: 'email', field: 'email', label: 'Email Address', width: 250, sortable: true },
	{ id: 'role', field: 'role', label: 'Role', width: 100, sortable: true },
	{
		id: 'status',
		field: 'status',
		label: 'Status',
		width: 100,
		sortable: true,
		align: 'center',
	},
	{
		id: 'joined',
		field: 'joined',
		label: 'Date Joined',
		width: 120,
		align: 'right',
		sortable: true,
	},
];

export default function ProjectsHome() {
	// --- State ---
	const [data] = useState(() => generateUsers(10000)); // Generate 10k items once
	const [mode, setMode] = useState<DisplayMode>('table');
	const [selectionMode, setSelectionMode] = useState<'single' | 'multi' | 'none'>('multi');
	const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

	// --- Renderers ---

	// Used for List and Grid modes
	const renderCard = (user: MockUser) => (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
			<div style={{ fontWeight: 'bold', fontSize: '14px' }}>{user.name}</div>
			<div style={{ fontSize: '12px', color: '#666' }}>{user.email}</div>
			<div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
				<span
					style={{
						fontSize: '10px',
						padding: '2px 6px',
						borderRadius: '10px',
						backgroundColor: user.role === 'Admin' ? '#dbeafe' : '#f3f4f6',
						color: user.role === 'Admin' ? '#1e40af' : '#374151',
					}}
				>
					{user.role}
				</span>
				<span
					style={{
						fontSize: '10px',
						padding: '2px 6px',
						borderRadius: '10px',
						backgroundColor: user.status === 'Active' ? '#dcfce7' : '#fee2e2',
						color: user.status === 'Active' ? '#166534' : '#991b1b',
					}}
				>
					{user.status}
				</span>
			</div>
		</div>
	);

	return (
		<div
			style={{
				padding: '20px',
				fontFamily: 'sans-serif',
				height: '100vh',
				display: 'flex',
				flexDirection: 'column',
				gap: '20px',
				boxSizing: 'border-box',
				backgroundColor: '#f9fafb',
			}}
		>
			{/* --- Header / Controls --- */}
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					padding: '16px',
					backgroundColor: 'white',
					borderRadius: '8px',
					boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
				}}
			>
				<div>
					<h1 style={{ margin: 0, fontSize: '1.2rem' }}>Projective Data Display</h1>
					<p style={{ margin: '4px 0 0', color: '#666', fontSize: '0.9rem' }}>
						Loaded {data.length.toLocaleString()} items (Virtual Scrolled)
					</p>
				</div>

				<div style={{ display: 'flex', gap: '20px' }}>
					{/* View Mode Toggle */}
					<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
						<label style={{ fontSize: '0.9rem', fontWeight: 600 }}>View:</label>
						<select
							value={mode}
							onChange={(e) => setMode(e.currentTarget.value as DisplayMode)}
							style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
						>
							<option value='table'>Table</option>
							<option value='grid'>Grid</option>
							<option value='list'>List</option>
						</select>
					</div>

					{/* Selection Mode Toggle */}
					<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
						<label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Selection:</label>
						<select
							value={selectionMode}
							onChange={(e) => setSelectionMode(e.currentTarget.value as any)}
							style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
						>
							<option value='single'>Single</option>
							<option value='multi'>Multi (Ctrl/Shift)</option>
							<option value='none'>None</option>
						</select>
					</div>
				</div>
			</div>

			{/* --- Main Display Area --- */}
			<div
				style={{
					flex: 1,
					backgroundColor: 'white',
					borderRadius: '8px',
					boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
					overflow: 'hidden', // Important for scroll pane
					border: '1px solid #e5e7eb',
				}}
			>
				<DataDisplay
					// Data
					dataSource={data}
					// Renderers
					renderItem={renderCard} // Used for Grid/List
					// Config
					mode={mode}
					columns={columns} // Used for Table
					gridColumns={4} // Used for Grid
					// Performance
					estimateHeight={mode === 'table' ? 40 : 80} // Hint helps physics
					// Interaction
					selectionMode={selectionMode}
					onSelectionChange={(keys) => setSelectedKeys(keys)}
				/>
			</div>

			{/* --- Footer / Feedback --- */}
			<div
				style={{
					padding: '12px',
					backgroundColor: 'white',
					borderRadius: '8px',
					fontSize: '0.9rem',
					borderTop: '4px solid #3b82f6',
				}}
			>
				<strong>Selection State:</strong>
				{selectedKeys.size === 0 ? <span style={{ color: '#999' }}>No items selected</span> : (
					<span>
						{selectedKeys.size} item{selectedKeys.size === 1 ? '' : 's'} selected (IDs:{' '}
						{Array.from(selectedKeys).slice(0, 5).join(', ')}
						{selectedKeys.size > 5 && '...'})
					</span>
				)}
			</div>
		</div>
	);
}
