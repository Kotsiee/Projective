# (dashboard) Module: Projects

The Projects module is the primary workspace where Users (Businesses, Freelancers, and Teams)
collaborate on deliverables. It manages everything from the high-level project timeline down to
specific stage actions like funding escrow and submitting work.

---

## 🛤️ Frontend Routes

**Folder Path:** `/apps/web/routes/(dashboard)/projects/`

The routing structure follows a hierarchical pattern: **Project List → Project Hub → Stage
Workspace**.

### 1. Project Management

| Route Path      | File Path       | Description                                                                  |
| :-------------- | :-------------- | :--------------------------------------------------------------------------- |
| `/projects`     | `index.tsx`     | Searchable list of all projects the user is involved in. Uses `DataDisplay`. |
| `/projects/new` | `new/index.tsx` | Multi-step creation flow for new project drafts.                             |

### 2. Project Hub (`[projectid]/`)

These routes focus on the project as a single entity.

| Route Path                 | File Path      | Description                                                      |
| :------------------------- | :------------- | :--------------------------------------------------------------- |
| `/projects/[pid]`          | `index.tsx`    | Project overview, high-level status, and milestone summary.      |
| `/projects/[pid]/timeline` | `timeline.tsx` | Gantt or list-based view of all stages and dependencies.         |
| `/projects/[pid]/team`     | `team.tsx`     | Roster of involved members and their specific roles/permissions. |
| `/projects/[pid]/finance`  | `finance.tsx`  | Budget tracking, total spend, and escrow status for the project. |
| `/projects/[pid]/settings` | `settings.tsx` | Project configuration, metadata updates, and archiving.          |

### 3. Stage Workspace (`[projectid]/[stageid]/`)

The most granular level where work happens. This route utilizes `stageTabs` to dynamically render
navigation based on the `StageType`.

| Tab (Sub-route) | Target Component    | Contextual Requirement                              |
| :-------------- | :------------------ | :-------------------------------------------------- |
| `chat`          | `ChatList`          | Real-time communication for the specific stage.     |
| `files`         | `FileDrop`          | Repository for stage-specific resources and assets. |
| `submissions`   | `FileBased` View    | Handling deliverables and approval flows.           |
| `sessions`      | `SessionBased` View | Booking and management of 1-on-1 or group time.     |

---

## ⚡ API Endpoints

**Base Path:** `/api/v1/dashboard/projects/`

| Endpoint       | Method  | Permission       | Description                                                |
| :------------- | :------ | :--------------- | :--------------------------------------------------------- |
| `/`            | `GET`   | (Auth)           | Fetches paginated projects for the active persona.         |
| `/`            | `POST`  | (Auth)           | Creates a new project record in the `Draft` state.         |
| `/[id]`        | `GET`   | (Auth)           | Full project details including summarized stage counts.    |
| `/[id]/stages` | `GET`   | (Auth)           | List of stages associated with the project.                |
| `/[id]/stages` | `POST`  | `CreateStage`    | Adds a new stage to the project timeline.                  |
| `/[id]/status` | `PATCH` | `ManageSettings` | Transitions project state (e.g., `Active` to `Completed`). |

---

## 🔒 Security & Logic

### Permission Enforcement

Access to these routes and endpoints is strictly gated by the user's role in the
`security.session_context` and their specific project-level permissions.

- **Business Persona**: Typically holds `ManageMembers` and `FundEscrow` permissions.
- **Freelancer Persona**: Typically holds `SubmitWork` and `EditDetails` for assigned stages.

### Auditability

All critical transitions (e.g., creating a stage or moving a project to `OnHold`) are logged in
`security.audit_logs` to maintain a dispute-resolution trail.

```json
{
	"action": "stage.created",
	"entity_table": "stages",
	"actor_profile_id": "active_uuid",
	"metadata": {
		"project_id": "pid_uuid",
		"stage_type": "file_based"
	}
}
```
