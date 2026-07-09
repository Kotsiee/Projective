/**
 * @file StaffingService.ts
 * @description Frontend Service layer for US-004 · Stage Staffing & Assignment. Islands call this over
 * `fetch`; it hits the stage staffing routes which delegate to the `projects.*` staffing RPCs (0307).
 * Backend guard errors (authority, conflict) are surfaced verbatim for client-side error boundaries.
 */
// deno-lint-ignore-file no-explicit-any
import { getCsrfToken } from '@projective/utils';

// #region DTOs (mirror projects.fn_serialize_seat / fn_serialize_application)
export interface SeatSkillDTO {
	id: string;
	name: string;
}

export interface SeatApplicationDTO {
	id: string;
	projectId: string;
	seatId: string;
	applicantType: 'freelancer' | 'team';
	applicantProfileId: string;
	applicantUserId: string;
	applicantName: string;
	message: string | null;
	status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
	createdAt: string;
}

export interface OpenSeatDTO {
	id: string;
	stageId: string;
	description: string;
	budgetMinCents: number | null;
	budgetMaxCents: number | null;
	requireProposals: boolean;
	status: 'open' | 'filled' | 'closed';
	filledAssignmentId: string | null;
	createdAt: string;
	requiredSkills: SeatSkillDTO[];
	applicationCount: number;
	applications?: SeatApplicationDTO[];
}

export interface StageAssignmentDTO {
	id: string;
	assigneeType: 'freelancer' | 'team';
	freelancerProfileId: string | null;
	teamId: string | null;
	status: string;
	createdAt: string;
}

export interface StageStaffingDTO {
	seats: OpenSeatDTO[];
	assignments: StageAssignmentDTO[];
}

export interface CreateSeatPayload {
	description: string;
	budgetMinCents?: number | null;
	budgetMaxCents?: number | null;
	requireProposals?: boolean;
	skillIds?: string[];
}

export interface ApplyPayload {
	applicantType: 'freelancer' | 'team';
	applicantProfileId: string;
	message?: string | null;
}

/** The viewer's live Workload Intensity vs. cap (spec §3), for the Workload Capacity Gauge. */
export interface WorkloadCapacityDTO {
	current: number;
	cap: number;
	ratio: number | null;
	ticket_count: number;
	project_current: number | null;
}
// #endregion

const base = (projectId: string, stageId: string) =>
	`/api/v1/dashboard/projects/${projectId}/stages/${stageId}`;

async function unwrap<T>(res: Response, fallback: string): Promise<T> {
	if (!res.ok) {
		const err = await res.json().catch(() => ({} as any));
		throw new Error(err?.error?.message || err?.error || fallback);
	}
	return await res.json();
}

export class StaffingService {
	/** Reads the staffing surface (seats + applicants + assignments) for a stage. */
	static async getStaffing(projectId: string, stageId: string): Promise<StageStaffingDTO> {
		console.log(`[STAFFING_CLIENT] getStaffing project=${projectId} stage=${stageId}`);
		const res = await fetch(`${base(projectId, stageId)}/seats`);
		return unwrap<StageStaffingDTO>(res, 'Failed to load staffing');
	}

	/** Defines a new open seat (+ required skills). Owner-only (SQL-enforced). */
	static async createSeat(
		projectId: string,
		stageId: string,
		payload: CreateSeatPayload,
	): Promise<OpenSeatDTO> {
		console.log(`[STAFFING_CLIENT] createSeat project=${projectId} stage=${stageId}`);
		const res = await fetch(`${base(projectId, stageId)}/seats`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'X-CSRF': getCsrfToken() || '' },
			body: JSON.stringify(payload),
		});
		return unwrap<OpenSeatDTO>(res, 'Failed to create seat');
	}

	/** Submits an application (freelancer or lead-gated team) to a seat. */
	static async apply(
		projectId: string,
		stageId: string,
		seatId: string,
		payload: ApplyPayload,
	): Promise<SeatApplicationDTO> {
		console.log(
			`[STAFFING_CLIENT] apply project=${projectId} seat=${seatId} type=${payload.applicantType}`,
		);
		const res = await fetch(`${base(projectId, stageId)}/seats/${seatId}/apply`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'X-CSRF': getCsrfToken() || '' },
			body: JSON.stringify(payload),
		});
		return unwrap<SeatApplicationDTO>(res, 'Failed to apply');
	}

	/** The viewing freelancer's live workload capacity (global + this project), for the gauge. */
	static async getMyCapacity(projectId: string): Promise<WorkloadCapacityDTO | null> {
		const res = await fetch(`/api/v1/dashboard/projects/${projectId}/workload`);
		return unwrap<WorkloadCapacityDTO | null>(res, 'Failed to load workload capacity');
	}

	/** Accepts an application → atomically assigns the applicant to the stage (conflict-guarded). */
	static async assign(
		projectId: string,
		stageId: string,
		applicationId: string,
	): Promise<SeatApplicationDTO> {
		console.log(`[STAFFING_CLIENT] assign project=${projectId} application=${applicationId}`);
		const res = await fetch(`${base(projectId, stageId)}/applications/${applicationId}/assign`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'X-CSRF': getCsrfToken() || '' },
		});
		return unwrap<SeatApplicationDTO>(res, 'Failed to assign');
	}
}
