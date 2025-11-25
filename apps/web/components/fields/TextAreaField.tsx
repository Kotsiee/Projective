import { InputHTMLAttributes } from 'preact';
import '@styles/components/fields/TextField.css';

export default function TextAreaField(
	props: InputHTMLAttributes<HTMLTextAreaElement> & {
		error?: string | null;
		field?: string | null;
	},
) {
	return (
		<div class='text-field__container'>
			{props.field && <p>{props.field}</p>}
			<span class='text-area-field'>
				<textarea {...props} />
			</span>
			<small>{props.error}</small>
		</div>
	);
}
