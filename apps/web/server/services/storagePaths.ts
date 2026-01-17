type PathContext =
	| { type: 'profile_avatar'; userId: string }
	| { type: 'project_submission'; projectId: string; stageId: string; submissionId: string }
	| { type: 'project_attachment'; projectId: string; channelId: string; attachmentId: string }
	| { type: 'personal_library'; userId: string; folder?: string };

export class StoragePaths {
	static generate(filename: string, context: PathContext): { bucket: string; path: string } {
		switch (context.type) {
			case 'profile_avatar':
				return {
					bucket: 'public_assets',
					path: `users/${context.userId}/avatar.webp`,
				};

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
				return {
					bucket: 'personal',
					path: `users/${context.userId}${folder}/${filename}`,
				};
			}

			default:
				throw new Error('Unknown storage context');
		}
	}
}
