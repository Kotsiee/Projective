# (dashboard) Module: Businesses

The Businesses module provides a structured organizational layer for Clients to manage complex
projects, brands, or legal entities. While initially serving as a grouping mechanism for projects,
it is architected to scale into a multi-user Enterprise system with granular departmental
permissions.

---

## 🛤️ Frontend Routes

**Folder Path:** `/apps/web/routes/(dashboard)/business/`

The routing for Businesses is designed to mirror the Teams structure, emphasizing the "Step-Ladder"
transition from solo client to organizational entity.

| Route Path                 | File Path                  | Description                                                                                                                                                                                                    |
| :------------------------- | :------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/business`                | `index.tsx`                | **Business Workspace**: a 70/30 split — a 30% glassmorphism roster panel (entity initials, name, `@handle`, tier + Draft badges) and a 70% operational overview (activity feed, quick-action widgets, org-health metrics). New businesses are created in-context via the `CreateBusinessModal` island (name + `@handle` only, entity starts Draft/Unverified). |
| `/business/[bid]`          | `[bid]/index.tsx`          | **Business Hub**: High-level view of projects, total spend, and active collaborators associated with the business.                                                                                            |
| `/business/[bid]/settings` | `[bid]/settings/index.tsx` | Management of business metadata, billing preferences, and department setup (Phase 3). Draft businesses complete their extended profile (branding, legal, billing) here.                                        |

---

## ⚡ API Endpoints

**Base Path:** `/api/v1/dashboard/business/`

These endpoints handle the lifecycle of business profiles and their internal hierarchical
structures.

| Endpoint        | Method   | Permission       | Description                                                                               |
| :-------------- | :------- | :--------------- | :---------------------------------------------------------------------------------------- |
| `/`             | `GET`    | (Auth)           | Fetches all business profiles associated with the user's primary identity.                |
| `/`             | `POST`   | (Auth)           | Creates a new Business profile and initializes the organizational context.                |
| `/[id]`         | `GET`    | (Auth)           | Returns detailed business information, including linked projects and financial summaries. |
| `/[id]/billing` | `PATCH`  | `ManageBilling`  | Updates corporate payment methods and invoicing details.                                  |
| `/[id]/delete`  | `DELETE` | `DeleteBusiness` | Permanently removes the business entity (requires ownership validation).                  |

---

## 🔒 Security & Logic

### Low-Friction, Draft-First Creation

The Businesses space no longer uses a standalone multi-step registration wizard. Creation happens
in-context via the `CreateBusinessModal` island, which requires only a display **Name** and a unique
alphanumeric **`@handle`** (slug). The `create_business` RPC persists these minimal fields and marks
the new entity **Draft/Unverified** (`status = 'draft'`). All extended metadata (branding, legal,
billing, members, financials) is deferred to `/business/[bid]/settings`.

### Operator-Mode Visibility

The **Businesses** tab in the left nav is gated by the account-level **Client / Operator Mode** flag
(`org.users_public.is_operator`, surfaced as `isOperator` via `getMe`/`UserContext`). The tab — and
this whole space — is hidden until the account opts into Operator Mode (`org.set_operator_mode`).

### Organizational Context

When a user selects a business via `/switch-profile`, the `security.session_context` is updated with
the `active_profile_id` corresponding to that business. This triggers RLS policies that filter
projects and financial data to only show what belongs to that specific organization.

### Future Multi-User Support (Phase 3)

The Business layer is designed to move beyond solo ownership by utilizing `BusinessPermission`
enums:

- **ManageTeamRoles**: Allows a business owner to invite "Client Admins" or "Project Managers" to
  help oversee the entity.
- **ManageBilling**: Restricts access to sensitive financial configuration to high-level
  stakeholders.

### Audit Integration

All administrative changes at the business level are recorded to ensure corporate accountability.

```json
{
	"action": "business.created",
	"entity_table": "profiles",
	"actor_profile_id": "creator_uuid",
	"metadata": {
		"business_name": "Acme Corp",
		"tier": "alpha_starter"
	}
}
```
