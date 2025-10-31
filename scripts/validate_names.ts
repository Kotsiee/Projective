// scripts/validate_names.ts
// Adds support for special route files that start with "_" (e.g. _app, _layout, _middleware, _404)

const kebab = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const pascal = /^[A-Z][A-Za-z0-9]*$/;

function isDynamicSegment(name: string) {
	return /^\[.+\]$/.test(name);
}

function isSpecialRouteBase(base: string) {
	if (!base.startsWith('_')) return false;
	const rest = base.slice(1);

	// Allow numeric error pages like _404, _500
	if (/^\d+$/.test(rest)) return true;

	// Common special names (Fresh/Next-style)
	const specials = new Set([
		'app',
		'layout',
		'middleware',
		'document',
		'error',
		'404',
		'500',
	]);
	if (specials.has(rest)) return true;

	// Or allow "_<kebab-case>" generally (e.g., _app-shell)
	if (kebab.test(rest)) return true;

	return false;
}

function norm(p: string) {
	return p.replaceAll('\\', '/');
}

async function* walk(dir: string): AsyncGenerator<string> {
	try {
		for await (const entry of Deno.readDir(dir)) {
			const p = `${dir}/${entry.name}`;
			if (entry.isDirectory) yield* walk(p);
			else yield p;
		}
	} catch {
		// ignore missing dirs
	}
}

function pathHasSegment(p: string, segment: 'routes' | 'islands' | 'components'): boolean {
	const parts = norm(p).split('/');
	return parts.includes(segment);
}

function nearestSegmentRoot(p: string, segment: 'routes' | 'islands' | 'components'): string {
	const parts = norm(p).split('/');
	const idx = parts.lastIndexOf(segment);
	return idx >= 0 ? parts.slice(0, idx + 1).join('/') : segment;
}

function checkRoutesPath(filePath: string): string[] {
	const errors: string[] = [];
	const normalized = norm(filePath);
	const root = nearestSegmentRoot(normalized, 'routes');
	const rel = normalized.slice(root.length + 1); // part under routes/

	const parts = rel.split('/');

	// Validate route directories (not filenames)
	for (let i = 0; i < parts.length - 1; i++) {
		const seg = parts[i];
		if (isDynamicSegment(seg)) continue; // allow [id], [...all]
		if (/\s/.test(seg)) errors.push(`folder "${seg}" must not contain spaces`);
		if (/[A-Z]/.test(seg)) errors.push(`folder "${seg}" must not contain uppercase`);
		if (!kebab.test(seg)) errors.push(`folder "${seg}" must be kebab-case or [dynamic]`);
	}

	// Validate filename
	const file = parts[parts.length - 1];
	const extMatch = file.match(/\.(tsx|ts|jsx|js)$/);
	if (!extMatch) return errors; // only care about code files

	const base = file.replace(/\.(tsx|ts|jsx|js)$/, '');
	if (
		base === 'index' ||
		isDynamicSegment(base) ||
		isSpecialRouteBase(base) // <-- NEW: allow _app, _layout, _404, or _<kebab>
	) {
		return errors;
	}

	if (/\s/.test(base)) errors.push(`file "${file}" must not contain spaces`);
	if (/[A-Z]/.test(base)) errors.push(`file "${file}" must not contain uppercase`);
	if (!kebab.test(base)) {
		errors.push(`file "${file}" must be kebab-case (or [dynamic]/index/_special)`);
	}

	return errors.map((e) => `routes: ${e} -> ${normalized}`);
}

function checkPascalDir(filePath: string, segment: 'islands' | 'components'): string[] {
	const errors: string[] = [];
	const normalized = norm(filePath);
	if (!/\.tsx$/.test(normalized)) return errors; // only enforce for TSX components

	const file = normalized.split('/').pop()!;
	const base = file.replace(/\.tsx$/, '');
	if (!pascal.test(base)) {
		errors.push(`${segment}: "${file}" must be PascalCase.tsx -> ${normalized}`);
	}
	return errors;
}

async function run() {
	const violations: string[] = [];
	for await (const file of walk('.')) {
		const p = norm(file);

		// Skip obvious non-source areas
		if (
			p.includes('/node_modules/') ||
			p.includes('/dist/') ||
			p.includes('/tmp/') ||
			p.includes('/infra/') ||
			p.includes('/supabase/')
		) continue;

		if (pathHasSegment(p, 'routes')) violations.push(...checkRoutesPath(p));
		if (pathHasSegment(p, 'islands')) violations.push(...checkPascalDir(p, 'islands'));
		if (pathHasSegment(p, 'components')) violations.push(...checkPascalDir(p, 'components'));
	}

	if (violations.length) {
		console.error('\n❌ Naming violations (' + violations.length + '):');
		for (const v of violations) console.error(' - ' + v);
		Deno.exit(1);
	} else {
		console.log('✅ Naming conventions OK');
	}
}

await run();
