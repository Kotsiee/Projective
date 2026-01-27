# Sitemap: (dashboard) Domain

The `(dashboard)` domain is the operational heart of Projective. It handles the distinct workflows
for Freelancers, Businesses, and Teams by dynamically adapting the interface based on the
`active_profile_type` and `active_team_id` stored in the session context.

---

## 📂 Documentation Structure

Due to the scale of the dashboard, documentation is split into logical modules. Each module contains
its own `routes.md` for frontend navigation and `api.md` for backend interactions.

| Module             | Scope                                                  | Documentation                        |
| :----------------- | :----------------------------------------------------- | :----------------------------------- |
| **Projects**       | Creation, Stage Management, and Timeline.              | [Browse Module](./projects/index.md) |
| **Teams**          | Collaboration, Roles, and Invitations.                 | [Browse Module](./teams/index.md)    |
| **Finance**        | Wallet, Earnings, Escrow, and Payments.                | [Browse Module](./finance/index.md)  |
| **Communications** | Real-time Chat, Attachments, and In-app Messaging.     | [Browse Module](./comms/index.md)    |
| **Settings**       | User Profile, Business Identity, and Account Security. | [Browse Module](./account/index.md)  |

---

## 🏛️ Core Architecture Patterns

### 1. Persona-Based Layouts

The dashboard uses a master `_layout.tsx` that monitors the `security.session_context`.

- **Freelancer View**: Prioritizes Earnings, Active Stages, and Profile Discovery.
- **Business View**: Prioritizes Project Creation, Budgeting, and Team Management.
- **Team View**: Injects team-specific project navigation when an `active_team_id` is present.

### 2. URL Strategy

We utilize a mix of flat and nested routes to maintain clarity while managing deep object
hierarchies:

- **Projects**: `/projects/[projectid]` acts as the "Hub".
- **Stages**: Sub-routes like `/projects/[pid]/[sid]` leverage `stageTabs` to switch between Chat,
  Files, and Tasks.
- **Slugs**: Square brackets `[id]` indicate dynamic slugs that trigger data-fetching via
  `DataManager`.

### 3. Middleware & Guards

Every route within the `(dashboard)` folder is protected by a global `_middleware.ts`.

- **Auth Check**: Redirects to `/login` if no valid session exists.
- **Onboarding Check**: Redirects to `/onboarding` if a user has not yet selected a persona.
- **Permission Logic**: Deep routes (e.g., `settings.tsx`) perform client-side checks against
  `ProjectPermission` enums before rendering.

---

## ⚡ Global Dashboard API Logic

**Base Path:** `/api/v1/dashboard/`

The dashboard API is designed to return normalized data compatible with the `@projective/data`
library.

```json
{
	"status": "success",
	"data": [],
	"meta": {
		"totalCount": 120,
		"activePersona": "business"
	}
}
```
