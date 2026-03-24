import NewProjectIslandWrapper from '../(_islands)/new/Index.island.tsx';

export default function NewProject() {
	return (
		<div
			style={{
				width: 'calc(100% - 1rem)',
				height: 'calc(100vh - var(--header-height, 4rem) - 3rem)',
				display: 'flex',
				paddingLeft: '1rem',
				paddingTop: '1rem',
			}}
		>
			<NewProjectIslandWrapper />
		</div>
	);
}
