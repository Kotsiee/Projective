import { Head } from 'fresh/runtime';
import RegisterIslandWrapper from './(_islands)/RegisterIslandWrapper.tsx';

export default function Login() {
	return (
		<>
			<Head>
				<title>Sign Up</title>
			</Head>

			<RegisterIslandWrapper />
		</>
	);
}
