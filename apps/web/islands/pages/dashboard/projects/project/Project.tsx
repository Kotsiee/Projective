import { useProjectContext } from '@contexts/ProjectContext.tsx';

export default function ProjectIsland() {
	const state = useProjectContext();
	return (
		<div style={{ padding: '2rem' }}>
			<div
				style={{
					marginBottom: '2rem',
					borderBottom: '1px solid var(--border-color)',
					paddingBottom: '1rem',
				}}
			>
				<h1 style={{ fontSize: '1.5rem', margin: 0 }}>Project Details</h1>
				<span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
					ID: {state.project_id}
				</span>
			</div>

			<div
				style={{
					background: 'var(--bg-surface)',
					padding: '2rem',
					borderRadius: 'var(--border-radius)',
					border: '1px solid var(--border-color)',
				}}
			>
				<h2>Project Overview</h2>
				<p>
					This is where the detailed view for project <strong>{state.project_id}</strong> will go.
				</p>

				<br />

				<div style={{ display: 'flex', gap: '1rem' }}>
					<button type='button' class='btn btn-primary'>Manage Stages</button>
					<button type='button' class='btn btn-secondary'>View Files</button>
				</div>
			</div>
		</div>
	);
}
