import { define } from '@utils';
import NavBar from '@islands/NavBar.tsx';

export default define.layout(function App({ Component, state }) {
	return (
		<>
			<NavBar isAuthenticated={state.isOnboarded} />

			<div class='container'>
				<Component />
			</div>
		</>
	);
});
