import { defineConfig } from 'npm:vite@7.2.2';
import { fresh } from '@fresh/plugin-vite';
import { fileURLToPath } from 'node:url';

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
	root: 'apps/web',
	plugins: [fresh()],
	resolve: {
		alias: {
			'@': r('./apps/web/'),
			'@styles': r('./apps/web/styles/'),
			'@components': r('./apps/web/components/'),
			'@features': r('./apps/web/features/'),
			'@islands': r('./apps/web/islands/'),
			'@server': r('./apps/web/server/'),
			'@services': r('./apps/web/services/'),
			'@types': r('./apps/web/types/'),
			'@utils': r('./apps/web/utils.ts'),

			'@projective/shared': r('./packages/shared/mod.ts'),
			'@projective/backend': r('./packages/backend/mod.ts'),
			'@projective/ui': r('./packages/ui/mod.ts'),
			'@projective/utils': r('./packages/utils/mod.ts'),
			'@projective/types': r('./packages/types/mod.ts'),
			'@projective/fields': r('./packages/fields/mod.ts'),
			'@projective/data': r('./packages/data/mod.ts'),
		},
	},

	build: {
		commonjsOptions: {
			include: [/packages\//, /node_modules/],
		},
	},
});
