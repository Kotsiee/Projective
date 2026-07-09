/**
 * @file create-account.ts
 * @description Defines the data contracts for the unified account creation and onboarding flow.
 */

// #region Interfaces
export interface CreateAccountRequest {
	email?: string;
	password?: string;
	firstName?: string;
	lastName?: string;
	username?: string;
	/**
	 * ISO string format for database compatibility
	 */
	dob?: string;
	objective?: 'client' | 'seller';
	skills?: string[];
	interests?: string[];
	/**
	 * Same-origin path to return to after verification completes (the page the
	 * visitor was on when they hit "Join"). Validated server-side against open
	 * redirects; falls back to /dashboard.
	 */
	redirectTo?: string;
}
// #endregion
