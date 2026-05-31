import { walkSync } from 'jsr:@std/fs/walk';

function discoverFeatureIslands(): string[] {
	const islands: string[] = [];
	for (
		const entry of walkSync('./features', {
			exts: ['.tsx', '.ts', '.jsx'],
			includeDirs: false,
		})
	) {
		// Only include files under an "islands" directory
		if (entry.path.includes('/islands/')) {
			islands.push(`./${entry.path}`);
		}
	}
	return islands;
}
