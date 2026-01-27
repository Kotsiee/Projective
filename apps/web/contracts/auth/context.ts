export interface SwitchTeamRequest {
	teamId: string;
}

export interface SwitchProfileRequest {
	profileId: string;
	type: 'freelancer' | 'business';
}
