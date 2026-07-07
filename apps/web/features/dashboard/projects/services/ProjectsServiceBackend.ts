/**
 * @file ProjectsServiceBackend.ts
 * @description Backend service layer for handling database interactions for Projects.
 */

// #region Imports
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.90.1';
import {
	Config,
	Deps,
	fail,
	normaliseSupabaseError,
	normaliseUnknownError,
	ok,
	Result,
	supabaseClient,
} from '@projective/backend';
import { ProjectsFilterParams } from '../contracts/Projects.ts';
import { CreateProjectInput } from '../contracts/new/_validation.ts';
import { StoragePaths } from '@projective/types';
// #endregion

// #region Interfaces
export interface FileOptions {
	attachments?: File[];
	/** Client-generated BlurHash per attachment, keyed by `file.name` (best-effort). */
	blurhashes?: Record<string, string>;
}
// #endregion

// #region Helper Functions
/**
 * Extracts plain string text from a Quill Delta object for search indexing.
 * @param {any} delta The Quill Delta object containing an ops array.
 * @returns {string} The concatenated plain text.
 */
// deno-lint-ignore no-explicit-any
const extractTextFromDelta = (delta: any): string => {
	if (!delta) return '';

	let parsedDelta = delta;

	if (typeof delta === 'string') {
		try {
			parsedDelta = JSON.parse(delta);
		} catch {
			return delta;
		}
	}

	if (!parsedDelta || !Array.isArray(parsedDelta.ops)) {
		return typeof parsedDelta === 'string' ? parsedDelta : '';
	}

	return parsedDelta.ops
		.filter((op: any) => typeof op.insert === 'string')
		.map((op: any) => op.insert)
		.join('');
};
// #endregion

