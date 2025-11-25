import { Head } from 'fresh/runtime';
import RegisterIsland from '@islands/pages/auth/Register.tsx';

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
