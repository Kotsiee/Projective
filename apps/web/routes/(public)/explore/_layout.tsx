import { define } from '@utils';

export default define.layout(function App({ Component, url }) {
	return (
		<div class='page'>
			<Component />
		</div>
	);
});