// #region Service Definition
export class ProjectsBackendService {
	/**
	 * Creates a new project, handles file quarantine uploads, and triggers the database RPC.
	 * Automatically extracts plain text from Quill Deltas for search indexing.
	 */
	static async createProject(
		data: CreateProjectInput,
		targetStatus: 'draft' | 'active',
		files: FileOptions = {},
		deps: Deps = {},
	): Promise<Result<{ projectId: string }>> {
		try {
			const getClient = deps.getClient ?? supabaseClient;
			const supabase = await getClient();

			const { data: { user }, error: authError } = await supabase.auth.getUser();
			if (authError || !user) {
				return fail('unauthorized', 'You must be signed in to create a project.', 401);
			}

			const projectId = crypto.randomUUID();
			const serviceRoleKey = Config.SUPABASE_SERVICE_ROLE_KEY;
			const supabaseUrl = Config.SUPABASE_URL;
			// deno-lint-ignore no-explicit-any
			let adminClient: any = null;

			if (files.attachments && files.attachments.length > 0) {
				if (!serviceRoleKey || !supabaseUrl) {
					console.error('Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL');
					return fail('server_error', 'Upload configuration missing', 500);
				}
				adminClient = createClient(supabaseUrl, serviceRoleKey, {
					auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
				});
			}

			const processFile = async (
				file: File,
				contextType: 'project_global_attachment',
				attachmentId?: string,
			): Promise<{ url?: string; id: string }> => {
				const blurhash = files.blurhashes?.[file.name];
				const fileId = attachmentId || crypto.randomUUID();
				const quarantinePath = `${crypto.randomUUID()}/${file.name}`;

				const { bucket: targetBucket, path: targetPath } = StoragePaths.generate(
					file.name,
					{ type: contextType, projectId, attachmentId: fileId },
				);

				const { error: dbError } = await supabase.schema('files').from('items').insert({
					id: fileId,
					owner_user_id: user.id,
					display_name: file.name,
					original_name: file.name,
					mime_type: file.type,
					size_bytes: file.size,
					bucket_id: 'quarantine',
					storage_path: quarantinePath,
					target_bucket: targetBucket,
					target_path: targetPath,
					status: 'pending_upload',
					metadata: blurhash ? { blurhash } : {},
				});
				if (dbError) throw dbError;

				const { error: uploadError } = await supabase.storage
					.from('quarantine')
					.upload(quarantinePath, file, { contentType: file.type, upsert: false });
				if (uploadError) throw uploadError;

				const { error: scanError } = await adminClient.functions.invoke('scan-file', {
					body: { fileId },
				});
				if (scanError) throw scanError;

				let url;
				if (targetBucket === 'public_assets') {
					const { data: publicUrlData } = supabase
						.storage
						.from(targetBucket)
						.getPublicUrl(targetPath);
					url = publicUrlData.publicUrl;
				}

				return { url, id: fileId };
			};

			const attachment_ids: string[] = [];

			if (files.attachments && files.attachments.length > 0) {
				try {
					const uploads = await Promise.all(
						files.attachments.map((f) => processFile(f, 'project_global_attachment')),
					);
					attachment_ids.push(...uploads.map((u) => u.id));
				} catch (e) {
					console.error('Attachment upload failed:', e);
					return fail('server_error', 'Failed to upload attachments', 500);
				}
			}

			const existingAttachments = data.global_attachments || [];
			const finalAttachments = [...existingAttachments, ...attachment_ids];

			const projectDescriptionText = extractTextFromDelta(data.description);
			const stagesWithText = data.stages.map((stage) => ({
				...stage,
				description_text: extractTextFromDelta(stage.description),
				skills: Array.isArray(stage.skills) ? stage.skills : [],
			}));

			// Construct a clean, perfectly flat mapping that matches the RPC explicit requirements
			// deno-lint-ignore no-explicit-any
			const rawData = data as any;
			const legalData = rawData.legal_and_screening || {};

			// Helper to ensure lists resolve as arrays for the PostgreSQL text[] mapper
			// deno-lint-ignore no-explicit-any
			const arrayify = (val: any) => Array.isArray(val) ? val : (val ? [val] : []);

			const rpcPayload = {
				id: projectId,
				title: rawData.title,
				description: rawData.description,
				description_text: projectDescriptionText,
				format: rawData.format,
				industry_category_id: rawData.industry_category_id || rawData.category || null,
				visibility: rawData.visibility || 'public',
				currency: rawData.currency || 'USD',
				timeline_preset: rawData.timeline_preset || rawData.timelinePreset || 'sequential',
				target_project_start_date: rawData.target_project_start_date || rawData.targetStartDate ||
					null,

				// Flatten the nested frontend legal data directly to Postgres column names
				ip_ownership_mode: legalData.ip_ownership_mode || rawData.ipMode || 'exclusive_transfer',
				nda_required: legalData.nda_required === 'true' || legalData.nda_required === true ||
					rawData.ndaRequired === 'true' || rawData.ndaRequired === true || false,
				portfolio_display_rights: legalData.portfolio_display_rights || rawData.portfolioRights ||
					'allowed',
				location_restriction: arrayify(
					legalData.location_restriction || rawData.locationRestriction,
				),
				language_requirement: arrayify(
					legalData.language_requirement || rawData.languageRequirement,
				),
				screening_questions: legalData.screening_questions || rawData.screeningQuestions || [],

				stages: stagesWithText,
				global_attachments: finalAttachments,
			};

			const { data: _rpcResultId, error: rpcError } = await supabase
				.schema('projects')
				.rpc('create_project', { payload: rpcPayload });

			if (rpcError) {
				const n = normaliseSupabaseError(rpcError);
				return fail(n.code, n.message, n.status);
			}

			if (targetStatus === 'active') {
				const { error: updateError } = await supabase
					.schema('projects')
					.from('projects')
					.update({ status: 'active' })
					.eq('id', projectId);

				if (updateError) {
					const n = normaliseSupabaseError(updateError);
					return fail('partial_error', `Project saved but failed to publish: ${n.message}`, 500);
				}
			}

			return ok({ projectId });
		} catch (err) {
			const n = normaliseUnknownError(err);
			return fail(n.code, n.message, 500);
		}
	}

	static async getProject(
		project_id: string,
		deps: Deps = {},
		// deno-lint-ignore no-explicit-any
	): Promise<Result<any>> {
		try {
			const getClient = deps.getClient ?? supabaseClient;
			const supabase = await getClient();

			const { data, error } = await supabase
				.schema('projects')
				.rpc('get_project_details', { p_project_id: project_id })
				.single();

			if (error) {
				console.error('getProject RPC Error:', error);
				const n = normaliseSupabaseError(error);
				return fail(n.code, n.message, n.status);
			}

			return ok(data);
		} catch (err) {
			const n = normaliseUnknownError(err);
			return fail(n.code, n.message, 500);
		}
	}

