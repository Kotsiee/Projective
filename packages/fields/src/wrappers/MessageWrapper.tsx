import { Signal } from '@preact/signals';
import '../styles/wrappers/message-wrapper.css';

interface MessageWrapperProps {
	error?: string | Signal<string | undefined>;
	warning?: string | Signal<string | undefined>;
	info?: string | Signal<string | undefined>;
	hint?: string;
}

export function MessageWrapper(props: MessageWrapperProps) {
	const error = props.error instanceof Signal ? props.error.value : props.error;
	const warning = props.warning instanceof Signal ? props.warning.value : props.warning;
	const info = props.info instanceof Signal ? props.info.value : props.info;

	// Priority: Error > Warning > Info > Hint
	const message = error || warning || info || props.hint;
	const type = error ? 'error' : warning ? 'warning' : info ? 'info' : 'hint';

	if (!message) {
		return (
			<div
				className='field-message field-message--hidden'
				aria-hidden='true'
			/>
		);
	}

	const classes = [
		'field-message',
		`field-message--${type}`,
	].join(' ');

	return (
		<div className={classes} role={type === 'error' ? 'alert' : 'status'}>
			{message}
		</div>
	);
}
