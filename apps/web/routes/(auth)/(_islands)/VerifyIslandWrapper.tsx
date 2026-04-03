import VerifyIsland from '@features/auth/islands/Verify.tsx';

export default function VerifyIslandWrapper({ email }: { email?: string }) {
	return <VerifyIsland email={email} />;
}
