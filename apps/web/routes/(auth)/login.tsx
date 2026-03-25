import { Head } from 'fresh/runtime';
import LoginIsland from '@features/auth/islands/Login.tsx';

export default function Login() {
	return (
		<>
			<Head>
				<title>Login</title>
			</Head>

			<LoginIsland />
		</>
	);
}
