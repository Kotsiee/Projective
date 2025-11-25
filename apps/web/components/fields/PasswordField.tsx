import { InputHTMLAttributes } from 'preact';
import '@styles/components/fields/TextField.css';
import { IconEye, IconEyeClosed } from '@tabler/icons-preact';
import { signal } from '@preact/signals';

const type = signal<boolean>(true);

export default function PasswordField(props: InputHTMLAttributes<HTMLInputElement>) {
	const toggleVisibility = () => {
		type.value = !type.value;
	};

	return (
		<span class='password-field'>
			<input type={type.value ? 'password' : 'text'} {...props} />
			<button
				type='button'
				onClick={toggleVisibility}
				class='password-field__toggle-visibility'
			>
				{type.value ? <IconEyeClosed /> : <IconEye />}
			</button>
		</span>
	);
}
