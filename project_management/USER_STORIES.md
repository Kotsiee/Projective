# User Stories — Tracked Board

The eight technical user stories, audited per acceptance criterion (AC) against the codebase. Each
story shows a two-lane board: **⬜ Outstanding** vs **✅ Met**. Status is edited in place — check an
AC off by moving it between lanes; keep no history.

## Summary Board

| ⬜ Todo | 🟡 In Progress | ✅ Done |
| :--- | :--- | :--- |
| US-004 · Stage Staffing & Assignment *(2/6)* | US-001 · Multi-Persona Onboarding *(4/6)* | — |
| US-008 · Business Administration *(1/5)* | US-002 · Org-Unit Formation *(3/6)* | |
| | US-003 · Modular Project Creation *(3/6)* | |
| | US-005 · Stage Escrow Funding *(4/6)* | |
| | US-006 · Collaboration & Delivery *(4/6)* | |
| | US-007 · Approval & Smart Payouts *(4/6)* | |

*(n/m) = acceptance criteria met. No story is fully complete; the two weakest sit in the Todo lane.*

---

## US-001 · Multi-Persona Onboarding — 🟡 In Progress (E1)
> A new user selects a persona and sets up their profile so the platform grants the right role.

| ⬜ Outstanding | ✅ Met |
| :--- | :--- |
| AC4 · Initialise `security.session_context` with active profile | AC1 · Persona selection (Freelancer / Business) |
| AC6 · Write `security.audit_logs` onboarding entry | AC2 · Identity setup (unique `@username`, name) |
| | AC3 · Create `org.users_public` + persona record |
| | AC5 · Username validation (alphanumeric, 3–20) |

---

## US-002 · Organizational-Unit Formation — 🟡 In Progress (E2)
> A user creates a Business (for hiring) or a Team (for collaborating) under a unified brand.

| ⬜ Outstanding | ✅ Met |
| :--- | :--- |
| AC1 · Business profile setup (legal name, billing, branding) | AC2 · Team profile setup + unique slug |
| AC3 · Context switch to new `active_profile_id`/`team_id` | AC4 · Unique name/slug per category |
| AC5 · Initialise Team Vault / Business Wallet | AC6 · Audit `business.created` / `team.created` *(partial: create paths exist)* |

*Note: Business create route + member APIs exist; wallet init and audit logging are not confirmed wired.*

---

## US-003 · Modular Project Creation — 🟡 In Progress (E3)
> A client breaks a project into modular CREATE-framework stages with granular IP control.

| ⬜ Outstanding | ✅ Met |
| :--- | :--- |
| AC1 · Project header (title, category, global IP mode) | AC2 · Stage definition (title, CREATE category, budget) |
| AC4 · Per-stage IP override | AC3 · Stage functional type (file/session) *(file-based)* |
| AC5 · Timeline sequencing (sequential/simultaneous) | AC6 · Draft status before publish |

---

## US-004 · Stage Staffing & Assignment — ⬜ Todo (E3/E4)
> A client invites individuals or teams to specific stages or reviews their applications.

| ⬜ Outstanding | ✅ Met |
| :--- | :--- |
| AC1 · Open-seat definition + required skills | AC4 · Atomic assignment → `projects.stage_assignments` *(roster API + `0118`)* |
| AC2 · Multi-type applications (freelancer + team) | AC5 · Status transition open → assigned *(partial via roster)* |
| AC3 · Team-lead authority to apply | |
| AC6 · Conflict prevention (no double-assign) | |

*Note: roster persistence exists (`api/.../roster.ts`, `migration 0118`); the applications/open-seat
model is frontend-only.*

---

## US-005 · Stage Escrow Funding — 🟡 In Progress (E6)
> A client funds a stage's escrow to signal secured capital so work can begin.

| ⬜ Outstanding | ✅ Met |
| :--- | :--- |
| AC1 · "Fund Stage" UI action (assigned stages only) | AC2 · Wallet balance verification *(`fn_check_spending_limit`)* |
| AC5 · Real-time "stage funded" notification | AC3 · Escrow isolation to `stage_id` *(`fn_hold_ticket_escrow`)* |
| | AC4 · Status transition assigned → active |
| | AC6 · Ledger entry + 5% fee calculation |

*Note: the escrow engine is complete in SQL; the funding UI and Stripe fiat-pull are not built.*

---

## US-006 · Collaboration & Stage Delivery — 🟡 In Progress (E3/E7)
> A freelancer collaborates in a stage workspace and submits deliverables as Proof of Work.

| ⬜ Outstanding | ✅ Met |
| :--- | :--- |
| AC1 · Workspace access control (assigned talent + owner) *(partial)* | AC2 · Real-time chat (WebSocket) |
| AC6 · Session-based completion logging | AC3 · File submission → `stage_submissions` *(`submit_deliverable`)* |
| | AC4 · Version tracking (timestamp + notes) |
| | AC5 · Status transition active → submitted *(Kanban sync `0121`)* |

---

## US-007 · Approval, Smart Payouts & Fair Exit — 🟡 In Progress (E6)
> A client approves a submission or triggers a fair cancellation; funds distribute by smart splits.

| ⬜ Outstanding | ✅ Met |
| :--- | :--- |
| AC5 · Ghosting protection (14-day auto-approve) | AC1 · Final approval → escrow release |
| AC6 · 7-day pending safety window *(pending state exists; timer not wired)* | AC2 · 5% platform-fee routing |
| | AC3 · Team smart splits *(`fn_split_team_payout`)* |
| | AC4 · Fair-exit cancellation split (25/50/75) |

---

## US-008 · Business Administration & Financial Overview — ⬜ Todo (E2/E6)
> A business client manages the org profile and views a consolidated financial summary.

| ⬜ Outstanding | ✅ Met |
| :--- | :--- |
| AC1 · Business dashboard (active projects, actions, balance) | AC3 · Financial ledger view *(partial: ledger backend + Wallet UI mock)* |
| AC2 · Profile management (legal name, logo, billing email) *(settings route stub)* | |
| AC4 · Stripe payment-method attach/detach | |
| AC5 · Member visibility list | |

*Note: the defining AC (business dashboard) renders nothing yet; `/dashboard` is a placeholder island
and the Stripe integration is absent. This is the least-implemented story.*
