import { defineConfig } from 'vite';
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
			'packages': r('./packages'),
		},
	},
});
