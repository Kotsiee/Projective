# User Stories — Tracked Board

The eight technical user stories, audited per acceptance criterion (AC) against the codebase. Each
story shows a two-lane board: **⬜ Outstanding** vs **✅ Met**. Status is edited in place — check an
AC off by moving it between lanes; keep no history.

## Summary Board

| ⬜ Todo | 🟡 In Progress                             | ✅ Done                                      |
| :------ | :----------------------------------------- | :------------------------------------------- |
|         | US-006 · Collaboration & Delivery _(5/6)_  | US-001 · Multi-Persona Onboarding _(6/6)_    |
|         | US-007 · Approval & Smart Payouts _(4/6)_  | US-002 · Org-Unit Formation _(6/6)_          |
|         | US-008 · Business Administration _(4/5)_   | US-003 · Modular Project Creation _(6/6)_    |
|         |                                            | US-004 · Stage Staffing & Assignment _(6/6)_ |
|         |                                            | US-005 · Stage Escrow Funding _(6/6)_        |

_(n/m) = acceptance criteria met. US-001–US-005 are fully complete; US-006 has only the
E11-dependent session-completion AC left; US-008 has its full admin panel + live finance overview,
with only AC4 (Stripe card attach) deferred outside the internal-wallet demo path._

---

## US-001 · Multi-Persona Onboarding — ✅ Done (E1)

> A new user selects a persona and sets up their profile so the platform grants the right role.

| ⬜ Outstanding | ✅ Met                                                          |
| :------------- | :-------------------------------------------------------------- |
|                | AC1 · Persona selection (Freelancer / Business)                 |
|                | AC2 · Identity setup (unique `@username`, name)                 |
|                | AC3 · Create `org.users_public` + persona record                |
|                | AC4 · Initialise `security.session_context` with active profile |
|                | AC5 · Username validation (alphanumeric, 3–20)                  |
|                | AC6 · Write `security.audit_logs` onboarding entry              |

_Extension — post-onboarding persona expansion:_ persona is no longer fixed at signup. A
Client/Operator can unlock a freelancer profile later from the luxury `/become-partner` funnel; the
idempotent `org.enable_freelancer_profile` RPC (`0313_freelancer_conversion.sql`) creates the
`freelancer_profiles` row, flips `is_freelancer`, activates the freelancer persona in
`session_context`, and writes a `freelancer.unlocked` audit row — the same AC3/AC4/AC6 guarantees as
first-run onboarding, just self-serve. The completeness engine gains a public **go-live milestone**
so a converting user sees exactly which baseline unlocks selling/applying. (The freelancer
`hourly_rate` column was removed platform-wide — rates are not a signalling field.)

---

## US-002 · Organizational-Unit Formation — ✅ Done (E2)

> A user creates a Business (for hiring) or a Team (for collaborating) under a unified brand.

| ⬜ Outstanding | ✅ Met                                                           |
| :------------- | :--------------------------------------------------------------- |
|                | AC1 · Draft-first Business creation (Name + `@handle`, then defer profile) |
|                | AC2 · Draft-first Team creation (Name + `@handle`, unique slug)  |
|                | AC3 · Context switch to new `active_profile_id`/`active_team_id` |
|                | AC4 · Unique name/slug per category                              |
|                | AC5 · Initialise Team Vault / Business Wallet                    |
|                | AC6 · Audit `business.created` / `team.created`                  |

_Note: creation is low-friction and in-context — the `CreateBusinessModal` / `CreateTeamModal`
islands capture only a display Name and a unique alphanumeric `@handle`, and the minimal-payload
`org.create_business` / `org.create_team` RPCs (migs 0110 / 0107, rewritten in
`20260709120000_business_teams_overhaul`) create the entity in `status = 'draft'`
(Draft/Unverified) while still initialising the finance wallet / Team Vault (linked via
`treasury_wallet_id`) and writing the `business.created` / `team.created` audit rows from their
SECURITY DEFINER context. Extended metadata (branding, legal name, billing, roles, members) is
deferred to the entity's settings page. Access to each space is nav-gated — the **Businesses** space
requires account-level **Client / Operator Mode** (`is_operator`, toggled via `org.set_operator_mode`),
and the **Teams** space is freelancer-only (`activeProfileType === 'freelancer'`). The org/team
context switch upserts `security.session_context` via `features/auth/services/context.ts`
(`team_members`-guarded)._

