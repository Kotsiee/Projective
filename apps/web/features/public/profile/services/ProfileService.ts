/**
 * @file ProfileService.ts
 * @description Frontend Service layer for Profile interactions.
 * Keeps Islands thin by handling all fetch logic and URL parameter serialization.
 */

import { ProfileData, ProfileTab } from '../contracts/Profile.ts';

export class ProfileService {
	static async getProfileCore(handle: string): Promise<ProfileData> {
		const res = await fetch(`/api/v1/public/profile/${encodeURIComponent(handle)}`);

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}));
			throw new Error(errorData.error?.message || `Failed to fetch profile: ${res.statusText}`);
		}

		return await res.json() as ProfileData;
	}

	static async getTabData<T = any>(
		handle: string,
		tab: ProfileTab,
		limit: number = 20,
		offset: number = 0,
	): Promise<{ items: T[]; meta: { totalCount: number } }> {
		const searchParams = new URLSearchParams({
			limit: limit.toString(),
			offset: offset.toString(),
		});

		const res = await fetch(
			`/api/v1/public/profile/${encodeURIComponent(handle)}/${
				encodeURIComponent(tab)
			}?${searchParams.toString()}`,
		);

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}));
			throw new Error(errorData.error?.message || `Failed to fetch tab data: ${res.statusText}`);
		}

		return await res.json();
	}
}
