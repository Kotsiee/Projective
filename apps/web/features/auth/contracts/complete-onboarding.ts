/**
 * @file complete-onboarding.ts
 * @description Data contract for finishing onboarding as an ALREADY-authenticated
 * user (e.g. a first-time OAuth sign-up landing on /join). Unlike
 * {@link CreateAccountRequest} there are no email/password fields — the session
 * already exists; this only provisions the profile via public.complete_onboarding.
 */

// #region Interfaces
export interface CompleteOnboardingRequest {
	firstName?: string;
	lastName?: string;
	username?: string;
	/** ISO string format for database compatibility. */
	dob?: string;
	objective?: 'client' | 'seller';
	skills?: string[];
	interests?: string[];
	/** files.items id of an uploaded avatar (optional). */
	avatarFileId?: string;
}
// #endregion
