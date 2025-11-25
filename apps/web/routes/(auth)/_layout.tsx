import { define } from '@utils';
import AuthLayout from '@islands/pages/auth/authLayout.tsx';

export default define.layout(function App(props) {
	const { Component } = props;

	return (
		<AuthLayout>
			<Component />
		</AuthLayout>
	);
});
