// 1. Project Level
export enum ProjectPermission {
	ManageSettings = 'manage_settings', // Edit title, archive, delete
	ManageMembers = 'manage_members', // Invite/kick team members
	ViewFinancials = 'view_financials', // See total spend/budget
	CreateStage = 'create_stage', // Add new stages
}

// 2. Stage Level (Workflow)
export enum StagePermission {
	EditDetails = 'edit_details', // Change description/requirements
	AssignWorker = 'assign_worker', // Assign freelancer/team
	FundEscrow = 'fund_escrow', // Pay into escrow
	SubmitWork = 'submit_work', // Upload deliverables
	ApproveWork = 'approve_work', // Accept submission
	RequestRevision = 'request_revision', // Reject submission
	ViewPrivateNotes = 'view_private_notes', // Internal team notes
}

// 3. Business/Org Level
export enum BusinessPermission {
	ManageBilling = 'manage_billing', // Update credit cards
	ManageTeamRoles = 'manage_team_roles', // Promote members
	DeleteBusiness = 'delete_business',
}

// 4. Platform Admin
export enum AdminPermission {
	ViewAllUsers = 'view_all_users',
	OverrideDispute = 'override_dispute',
	BanUser = 'ban_user',
}
