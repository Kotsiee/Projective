export default function ViewIsland({ id, type }: { id: string | null; type: string }) {
	return (
		<div class='view-island'>
			<h1>ID: {id}</h1>
			<h1>Type: {type}</h1>
			<h1>View Island</h1>
		</div>
	);
}
