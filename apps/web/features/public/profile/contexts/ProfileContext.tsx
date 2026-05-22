// #region Imports
import { createContext } from 'preact';
import { useContext, useEffect } from 'preact/hooks';
import { computed, Signal, useSignal } from '@preact/signals';
import { ProfileData, ProfileTab } from '../contracts/Profile.ts';
import { ProfileService } from '../services/ProfileService.ts';
import { ProfileType } from 'packages/types/src/core/base-response.ts';
import { useUserContext } from '@features/shared/contexts/UserContext.tsx';
// #endregion

// #region Context Interface
export interface ProfileContextState {
	entityId: Signal<string>;
	entityType: Signal<ProfileType>;
	data: Signal<ProfileData | null>;
	isLoading: Signal<boolean>;
	isError: Signal<boolean>;

	isOwnerOrAdmin: Signal<boolean>;
	activeTab: Signal<ProfileTab>;
	isBodyTwoVisible: Signal<boolean>;

	// Actions
	setTab: (tab: ProfileTab) => void;
	updateData: (partialData: Partial<ProfileData>) => void;
}
// #endregion

// #region Context Setup
const ProfileContext = createContext<ProfileContextState | null>(null);

export function useProfileContext() {
	const context = useContext(ProfileContext);
	if (!context) {
		throw new Error('useProfileContext must be used within a ProfileProvider');
	}
	return context;
}
// #endregion

// #region Provider Component
export interface ProfileProviderProps {
	children: preact.ComponentChildren;
	initialId: string;
	initialType: ProfileType;
	defaultTab?: ProfileTab;
}

export function ProfileProvider({
	children,
	initialId,
	initialType,
	defaultTab = 'portfolio',
}: ProfileProviderProps) {
	// Global User State
	const { user } = useUserContext();

	// Initialize Signals
	const entityId = useSignal(initialId);
	const entityType = useSignal(initialType);
	const data = useSignal<ProfileData | null>(null);
	const isLoading = useSignal(true);
	const isError = useSignal(false);

	const activeTab = useSignal<ProfileTab>(defaultTab);
	const isBodyTwoVisible = useSignal(false);

	// #region Derived State: Ownership & Permissions
	/**
	 * Computes ownership reactively.
	 * 1. Checks backend RBAC `viewerPermissions` (strongest, handles Team/Business roles).
	 * 2. Falls back to frontend `UserContext` 1:1 matching (handles public endpoints stripping auth).
	 */
	const isOwnerOrAdmin = computed(() => {
		if (!data.value) return false;

		// Check 1: Backend explicit permission
		if (data.value.viewerPermissions?.includes('manage_profile')) {
			return true;
		}

		// Check 2: Frontend session fallback
		if (user.value) {
			const { id, activeProfileId } = user.value;
			const profileId = data.value.id;

			// If viewing a personal or freelancer profile, verify underlying user ID
			if (data.value.type === 'user' || data.value.type === 'freelancer') {
				if (id === profileId) return true;
			}

			// If viewing an entity that matches their current active workspace context
			if (activeProfileId === profileId) {
				return true;
			}
		}

		return false;
	});
	// #endregion

	// #region Lifecycle: Fetch Core Data
	useEffect(() => {
		let isMounted = true;
		isLoading.value = true;
		isError.value = false;

		ProfileService.getProfileCore(entityId.value)
			.then((profileData) => {
				if (!isMounted) return;

				data.value = profileData;
				entityType.value = profileData.type;
				isLoading.value = false;
			})
			.catch((err) => {
				if (!isMounted) return;
				console.error('[ProfileContext] Failed to load profile:', err);
				isError.value = true;
				isLoading.value = false;
			});

		return () => {
			isMounted = false;
		};
	}, [entityId.value]);
	// #endregion

	// #region Handlers
	const setTab = (tab: ProfileTab) => {
		if (activeTab.value === tab) return;
		activeTab.value = tab;
	};

	const updateData = (partialData: Partial<ProfileData>) => {
		if (!data.value) return;
		data.value = { ...data.value, ...partialData };
	};
	// #endregion

	const state: ProfileContextState = {
		entityId,
		entityType,
		data,
		isLoading,
		isError,
		isOwnerOrAdmin,
		activeTab,
		isBodyTwoVisible,
		setTab,
		updateData,
	};

	return (
		<ProfileContext.Provider value={state}>
			{children}
		</ProfileContext.Provider>
	);
}
// #endregion
