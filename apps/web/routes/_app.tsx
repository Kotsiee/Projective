/**
 * @file _app.tsx
 * @description Main framework root template mapping global layouts and rendering injection boundaries.
 */

// #region Imports
import { Head } from 'fresh/runtime';
import { State } from '@utils';
import Providers from './(_islands)/Providers.tsx';
// #endregion

// #region App Container
export default function App(
	ctx: { Component: preact.ComponentType; stateTheme?: 'light' | 'dark'; state: State },
) {
	const initial = ctx.stateTheme ?? 'dark';

	return (
		<html lang='en' data-theme={initial}>
			<Head>
				<meta charSet='utf-8' />
				<meta name='viewport' content='width=device-width, initial-scale=1' />
				<meta
					name='description'
					content='Collaborative freelancing platform.'
				/>
				<title>Projective</title>
				<link
					href='https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css'
					rel='stylesheet'
				/>
			</Head>
			<body>
				<main>
					<Providers>
						<ctx.Component />
					</Providers>
				</main>
			</body>
		</html>
	);
}
// #endregion
