import { createContext } from 'preact';
import { useContext, useEffect } from 'preact/hooks';
import { computed, Signal, useSignal } from '@preact/signals';
import { ComponentChildren } from 'preact';
import { getCsrfToken } from '@projective/shared';

export interface UserProfile {
	id: string;
	displayName: string | null;
	username: string | null;
	avatarUrl: string | null;
	activeProfileType: 'freelancer' | 'business' | null;
	activeProfileId: string | null;
	activeTeamId: string | null;
}

export interface UserState {
	user: Signal<UserProfile | null>;
	isAuthenticated: Signal<boolean>;
	isLoading: Signal<boolean>;
	error: Signal<string | null>;
	refresh: () => Promise<void>;
	logout: () => Promise<void>;
	switchTeam: (teamId: string) => Promise<boolean>;
}

const UserContext = createContext<UserState | null>(null);

export function UserProvider({ children }: { children: ComponentChildren }) {
	const user = useSignal<UserProfile | null>(null);
	const isLoading = useSignal(true);
	const error = useSignal<string | null>(null);

	const isAuthenticated = computed(() => !!user.value);

	const fetchUser = async () => {
		isLoading.value = true;
		error.value = null;

		try {
			const res = await fetch('/api/v1/auth/me');

			if (res.status === 401) {
				user.value = null;
			} else if (!res.ok) {
				throw new Error(`Error ${res.status}`);
			} else {
				const data = await res.json();
				user.value = data.user;
			}
			// deno-lint-ignore no-explicit-any
		} catch (err: any) {
			console.error('User Fetch Error:', err);
			error.value = err.message;
			user.value = null;
		} finally {
			isLoading.value = false;
		}
	};

	const logout = async () => {
		try {
			await fetch('/api/v1/auth/logout', { method: 'POST' });
			user.value = null;
			globalThis.location.href = '/login';
		} catch (err) {
			console.error('Logout failed', err);
		}
	};

	const switchTeam = async (teamId: string): Promise<boolean> => {
		try {
			const csrf = getCsrfToken();

			if (!csrf) return false;
			const res = await fetch('/api/v1/auth/switch-team', {
				method: 'POST',
				body: JSON.stringify({ teamId }),
				headers: { 'Content-Type': 'application/json', 'X-CSRF': csrf },
			});

			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.error?.message || 'Failed to switch team');
			}

			// Refresh profile to update activeTeamId
			await fetchUser();
			return true;
		} catch (err) {
			console.error('Switch Team Error:', err);
			return false;
		}
	};

	useEffect(() => {
		fetchUser();
	}, []);

	return (
		<UserContext.Provider
			value={{
				user,
				isAuthenticated,
				isLoading,
				error,
				refresh: fetchUser,
				logout,
				switchTeam,
			}}
		>
			{children}
		</UserContext.Provider>
	);
}

export function useUserContext() {
	const ctx = useContext(UserContext);
	if (!ctx) {
		throw new Error('useUserContext must be used within UserProvider');
	}
	return ctx;
}
