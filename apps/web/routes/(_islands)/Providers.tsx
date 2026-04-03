import { ToastProvider } from '@projective/ui';
import { UserProvider } from '@features/shared/contexts/UserContext.tsx';

export default function Providers({ children }: { children: any }) {
	return (
		<UserProvider>
			<ToastProvider position='bottom-right' />
			{children}
		</UserProvider>
	);
}
