export interface SwitchProfileRequest {
	profileId: string;
	type: 'freelancer' | 'business';
}

export interface SwitchTeamRequest {
	teamId: string;
}

export interface ContextSwitchResult {
	success: boolean;
	newContext: {
		type: 'personal' | 'business' | 'team';
		id: string;
	};
}