---

## US-003 · Modular Project Creation — ✅ Done (E3)

> A client breaks a project into modular CREATE-framework stages with granular IP control.

| ⬜ Outstanding | ✅ Met                                                                                                                      |
| :------------- | :-------------------------------------------------------------------------------------------------------------------------- |
|                | AC1 · Project header (title, global IP mode, timeline) _(category is schema-wired; the picker awaits an industry taxonomy)_ |
|                | AC2 · Stage definition (title, CREATE category, budget)                                                                     |
|                | AC3 · Stage functional type (file/session) _(file-based)_                                                                   |
|                | AC4 · Per-stage IP override                                                                                                 |
|                | AC5 · Timeline sequencing (sequential/simultaneous)                                                                         |
|                | AC6 · Draft status before publish                                                                                           |

_Note: `projects.create_project` (mig 0101) persists per-stage `ip_ownership_override` + `ip_mode`
(AC4) and the sequencing fields `start_trigger_type` / `start_dependency_stage_id` (AC5); the create
modal captures the global IP mode + `timeline_preset`, and `NewStageModal` maps "follows stage" to a
`dependent_on_stage` trigger. The `session_replication_role='replica'` trigger-suppression
workaround was removed from `create_project` so the count trigger (0114) fires on insert;
`client_business_id` lets a project be created under an active org context._

---

## US-004 · Stage Staffing & Assignment — ✅ Done (E3/E4)

> A client invites individuals or teams to specific stages or reviews their applications.

| ⬜ Outstanding | ✅ Met                                                                                                                              |
| :------------- | :---------------------------------------------------------------------------------------------------------------------------------- |
|                | AC1 · Open-seat definition + required skills _(`projects.create_stage_open_seat` + `stage_open_seat_skills`, `0307`)_               |
|                | AC2 · Multi-type applications (freelancer + team) _(`projects.apply_to_seat`, `0307`)_                                              |
|                | AC3 · Team-lead authority to apply _(`org.is_team_lead` gate, `0307`)_                                                              |
|                | AC4 · Atomic assignment → `projects.stage_assignments` _(`projects.assign_from_application`, `0307`)_                               |
|                | AC5 · Status transition open → assigned _(seat-fill flips the stage in `assign_from_application`)_                                  |
|                | AC6 · Conflict prevention (no double-assign) _(advisory-lock + active-assignee unique index + `fn_assignee_slot_conflict`, `0307`)_ |

_Note: seats (with required skills), freelancer/team applications and atomic conflict-guarded
assignment are live via the `projects.*` staffing RPCs (`0307`), reached through
`StaffingService(Backend)` and the `/stages/[stageid]/seats` routes; the staffing surface is mounted
at the stage **Staffing** tab (`[stageid]/staffing.tsx` → the `StageStaffing` island, hydrated from
`StageContext`) and renders on the shared `@projective/ui` RosterCard + `@projective/fields`
StatusSlider._

---

## US-005 · Stage Escrow Funding — ✅ Done (E6)

> A client funds a stage's escrow to signal secured capital so work can begin.

| ⬜ Outstanding | ✅ Met                                                                        |
| :------------- | :---------------------------------------------------------------------------- |
|                | AC1 · "Fund Stage" UI action (assigned stages only) _(`projects.fund_stage`)_ |
|                | AC2 · Wallet balance verification _(`fn_check_spending_limit`)_               |
|                | AC3 · Escrow isolation to `stage_id` _(`fn_hold_ticket_escrow`)_              |
|                | AC4 · Status transition assigned → active                                     |
|                | AC5 · Real-time "stage funded" notification _(`comms.fn_notify` + SSE)_       |
|                | AC6 · Ledger entry + 5% fee calculation                                       |

