import { define } from '@utils';
import { ExploreProvider } from '../../../features/explore/contexts/ExploreContext.tsx';

export default define.layout(function App({ Component, url }) {
	return (
		<div class='page'>
			<Component />
		</div>
	);
});
