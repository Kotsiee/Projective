import { Head } from 'fresh/runtime';
import VerifyIsland from '@islands/pages/auth/Verify.tsx';
import { State } from '@utils';
import { getCookies } from '@std/http/cookie';
import { RenderableProps } from 'preact';
import { PageProps } from 'fresh';

// deno-lint-ignore no-explicit-any
export default function Verify(ctx: RenderableProps<PageProps<never, State>, any>) {
	const cookies = getCookies(ctx.req.headers);
	const email = cookies['verify_email'] ? decodeURIComponent(cookies['verify_email']) : undefined;

	return (
		<>
			<Head>
				<title>Verify</title>
			</Head>

			<VerifyIsland email={email} />
		</>
	);
}
