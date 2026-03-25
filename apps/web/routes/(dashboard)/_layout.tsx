import { define } from '@utils';
import NavBar from '@features/shared/islands/NavBar.tsx';
import { UserProvider } from '@features/shared/contexts/UserContext.tsx';

export default define.layout(function App({ Component, state }) {
	return (
		<UserProvider>
			<NavBar isAuthenticated={state.isOnboarded} />

			<div class='container'>
				<Component />
			</div>
		</UserProvider>
	);
});
