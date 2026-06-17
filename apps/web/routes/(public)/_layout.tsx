import { define } from '@utils';
import { UserProvider } from '@features/navigation/contexts/UserContext.tsx';
import Navigation from '@features/navigation/islands/navigation.tsx';

export default define.layout(function App({ Component }) {
	return (
		<UserProvider>
			<Navigation>
				<Component />
			</Navigation>
		</UserProvider>
	);
});
