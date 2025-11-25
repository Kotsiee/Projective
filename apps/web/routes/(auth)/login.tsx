import { Head } from 'fresh/runtime';
import LoginIsland from '@islands/pages/auth/Login.tsx';

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
