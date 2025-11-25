export interface RegisterWithEmailRequest {
	email: string;
	password: string;
}

export interface RegisterWithEmailResponse {
	data: {
		user: {
			id: string;
			aud: string;
			role: string;
			email: string;
			email_confirmed_at: string;
			phone: string;
			last_sign_in_at: string;
			app_metadata: {
				provider: string;
				providers: string[];
			};
			user_metadata: {};
			identities: [
				{
					identity_id: string;
					id: string;
					user_id: string;
					identity_data: {
						email: string;
						email_verified: string;
						phone_verified: string;
						sub: string;
					};
					provider: string;
					last_sign_in_at: string;
					created_at: string;
					updated_at: string;
					email: string;
				},
			];
			created_at: string;
			updated_at: string;
		};
		session: {
			access_token: string;
			token_type: string;
			expires_in: number;
			expires_at: number;
			refresh_token: string;
			user: {
				id: string;
				aud: string;
				role: string;
				email: string;
				email_confirmed_at: string;
				phone: string;
				last_sign_in_at: string;
				app_metadata: {
					provider: string;
					providers: string[];
				};
				user_metadata: {};
				identities: [
					{
						identity_id: string;
						id: string;
						user_id: string;
						identity_data: {
							email: string;
							email_verified: false;
							phone_verified: false;
							sub: string;
						};
						provider: string;
						last_sign_in_at: string;
						created_at: string;
						updated_at: string;
						email: string;
					},
				];
				created_at: string;
				updated_at: string;
			};
		};
	};
	error: string | null;
}
