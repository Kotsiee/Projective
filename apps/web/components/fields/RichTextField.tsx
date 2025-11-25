import { InputHTMLAttributes } from 'preact';
import '@styles/components/fields/TextField.css';

export default function TextField(
	props: InputHTMLAttributes<HTMLInputElement> & { error?: string | null },
) {
	return (
		<div class='text-field__container'>
			<small>{props.error}</small>
			<span class='text-field'>
				<input type='text' {...props} />
			</span>
		</div>
	);
}
