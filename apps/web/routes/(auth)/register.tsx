import { Head } from 'fresh/runtime';
import RegisterIsland from '@features/auth/islands/Register.tsx';

export default function Login() {
	return (
		<>
			<Head>
				<title>Sign Up</title>
			</Head>

			<RegisterIsland />
		</>
	);
}
