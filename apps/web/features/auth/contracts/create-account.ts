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
}
// #endregion
