/** The admin-profile view-model backing the settings form (US-008 AC2). */
export interface BusinessAdminProfile {
	id: string;
	name: string;
	slug: string;
	legal_name: string | null;
	billing_email: string;
	default_currency: string;
	logo_file_id: string | null;
	/** Resolved public URL for the current logo (null until scanned/clean). */
	logoUrl: string | null;
	/** Whether the current user may edit (owner/admin). */
	can_manage: boolean;
}
