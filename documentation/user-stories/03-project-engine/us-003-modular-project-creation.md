# US-003: Modular Project Creation (The CREATE Engine)

**Epic:** Project Engine **Persona:** Business Client **Status:** Ready

---

## 1. Narrative

> **As a** Business Client\
> **I want to** define a project and break it down into modular stages using the CREATE framework\
> **So that** I can hire specialized talent for specific outcomes, fund escrow incrementally, and
> maintain granular control over Intellectual Property.

---

## 2. Acceptance Criteria (AC)

- [ ] **AC 1: Project Header:** User can define high-level project metadata, including title,
      industry category, and a global default IP ownership mode (e.g., Exclusive Transfer).
- [ ] **AC 2: Stage Definition:** User can add multiple stages to a project. Each stage must have a
      title, a category from the CREATE framework (Create, Run, Educate, Advise, Test, Empower), and
      a budget.
- [ ] **AC 3: Stage Type Logic:** Each stage must be assigned a functional type (e.g., `file_based`
      or `session_based`) to determine future payout triggers.
- [ ] **AC 4: IP Override:** User can override the global IP ownership mode for specific stages
      (e.g., "Licensed Use" for a template-based stage vs "Exclusive" for the final code).
- [ ] **AC 5: Timeline Sequencing:** User can define if stages are sequential (Stage B starts after
      Stage A) or simultaneous.
- [ ] **AC 6: Drafting:** Projects and stages are created in a `draft` status, allowing the client
      to refine the scope before publishing for hiring.

---

## 3. Technical Implementation Strategy

### 🏗️ Monorepo Distribution

- **`packages/types`**:
  - Export `ProjectCreateSchema` and `StageCreateSchema` using Zod.
  - Define TypeScript interfaces for the CREATE framework categories.
- **`packages/data`**:
  - Implement `ProjectDataSource` for managing the `projects.projects` and `projects.project_stages`
    tables.
- **`@server/services`**:
  - `ProjectService.createProjectDraft()`: A transaction-heavy service that validates the stage
    sequence and ensures IP modes are valid.
- **`apps/web`**:
  - Route: `/projects/new` (Fresh Page).
  - Island: `ProjectBuilder.island.tsx` (A dynamic, draggable UI for adding and reordering stages).

### 🔐 Security & RLS

- **Schema**: `projects`.
- **Policy**: `INSERT` and `UPDATE` access restricted to the `owner_user_id` matching the current
  `auth.uid()` and the active `client_business_id`.
- **Audit**: Action `project.draft_created` and `stage.added` logged in `security.audit_logs`.

### 🎨 UI & BEM Components

- **Block**: `.stage-builder`
- **UI Package**: Uses `@projective/ui/Accordion` to show/hide detailed stage settings.
- **Fields**:
  - `RichTextField` for stage descriptions.
  - `SelectField` for IP Mode and CREATE category selection.

---

## 4. CREATE Framework Alignment

- **Category**: Full Integration.
- **Trigger**: Submission of project draft creates the logical skeleton for all future "Proof of
  Work" triggers.

---

## 5. Notes & Constraints

- **Circular Dependencies:** The UI and backend must prevent a stage from depending on itself for a
  start trigger.
- **Budget Units:** All budgets must be handled in minor units (e.g., pence/cents) to prevent
  floating-point errors in the `finance` schema.
