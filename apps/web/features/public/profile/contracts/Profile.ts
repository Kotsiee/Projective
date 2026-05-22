import { ProfileType } from 'packages/types/src/core/base-response.ts';

export type ProfileTab =
	| 'services'
	| 'projects'
	| 'members'
	| 'reviews'
	| 'products'
	| 'teams'
	| 'portfolio'
	| 'businesses';

export type ConnectionStatus = 'none' | 'pending' | 'connected';

export interface ProfileStats {
	ratingAsFreelancer?: number;
	reviewsAsFreelancer?: number;
	ratingAsClient?: number;
	reviewsAsClient?: number;
	activeProjects: number;
	totalProjects: number;
	serviceCount: number;
	productCount: number;
	portfolioCount: number;
	teamCount: number;
	businessCount: number;
	memberCount: number;
}

export interface ProfileLogistics {
	isOnline: boolean;
	location: string;
	languages: string[];
	timezone: string;
	availabilitySummary?: string;
	averageResponseTime?: string;
	hasSchedule?: boolean;
}

export interface VerifiedClient {
	id: string;
	name: string;
	logoUrl?: string;
}

export interface ProfileData {
	id: string;
	type: ProfileType;
	handle: string;
	name: string;
	avatarUrl?: string | null;
	bannerUrl?: string | null;
	headline: string;
	bio: string;
	skills: string[];

	stats: ProfileStats;
	logistics: ProfileLogistics;
	clients: VerifiedClient[];

	viewerConnectionStatus: ConnectionStatus;
	viewerPermissions: string[];
	tabData?: any[];
}
