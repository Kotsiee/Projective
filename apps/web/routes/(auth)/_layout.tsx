import { define } from '@utils';

// We don't use AuthLayoutWrapper here because Login and Register
// need to pass different graphics into the left pane.
export default define.layout(function AuthLayoutBase(props) {
	const { Component } = props;
	return <Component />;
});
