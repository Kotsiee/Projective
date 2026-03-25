import { define } from '@utils';
import AuthLayoutWrapper from './(_islands)/AuthLayoutWrapper.tsx';

export default define.layout(function App(props) {
	const { Component } = props;

	return (
		<AuthLayoutWrapper>
			<Component />
		</AuthLayoutWrapper>
	);
});
