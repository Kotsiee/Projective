import { Head } from 'fresh/runtime';
import { State } from '@utils';

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
			<body data-onboarded={ctx.state.isOnboarded}>
				<main>
					<ctx.Component />
				</main>
			</body>
		</html>
	);
}
