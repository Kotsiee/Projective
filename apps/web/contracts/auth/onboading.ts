export interface OnboardingRequest {
	firstName: string;
	lastName: string;
	username: string;
	dob: string;
	type: 'freelancer' | 'client';
}
