import { walk } from 'https://deno.land/std@0.208.0/fs/walk.ts';
import { relative, resolve } from 'https://deno.land/std@0.208.0/path/mod.ts';

// --- CONFIGURATION ---

// 1. Define the specific folders you want to pack
const TARGET_PATHS = [
	'./packages/data',
	'./packages/fields',
	// './src/specific_file.ts' // You can also add specific files
];

// 2. The existing file to REPLACE (This will be overwritten)
const OUTPUT_FILE = 'codebase_context.md';

// 3. Filtering options
const IGNORE_DIRS = ['.git', 'node_modules', '_fresh', '.vscode', 'cov_profile', 'docs', 'tests'];
const IGNORE_FILES = [
	'.env',
	'deno.lock',
	'.DS_Store',
	'pack_project.ts',
	'README.md',
	'TextFile.tsx',
	'text-field.css',
	OUTPUT_FILE,
];
const INCLUDE_EXTS = ['.ts', '.tsx', '.js', '.jsx', '.sql', '.css', '.md', '.json', '.toml'];

// ---------------------

console.log('📦 Packing selected folders...');

// Initialize output (This string effectively replaces the file content)
let output = '# Selected Codebase Context\n\n';
output += `> Included paths: ${TARGET_PATHS.join(', ')}\n\n`;

// 1. Generate Tree Structure for Selected Paths
output += '## Project Tree (Selected)\n\n```text\n';

for (const target of TARGET_PATHS) {
	try {
		// specific check to see if target exists
		const stat = await Deno.stat(target);

		// If it's a directory, walk it
		if (stat.isDirectory) {
			output += `${target}/\n`; // Print the root folder name
			for await (
				const entry of walk(target, {
					skip: [new RegExp(IGNORE_DIRS.join('|'))],
					maxDepth: 4,
				})
			) {
				if (entry.path === target) continue; // Skip the root folder itself (already printed)
				if (entry.name.startsWith('.')) continue;

				// Calculate depth relative to the target folder for pretty indentation
				const rel = relative(target, entry.path);
				const depth = rel.split('/').length;
				const indent = '  '.repeat(depth);

				output += `${indent}${entry.name}${entry.isDirectory ? '/' : ''}\n`;
			}
		} else {
			// It's just a file
			output += `${target}\n`;
		}
	} catch (error) {
		console.warn(`⚠️ Warning: Could not process path "${target}". It may not exist.`);
	}
}
output += '```\n\n';

// 2. Add File Contents
output += '## File Contents\n\n';

for (const target of TARGET_PATHS) {
	try {
		const stat = await Deno.stat(target);

		// If directory, walk it. If file, process strictly that file.
		const iterator = stat.isDirectory
			? walk(target, { skip: [new RegExp(IGNORE_DIRS.join('|'))], includeDirs: false })
			: [{
				path: target,
				name: target.split('/').pop() || '',
				isDirectory: false,
				isFile: true,
				isSymlink: false,
			}];

		// @ts-ignore - Deno walk returns async iterator, manual array is sync, but loop handles both
		for await (const entry of iterator) {
			// For files inside directories, check ignores
			if (IGNORE_FILES.includes(entry.name)) continue;

			// Check extension
			const ext = entry.name.substring(entry.name.lastIndexOf('.'));
			if (!INCLUDE_EXTS.includes(ext)) continue;

			// Get path relative to project root for clarity in the output file
			const relPath = relative('.', entry.path);

			console.log(`Reading: ${relPath}`);

			try {
				const content = await Deno.readTextFile(entry.path);
				output += `### File: ${relPath}\n\n`;
				output += '```' + ext.replace('.', '') + '\n';
				output += content;
				output += '\n```\n\n';
			} catch (err) {
				console.error(`Error reading ${relPath}:`, err);
			}
		}
	} catch (err) {
		// Already logged warning in tree step
	}
}

// Write (Overwrite) the file
await Deno.writeTextFile(OUTPUT_FILE, output);
console.log(`✅ Done! Content replaced in: ${OUTPUT_FILE}`);
