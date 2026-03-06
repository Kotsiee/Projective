import { walk } from 'https://deno.land/std@0.208.0/fs/walk.ts';
import { relative } from 'https://deno.land/std@0.208.0/path/mod.ts';

// --- CONFIGURATION ---

// 1. Define the specific folders you want to pack
const TARGET_PATHS = [
	'./packages/data',
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

// ❗ NEW: Ignore files by extension (always excluded)
const IGNORE_EXTS = ['.snap', '.log'];

// Only these extensions are allowed through
const INCLUDE_EXTS = ['.ts', '.tsx', '.js', '.jsx', '.sql', '.md', '.json', '.toml'];

// ---------------------

const getExt = (filename: string): string => {
	const idx = filename.lastIndexOf('.');
	return idx === -1 ? '' : filename.slice(idx);
};

// Initialize output
let output = '# Selected Codebase Context\n\n';
output += `> Included paths: ${TARGET_PATHS.join(', ')}\n\n`;

// 1. Generate Tree Structure
output += '## Project Tree (Selected)\n\n```text\n';

for (const target of TARGET_PATHS) {
	try {
		const stat = await Deno.stat(target);

		if (stat.isDirectory) {
			output += `${target}/\n`;

			for await (
				const entry of walk(target, {
					skip: [new RegExp(IGNORE_DIRS.join('|'))],
					maxDepth: 4,
				})
			) {
				if (entry.path === target) continue;
				if (entry.name.startsWith('.')) continue;
				if (!entry.isDirectory) {
					const ext = getExt(entry.name);
					if (IGNORE_EXTS.includes(ext)) continue;
					if (!INCLUDE_EXTS.includes(ext)) continue;
				}

				const rel = relative(target, entry.path);
				const depth = rel.split('/').length;
				const indent = '  '.repeat(depth);

				output += `${indent}${entry.name}${entry.isDirectory ? '/' : ''}\n`;
			}
		} else {
			output += `${target}\n`;
		}
	} catch {
		console.warn(`⚠️ Warning: Could not process path "${target}".`);
	}
}

output += '```\n\n';

// 2. Add File Contents
output += '## File Contents\n\n';

for (const target of TARGET_PATHS) {
	try {
		const stat = await Deno.stat(target);

		const iterator = stat.isDirectory
			? walk(target, {
				skip: [new RegExp(IGNORE_DIRS.join('|'))],
				includeDirs: false,
			})
			: [{
				path: target,
				name: target.split('/').pop() || '',
				isDirectory: false,
				isFile: true,
				isSymlink: false,
			}];

		// @ts-ignore async/sync iterator compatibility
		for await (const entry of iterator) {
			if (IGNORE_FILES.includes(entry.name)) continue;

			const ext = getExt(entry.name);
			if (IGNORE_EXTS.includes(ext)) continue;
			if (!INCLUDE_EXTS.includes(ext)) continue;

			const relPath = relative('.', entry.path);

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
	} catch {
		// already handled
	}
}

// Write output
await Deno.writeTextFile(OUTPUT_FILE, output);
