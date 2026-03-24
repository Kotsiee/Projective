export default function Projects() {
	return (
		<div
			style={{
				minHeight: '500vh',
			}}
		>
			<div>
				<h1>Select a project</h1>
				<p>
					Or <a href='/projects/new' f-client-nav={false}>Join</a> a New One
				</p>
			</div>
			<div>
				<h3>Recommended Projects</h3>
			</div>
		</div>
	);
}
