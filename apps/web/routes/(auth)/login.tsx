import { Head } from 'fresh/runtime';
import LoginIsland from '@features/auth/islands/Login.island.tsx';

export default function Login() {
	return (
		<>
			<Head>
				<title>Login Projective</title>
			</Head>
			<LoginIsland />
		</>
	);
}
