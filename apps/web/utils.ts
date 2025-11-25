// apps/web/utils/index.ts
import { createDefine } from 'fresh';

// Per-request state (you can mutate its fields)
export interface State {
	shared?: string;

	// Auth middleware flags
	refreshedTokens?: { access: string; refresh: string } | null;
	clearAuth?: boolean;
	isAuthenticated?: boolean;
	isOnboarded?: boolean;
}

export const define = createDefine<State>();
