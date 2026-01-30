# US-004: Modular Stage Staffing & Assignment

**Epic:** Project Engine **Persona:** Business Client | Freelancer | Team Admin **Status:** Ready

---

## 1. Narrative

> **As a** Business Client\
> **I want to** invite individuals or teams to specific project stages or review their applications\
> **So that** I can assemble the best possible multidisciplinary unit for each phase of my project.

---

## 2. Acceptance Criteria (AC)

- [ ] **AC 1: Open Seat Definition:** Business Clients can mark a stage as "Seeking Talent" and
      define required skills from the `org.skills` taxonomy.
- [ ] **AC 2: Multi-Type Applications:** The system accepts applications from both individual
      Freelancers and Freelancer Teams.
- [ ] **AC 3: Team Lead Authority:** Only a user with `admin` or `owner` status in
      `org.team_memberships` can apply for a project on behalf of a team.
- [ ] **AC 4: Atomic Assignment:** The Client can assign a specific profile to a specific stage.
      This creates a record in `projects.stage_assignments`.
- [ ] **AC 5: Status Transition:** Once an assignment is confirmed by both parties, the stage status
      moves from `open` to `assigned`.
- [ ] **AC 6: Conflict Prevention:** The system prevents the same stage from being assigned to
      multiple active providers simultaneously.

---

## 3. Technical Implementation Strategy

### 🏗️ Monorepo Distribution

- **`packages/types`**:
  - Define `AssignmentSchema` (Zod) including `assignee_type` enum (`freelancer` | `team`).
- **`packages/data`**:
  - Implement `StaffingDataSource` to query `projects.stage_open_seats` and handle the join between
    `org` profiles and `projects` assignments.
- **`@server/services`**:
  - `StaffingService.assignTalent()`: Validates that the assignee is not already over capacity and
    updates the stage state.
- **`apps/web`**:
  - Route: `/projects/[pid]/team` (Roster management).
  - Island: `StaffingPortal.island.tsx` (Interface for reviewing and approving applicants).

### 🔐 Security & RLS

- **Schema**: `projects`, `org`.
- **Policy**: `INSERT` to `stage_assignments` is restricted to the project owner. `SELECT` access is
  granted to the assigned freelancer/team members via `projects.has_project_access()`.
- **Audit**: Action `stage.staffing_confirmed` logged in `security.audit_logs`.

### 🎨 UI & BEM Components

- **Block**: `.talent-card`
- **UI Package**: Uses `@projective/data/DataDisplay` in `grid` mode to show applicant portfolios.
- **Fields**:
  - `ComboboxField` for filtering applicants by skills.

---

## 4. CREATE Framework Alignment

- **Category**: N/A (Recruitment Phase).
- **Trigger**: Assignment confirmation triggers the "Hire Confirmed" start trigger for dependent
  stages.

---

## 5. Notes & Constraints

- **Team Visibility:** If a team applies, the Business Client sees the collective team portfolio and
  the list of active members who will be working on the stage.
- **Capacity Limits:** Freelancer availability is cross-checked against their "onboarding
  declarations" to prevent over-booking.
