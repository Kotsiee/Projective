import {
	BaseOwner,
	FullProjectResponse,
	ImageVariants,
	ProjectRoleResponse,
	ProjectStageResponse,
} from '@projective/types';
import { SupabaseClient } from 'supabaseClient';

export interface Deps {
	getClient?: () => Promise<SupabaseClient>;
}

export class ViewBackendService {
	static async getView(entity: string, id: string, deps: Deps = {}) {
		if (!deps.getClient) {
			return { ok: false, error: { status: 500, message: 'Missing database client context' } };
		}
		if (!id) return { ok: false, error: { status: 400, message: 'Missing entity ID' } };

		switch (entity) {
			case 'project':
				return await this.getProjectView(id, deps);
			default:
				return { ok: false, error: { status: 400, message: `Invalid view entity: ${entity}` } };
		}
	}

	private static async getProjectView(id: string, deps: Deps) {
		const client = await deps.getClient!();

		// 1. Fetch Core Project (No thumbnail logic)
		const { data: project, error: pError } = await client
			.schema('projects')
			.from('projects')
			.select('*')
			.eq('id', id)
			.single();

		if (pError || !project) {
			return { ok: false, error: { status: 404, message: 'Project not found' } };
		}

		// 2. Fetch Owner Pointers
		let ownerRaw: any;
		if (project.client_business_id) {
			const { data: biz } = await client
				.schema('org')
				.from('business_profiles')
				.select('id, name, slug, logo_file_id, banner_file_id')
				.eq('id', project.client_business_id)
				.single();
			ownerRaw = { ...biz, type: 'business', avatar_file_id: biz?.logo_file_id };
		} else {
			const { data: user } = await client
				.schema('org')
				.from('users_public')
				.select('user_id, first_name, last_name, username, avatar_file_id, banner_file_id')
				.eq('user_id', project.owner_user_id)
				.single();

			const name = [user?.first_name, user?.last_name].filter(Boolean).join(' ');
			ownerRaw = { ...user, type: 'user', id: user?.user_id, name: name || user?.username };
		}

		// 3. Resolve Image Variants
		const fileIds = [ownerRaw.avatar_file_id, ownerRaw.banner_file_id].filter(Boolean);
		const fileMap = new Map<string, ImageVariants>();

		if (fileIds.length > 0) {
			const { data: filesData } = await client
				.schema('files')
				.from('items')
				.select('id, metadata')
				.in('id', fileIds);

			filesData?.forEach((f: any) => {
				if (f.metadata?.variants) fileMap.set(f.id, f.metadata.variants as ImageVariants);
			});
		}

		const owner: BaseOwner = {
			id: ownerRaw.id || project.owner_user_id,
			type: ownerRaw.type,
			name: ownerRaw.name || 'Unknown',
			username_or_slug: ownerRaw.slug || ownerRaw.username || '',
			avatar: ownerRaw.avatar_file_id ? (fileMap.get(ownerRaw.avatar_file_id) || null) : null,
			banner: ownerRaw.banner_file_id ? (fileMap.get(ownerRaw.banner_file_id) || null) : null,
		};

		// 4. Fetch Stages & Roles
		const { data: stagesData } = await client.schema('projects').from('project_stages').select('*')
			.eq('project_id', id).order('sort_order', { ascending: true });
		const stagesList = stagesData || [];

		let rolesList: any[] = [];
		if (stagesList.length > 0) {
			const { data: rolesData } = await client.schema('projects').from('stage_staffing_roles')
				.select('*').in('project_stage_id', stagesList.map((s: any) => s.id));
			rolesList = rolesData || [];
		}

		const formattedStages: ProjectStageResponse[] = stagesList.map((s: any) => ({
			id: s.id,
			name: s.name,
			description: s.description || null, // <-- Mapped Description
			description_text: s.description_text || null, // <-- Mapped Text Description
			skills: s.skills || [],
			status: s.status,
			file_upload_required: s.file_upload_required || false,
			default_tasks: s.default_tasks || [],
			start_date: s.fixed_start_date || null,
			end_date: s.file_due_date || null,
		}));

		const formattedRoles: ProjectRoleResponse[] = rolesList.map((r: any) => {
			const available = r.quantity || 1;

			return {
				id: r.id,
				project_stage_id: r.project_stage_id,
				quantity: r.quantity || 1,
				available_quantity: available,
				role_title: r.role_title,
				budget_type: r.budget_type,
				budget_amount_cents: r.budget_amount_cents,
			};
		});

		const aggregatedSkills = Array.from(
			new Set(stagesList.flatMap((s: any) => s.skills || [])),
		) as string[];

		// 5. Build DTO
		const response: FullProjectResponse = {
			id: project.id,
			created_at: project.created_at,
			updated_at: project.updated_at,
			rating_average: 0,
			rating_count: 0,
			title: project.title,
			description: project.description || null,
			format: project.format,
			status: project.status,
			is_active: project.status !== 'draft' && project.visibility === 'public',
			industry_category_id: project.industry_category_id || '',
			target_project_start_date: project.target_project_start_date,
			owner,
			nda_required: project.nda_required,
			ip_ownership_mode: project.ip_ownership_mode,
			languages: project.language_requirement || [],
			locations: project.location_restriction || [],
			skills: aggregatedSkills,
			stages: formattedStages,
			roles: formattedRoles,
		};

		return { ok: true, data: response };
	}
}
