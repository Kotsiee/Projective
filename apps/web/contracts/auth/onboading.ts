export interface OnboardingRequest {
	firstName: string;
	lastName: string;
	username: string;
	type: 'freelancer' | 'client';
}
