import { Head } from 'fresh/runtime';
import LoginIslandWrapper from './(_islands)/LoginIslandWrapper.tsx';

export default function Login() {
	return (
		<>
			<Head>
				<title>Login</title>
			</Head>

			<LoginIslandWrapper />
		</>
	);
}
