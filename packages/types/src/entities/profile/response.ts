import { Identifiable, ProfileType, Ratable, Timestamped } from '../../core/base-response.ts';

export interface ProfileStatsResponse {
	rating_as_freelancer: number;
	reviews_as_freelancer: number;
	rating_as_client: number;
	reviews_as_client: number;
	active_projects: number;
	total_projects: number;
	service_count: number;
	product_count: number;
}

export interface FullProfileResponse extends Identifiable, Timestamped {
	entity_type: ProfileType;
	handle: string;
	name: string;
	headline: string;
	bio: string | null;
	avatar_url: string | null;
	banner_url: string | null;
	country: string | null;
	timezone: string | null;
	languages: string[];
	skills: string[];
	stats: ProfileStatsResponse;
	is_freelancer: boolean;
	hourly_rate_cents?: number;
	availability_status?: 'available' | 'busy' | 'unavailable';
}
