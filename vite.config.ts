import { defineConfig } from 'npm:vite@7.2.2';
import { fresh } from '@fresh/plugin-vite';
import { walkSync } from 'jsr:@std/fs/walk';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import process from 'node:process';

// #region Helper Functions
const ROOT = process.cwd();

/**
 * Dynamically discovers all Island components within the features directory.
 * Formats discovered paths as explicit file:// URLs so the Deno module loader
 * can resolve them correctly without looking for them in the import map.
 *
 * @returns {string[]} An array of file:// URL strings for island components.
 */
function discoverFeatureIslands(): string[] {
	const islands: string[] = [];
	const featuresPath = path.resolve(ROOT, 'apps/web/features');

	try {
		for (
			const entry of walkSync(featuresPath, {
				exts: ['.tsx', '.ts', '.jsx'],
				includeDirs: false,
			})
		) {
			if (entry.path.includes('/islands/') || entry.path.includes('\\islands\\')) {
				// Convert absolute system path (POSIX or Windows) into a file:/// URL
				const fileUrl = pathToFileURL(entry.path).href;
				islands.push(fileUrl);
			}
		}
	} catch (error) {
		console.warn('⚠️ Could not walk features directory for islands:', error);
	}

	return islands;
}
// #endregion

// #region Vite Configuration
export default defineConfig({
	root: 'apps/web',

	plugins: [
		fresh({
			islandSpecifiers: [
				...discoverFeatureIslands(),
			],
		}),
	],

	server: {
		fs: {
			allow: [ROOT],
		},
		watch: {
			ignored: [
				'**/coverage/**',
				'**/dist/**',
				'**/.git/**',
			],
		},
	},

	resolve: {
		alias: {
			'@': path.resolve(ROOT, 'apps/web/'),
			'@styles': path.resolve(ROOT, 'apps/web/styles/'),
			'@components': path.resolve(ROOT, 'apps/web/components/'),
			'@features': path.resolve(ROOT, 'apps/web/features/'),
			'@islands': path.resolve(ROOT, 'apps/web/islands/'),
			'@server': path.resolve(ROOT, 'apps/web/server/'),
			'@services': path.resolve(ROOT, 'apps/web/services/'),
			'@types': path.resolve(ROOT, 'apps/web/types/'),
			'@utils': path.resolve(ROOT, 'apps/web/utils.ts'),

			'@projective/backend': path.resolve(ROOT, 'packages/backend/mod.ts'),
			'@projective/ui/skeletons': path.resolve(ROOT, 'packages/ui/skeletons.ts'),
			'@projective/ui/system': path.resolve(ROOT, 'packages/ui/system.ts'),
			'@projective/ui/atoms': path.resolve(ROOT, 'packages/ui/atoms.ts'),
			'@projective/ui/fields': path.resolve(ROOT, 'packages/ui/fields.ts'),
			'@projective/ui/charts/finance': path.resolve(ROOT, 'packages/ui/charts-finance.ts'),
			'@projective/ui/charts': path.resolve(ROOT, 'packages/ui/charts.ts'),
			'@projective/ui/data': path.resolve(ROOT, 'packages/ui/data.ts'),
			'@projective/ui/time': path.resolve(ROOT, 'packages/ui/time.ts'),
			'@projective/ui/files': path.resolve(ROOT, 'packages/ui/files.ts'),
			'@projective/ui/utils': path.resolve(ROOT, 'packages/ui/utils.ts'),
			'@projective/ui/types': path.resolve(ROOT, 'packages/ui/types.ts'),
			'@projective/ui': path.resolve(ROOT, 'packages/ui/mod.ts'),
			'@projective/utils': path.resolve(ROOT, 'packages/utils/mod.ts'),
			'@projective/types': path.resolve(ROOT, 'packages/types/mod.ts'),
			'@projective/fields': path.resolve(ROOT, 'packages/fields/mod.ts'),
			'@projective/data': path.resolve(ROOT, 'packages/data/mod.ts'),
			'@projective/charts/finance': path.resolve(ROOT, 'packages/charts/finance.ts'),
			'@projective/charts': path.resolve(ROOT, 'packages/charts/mod.ts'),
			'@projective/files': path.resolve(ROOT, 'packages/files/mod.ts'),
			'@projective/time': path.resolve(ROOT, 'packages/time/mod.ts'),
		},
	},

	optimizeDeps: {
		exclude: [
			'@projective/ui',
			'@projective/ui/atoms',
			'@projective/ui/fields',
			'@projective/ui/charts',
			'@projective/ui/data',
			'@projective/ui/time',
			'@projective/ui/files',
			'@projective/ui/utils',
			'@projective/ui/types',
			'@projective/ui/system',
			'@projective/fields',
			'@projective/utils',
			'@projective/types',
			'@projective/data',
			'@projective/charts',
			'@projective/files',
			'@projective/time',
		],
	},

	ssr: {
		noExternal: true,
	},

	build: {
		sourcemap: false,
		commonjsOptions: {
			include: [/packages\//, /node_modules/],
		},
		rollupOptions: {
			external: [/node:/, 'node:process'],
		},
	},
});
// #endregion