	/**
	 * High-density metadata for the Unified Card / Quick Inspector (spec §4): Kanban column counts,
	 * next milestone deadline, pending-submission warnings and unsettled escrow. Delegates to
	 * `projects.get_project_card_summary` (guarded by has_project_access).
	 */
	static async getCardSummary(
		project_id: string,
		deps: Deps = {},
		// deno-lint-ignore no-explicit-any
	): Promise<Result<any>> {
		const startedAt = Date.now();
		try {
			const getClient = deps.getClient ?? supabaseClient;
			const supabase = await getClient();

			console.log(`[PROJECT_INSPECTOR_SVC] getCardSummary begin project=${project_id}`);

			const { data, error } = await supabase
				.schema('projects')
				.rpc('get_project_card_summary', { p_project_id: project_id });

			if (error) {
				console.error(
					`[PROJECT_INSPECTOR_SVC] getCardSummary FAILED project=${project_id} msg=${error.message} duration_ms=${
						Date.now() - startedAt
					}`,
				);
				const n = normaliseSupabaseError(error);
				return fail(n.code, n.message, n.status);
			}

			console.log(
				`[PROJECT_INSPECTOR_SVC] getCardSummary ok project=${project_id} duration_ms=${
					Date.now() - startedAt
				}`,
			);
			return ok(data);
		} catch (err) {
			const n = normaliseUnknownError(err);
			return fail(n.code, n.message, 500);
		}
	}

	static async getDashboardProjects(
		params: ProjectsFilterParams,
		deps: Deps = {},
		// deno-lint-ignore no-explicit-any
	): Promise<Result<any>> {
		try {
			const getClient = deps.getClient ?? supabaseClient;
			const supabase = await getClient();

			const { data, error } = await supabase.schema('projects').rpc('get_dashboard_projects', {
				p_category: params.category ?? 'all',
				p_category_id: params.categoryId ?? null,
				p_search_query: params.search ?? '',
				p_sort_by: params.sortBy ?? 'last_updated',
				p_sort_dir: params.sortDir ?? 'desc',
				p_limit: params.limit ?? 20,
				p_offset: params.offset ?? 0,
			});

			if (error) {
				console.error('RPC Error:', error);
				const n = normaliseSupabaseError(error);
				return fail(n.code, n.message, n.status);
			}

			return ok(data);
		} catch (err) {
			const n = normaliseUnknownError(err);
			return fail(n.code, n.message, 500);
		}
	}

	static async getStage(
		project_id: string,
		stage_id: string,
		deps: Deps = {},
		// deno-lint-ignore no-explicit-any
	): Promise<Result<any>> {
		try {
			const getClient = deps.getClient ?? supabaseClient;
			const supabase = await getClient();

			const { data, error } = await supabase
				.schema('projects')
				.rpc('get_stage_details', {
					p_project_id: project_id,
					p_stage_id: stage_id,
				})
				.single();

			if (error) {
				console.error('getStage RPC Error:', error);
				const n = normaliseSupabaseError(error);
				return fail(n.code, n.message, n.status);
			}

			return ok(data);
		} catch (err) {
			const n = normaliseUnknownError(err);
			return fail(n.code, n.message, 500);
		}
	}

	/**
	 * Creates a new stage within an existing project and appends it to the correct sort order.
	 */
	static async createStage(
		projectId: string,
		// deno-lint-ignore no-explicit-any
		data: any,
		deps: Deps = {},
	): Promise<Result<{ stageId: string }>> {
		try {
			const getClient = deps.getClient ?? supabaseClient;
			const supabase = await getClient();

			// 1. Identify current highest sort_order
			const { data: stages, error: sortError } = await supabase
				.schema('projects')
				.from('project_stages')
				.select('sort_order')
				.eq('project_id', projectId)
				.order('sort_order', { ascending: false })
				.limit(1);

			if (sortError) throw sortError;
			const nextSortOrder = (stages?.[0]?.sort_order ?? -1) + 1;

			// 2. Process Rich Text Delta
			const descriptionText = extractTextFromDelta(data.description);

			// 3. Insert Stage
			const insertData = {
				project_id: projectId,
				name: data.name,
				description: data.description || {},
				description_text: descriptionText,
				sort_order: nextSortOrder,
				file_upload_required: !!data.file_upload_required,
				default_tasks: data.default_tasks || [],
				skills: data.skills || [],
				fixed_start_date: data.start_date || null,
				file_due_date: data.end_date || null,
				ip_ownership_override: data.ip_ownership_override || null,
				status: 'open',
			};

			const { data: newStage, error } = await supabase
				.schema('projects')
				.from('project_stages')
				.insert(insertData)
				.select('id')
				.single();

			if (error) {
				const n = normaliseSupabaseError(error);
				return fail(n.code, n.message, n.status);
			}

			return ok({ stageId: newStage.id });
		} catch (err) {
			const n = normaliseUnknownError(err);
			return fail(n.code, n.message, 500);
		}
	}
}
// #endregion