_Note: funded via `projects.fund_stage` against pre-loaded wallet balances; the Finance tab
(`StageFinance.island`) drives fund/approve, and the inbox streams the funded notification over SSE.
Stripe fiat top-up is intentionally deferred._

---

## US-006 · Collaboration & Stage Delivery — 🟡 In Progress (E3/E7)

> A freelancer collaborates in a stage workspace and submits deliverables as Proof of Work.

| ⬜ Outstanding                                                                              | ✅ Met                                                                                                                                |
| :------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------ |
| AC6 · Session-based completion logging _(deferred — depends on unstarted E11 session epic)_ | AC1 · Workspace access control (assigned talent + owner) _(`projects.has_stage_access` gates the stage room RPC + comms RLS, `0308`)_ |
|                                                                                             | AC2 · Real-time chat (WebSocket)                                                                                                      |
|                                                                                             | AC3 · File submission → `stage_submissions` _(`submit_deliverable`, `0120`)_                                                          |
|                                                                                             | AC4 · Version tracking (sequential `number` + `created_at` timestamp + `description`/`notes`)                                         |
|                                                                                             | AC5 · Status transition active → submitted _(Kanban sync `0121`)_                                                                     |

_Note: the stage room/chat is now scoped to the stage's assigned talent plus the client/owner —
whole-project channels keep project-level access. Only the E11-dependent session-completion log
(AC6) remains; the file-based delivery path is complete._

---

## US-007 · Approval, Smart Payouts & Fair Exit — 🟡 In Progress (E6)

> A client approves a submission or triggers a fair cancellation; funds distribute by smart splits.

| ⬜ Outstanding                                                              | ✅ Met                                                                              |
| :-------------------------------------------------------------------------- | :---------------------------------------------------------------------------------- |
| AC5 · Ghosting protection (14-day auto-approve)                             | AC1 · Final approval → escrow release _(`projects.approve_stage`)_                  |
| AC6 · 7-day pending safety window _(pending state exists; timer not wired)_ | AC2 · 5% platform-fee routing _(`platform_fee_bp` = 500)_                           |
|                                                                             | AC3 · Team smart splits _(`fn_split_team_payout`)_                                  |
|                                                                             | AC4 · Fair-exit cancellation split (25/50/75) _(`projects.cancel_stage_fair_exit`)_ |

_Note: final-approval and fair-exit (25/50/75) are UI-wired via the stage Finance tab to
`projects.approve_stage` / `cancel_stage_fair_exit`; team splits and the 5% fee route through the
SQL engine. Ghosting auto-approve and the 7-day safety-window timer remain unbuilt._

---

## US-008 · Business Administration & Financial Overview — 🟡 In Progress (E2/E6)

> A business client manages the org profile and views a consolidated financial summary.

| ⬜ Outstanding                                       | ✅ Met                                                                          |
| :--------------------------------------------------- | :------------------------------------------------------------------------------ |
| AC4 · Stripe payment-method attach/detach _(deferred — outside the internal-wallet demo path)_ | AC1 · Business dashboard (live active projects, quick actions, real-time balances) |
|                                                      | AC2 · Profile management (legal name, logo, billing email) via `org.update_business` |
|                                                      | AC3 · Financial ledger view — live from the Postgres ledger engine (`org.get_business_finance`) |
|                                                      | AC5 · Member visibility list (roles + seat state, `org.get_business_members`)    |

_Note: the finance backend is live — real-time wallet balances, an Area/Line volume series and the
filterable Transaction Ledger read straight from `finance.*` via the `org.get_business_finance`
wrapper (migration 0309); every business wallet is seeded with a one-time opening platform credit so
escrow holds/releases produce real ledger lines. Its former `/dashboard` overview page was retired
when the persona-adaptive `/home` feed became the authenticated landing — re-homing the business
finance surface (fold into `/home` client persona, or a `/business` panel) is pending. Only AC4
(Stripe card attach) is deferred, since payment intents sit outside the internal-wallet demo path._
