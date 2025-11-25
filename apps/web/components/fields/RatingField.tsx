import { InputHTMLAttributes } from 'preact';
import '@styles/components/fields/TextField.css';

export default function TextField(
	props: InputHTMLAttributes<HTMLInputElement> & { error?: string | null; field?: string | null },
) {
	return (
		<div class='text-field__container'>
			{props.field && <p>{props.field}</p>}
			<span class='text-field'>
				<input type='text' {...props} />
			</span>
			<small>{props.error}</small>
		</div>
	);
}
