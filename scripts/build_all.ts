// scripts/build_all.ts
import { join } from 'jsr:@std/path';

// 1. Read the root deno.json to get workspaces
const text = await Deno.readTextFile('deno.json');
const config = JSON.parse(text);
const workspaces = config.workspace || [];

console.log('📦 Building workspaces...');

// 2. Iterate through each workspace package
for (const path of workspaces) {
	try {
		// Check if the package has a deno.json
		const packageConfigPath = join(path, 'deno.json');
		const packageConfigText = await Deno.readTextFile(packageConfigPath);
		const packageConfig = JSON.parse(packageConfigText);

		// 3. If the package has a "build" task, run it
		if (packageConfig.tasks?.build) {
			console.log(`\nhammer_and_wrench Building ${path}...`);

			const command = new Deno.Command('deno', {
				args: ['task', 'build'],
				cwd: path,
				stdout: 'inherit',
				stderr: 'inherit',
			});

			const { code } = await command.output();

			if (code !== 0) {
				console.error(`❌ Failed to build ${path}`);
				Deno.exit(code);
			}
		} else {
			console.log(`\n⏭️  Skipping ${path} (no build task)`);
		}
	} catch (error) {
		// Ignore folder if no deno.json exists (or handle error)
		if (!(error instanceof Deno.errors.NotFound)) {
			console.error(`Error processing ${path}:`, error);
		}
	}
}

console.log('\n✅ All packages built successfully.');
