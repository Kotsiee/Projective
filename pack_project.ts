import { walk } from 'https://deno.land/std@0.208.0/fs/walk.ts';
import { relative } from 'https://deno.land/std@0.208.0/path/mod.ts';

// Config: Add files/folders to ignore
const IGNORE_DIRS = ['.git', 'node_modules', '_fresh', '.vscode', 'cov_profile', 'docs', 'tests'];
const IGNORE_FILES = ['.env', 'deno.lock', '.DS_Store', 'pack_project.ts', 'README.md'];
const INCLUDE_EXTS = ['.ts', '.tsx', '.js', '.jsx', '.sql', '.css', '.md', '.json', '.toml'];

// Output file name
const OUTPUT_FILE = 'codebase_context.md';

console.log('📦 Packing project...');

let output = '# Project Codebase Context\n\n';

// 1. Generate Tree Structure
output += '## Project Tree\n\n```text\n';
for await (
	const entry of walk('.', {
		skip: [new RegExp(IGNORE_DIRS.join('|'))],
		maxDepth: 4,
	})
) {
	if (entry.name.startsWith('.')) continue; // Skip hidden files in tree
	const depth = entry.path.split('/').length - 1;
	const indent = '  '.repeat(depth);
	output += `${indent}${entry.name}${entry.isDirectory ? '/' : ''}\n`;
}
output += '```\n\n';

// 2. Add File Contents
output += '## File Contents\n\n';

for await (
	const entry of walk('.', {
		skip: [new RegExp(IGNORE_DIRS.join('|'))],
		includeDirs: false,
	})
) {
	const relPath = relative('.', entry.path);

	// Skip ignored files
	if (IGNORE_FILES.includes(entry.name)) continue;

	// Check extension
	const ext = entry.name.substring(entry.name.lastIndexOf('.'));
	if (!INCLUDE_EXTS.includes(ext)) continue;

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

await Deno.writeTextFile(OUTPUT_FILE, output);
console.log(`✅ Done! Project packed into: ${OUTPUT_FILE}`);
