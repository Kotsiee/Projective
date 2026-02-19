type PathContext =
	| { type: 'profile_avatar'; userId: string }
	| { type: 'team_avatar'; teamId: string }
	| { type: 'team_banner'; teamId: string }
	| { type: 'business_logo'; businessId: string }
	| { type: 'business_banner'; businessId: string }
	| { type: 'project_thumbnail'; projectId: string } // NEW
	| { type: 'project_global_attachment'; projectId: string; attachmentId: string } // NEW
	| { type: 'project_submission'; projectId: string; stageId: string; submissionId: string }
	| { type: 'project_attachment'; projectId: string; channelId: string; attachmentId: string }
	| { type: 'personal_library'; userId: string; folder?: string };

export class StoragePaths {
	static generate(filename: string, context: PathContext): { bucket: string; path: string } {
		switch (context.type) {
			case 'project_thumbnail':
				return {
					bucket: 'public_assets',
					path: `projects/${context.projectId}/thumbnail.webp`,
				};
			case 'project_global_attachment':
				return {
					bucket: 'project',
					path: `${context.projectId}/assets/${context.attachmentId}/${filename}`,
				};

			case 'profile_avatar':
				return { bucket: 'public_assets', path: `users/${context.userId}/avatar.webp` };
			case 'team_avatar':
				return { bucket: 'public_assets', path: `teams/${context.teamId}/avatar.webp` };
			case 'team_banner':
				return { bucket: 'public_assets', path: `teams/${context.teamId}/banner.webp` };
			case 'business_logo':
				return { bucket: 'public_assets', path: `businesses/${context.businessId}/logo.webp` };
			case 'business_banner':
				return { bucket: 'public_assets', path: `businesses/${context.businessId}/banner.webp` };
			case 'project_submission':
				return {
					bucket: 'project',
					path:
						`${context.projectId}/stages/${context.stageId}/submissions/${context.submissionId}/${filename}`,
				};
			case 'project_attachment':
				return {
					bucket: 'project',
					path:
						`${context.projectId}/channels/${context.channelId}/attachments/${context.attachmentId}/${filename}`,
				};
			case 'personal_library': {
				const folder = context.folder ? `/${context.folder}` : '';
				return { bucket: 'personal', path: `users/${context.userId}${folder}/${filename}` };
			}
			default:
				throw new Error('Unknown storage context');
		}
	}
}
