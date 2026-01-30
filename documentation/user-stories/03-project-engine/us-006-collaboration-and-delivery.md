# US-006: Collaboration & Stage Delivery (Proof of Work)

**Epic:** Project Engine **Persona:** Freelancer | Team Member **Status:** Ready

---

## 1. Narrative

> **As a** Freelancer or Team Member\
> **I want to** collaborate in a dedicated stage workspace and submit my deliverables\
> **So that** the Client can review the "Proof of Work" and trigger the release of escrowed funds.

---

## 2. Acceptance Criteria (AC)

- [ ] **AC 1: Workspace Access:** Only assigned talent and the project owner can access the
      stage-specific `comms` channel and file repository.
- [x] **AC 2: Real-time Comms:** Users can exchange messages and files within the stage context
      using WebSocket-powered chat.
- [ ] **AC 3: File Submission:** Talent can submit one or more files as a formal "Stage Submission,"
      moving them from `personal` or `quarantine` to the `project` storage bucket.
- [ ] **AC 4: Version Tracking:** Every submission is recorded in `projects.stage_submissions` with
      a timestamp and notes.
- [ ] **AC 5: Status Transition:** Upon formal submission, the stage status moves from `active` to
      `submitted`.
- [ ] **AC 6: Session Logging:** For `session_based` (Educate/Advise) stages, completion is logged
      by the system rather than a file upload.

---

## 3. Technical Implementation Strategy

### 🏗️ Monorepo Distribution

- **`packages/data`**:
  - Utilize `ChatList` and `RealtimeDataSource` for the stage workspace.
- **`packages/fields`**:
  - Use `FileDrop` for deliverable uploads with the `useFileProcessor` hook.
- **`@server/services`**:
  - `SubmissionService.submitWork()`: Handles the atomic move of files and the DB record creation.
- **`apps/web`**:
  - Route: `/projects/[pid]/[sid]/chat` and `/projects/[pid]/[sid]/submissions`.

### 🔐 Security & RLS

- **Schema**: `comms`, `projects`, `files`.
- **Policy**: Access enforced by `projects.has_project_access()` and stage-level assignment checks.
- **Audit**: Action `stage.work_submitted` logged in `security.audit_logs`.

### 🎨 UI & BEM Components

- **Block**: `.submission-portal`
- **UI Package**: Uses `@projective/ui/Splitter` to separate the chat from the file repository.

---

## 4. CREATE Framework Alignment

- **Category**: **Create** / **Run** (File-based) or **Educate** / **Advise** (Session-based).
- **Trigger**: Final submission upload or session completion log.

---

## 5. Notes & Constraints

- **The "Fair Exit" Clock:** The submission timestamp is used to calculate the 25/50/75 split logic
  if the project is cancelled later.
- **File Security:** All submissions must pass through the `quarantine` bucket before becoming
  visible to the Client.
