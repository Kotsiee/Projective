import AuthLayout from '@features/auth/islands/AuthLayout.tsx';
import { ComponentChildren } from 'preact';

export default function AuthLayoutWrapper({ children }: { children: ComponentChildren }) {
	return <AuthLayout>{children}</AuthLayout>;
}
