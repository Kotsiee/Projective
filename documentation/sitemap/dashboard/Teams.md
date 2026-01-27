# (dashboard) Module: Teams

The Teams module facilitates organizational collaboration, allowing users to group profiles into
collective units for shared project management. It leverages the platform's multi-layered permission
system to manage roles, invitations, and access across organizations.

---

## 🛤️ Frontend Routes

**Folder Path:** `/apps/web/routes/(dashboard)/teams/`

The routing logic focuses on team discovery, formation, and granular management of team-specific
settings.

| Route Path        | File Path            | Description                                                                          |
| :---------------- | :------------------- | :----------------------------------------------------------------------------------- |
| `/teams`          | `index.tsx`          | Overview of all teams the user belongs to. Uses `DataDisplay` for list management.   |
| `/teams/new`      | `new/index.tsx`      | Creation flow for defining a new team entity and initial role setup.                 |
| `/teams/[teamid]` | `[teamid]/index.tsx` | **Team Hub**: Directs to specific team projects, member rosters, and activity feeds. |

### 🛡️ Team-Specific Protection

The `[teamid]/_middleware.ts` ensures that the user is an active member of the requested team before
granting access. It populates the `active_team_id` in the `security.session_context` to enable
team-scoped RLS policies.

---

## ⚡ API Endpoints

**Base Path:** `/api/v1/dashboard/teams/`

These endpoints manage the underlying relationships between profiles and team organizations.

| Endpoint        | Method  | Permission        | Description                                                          |
| :-------------- | :------ | :---------------- | :------------------------------------------------------------------- |
| `/`             | `GET`   | (Auth)            | Lists teams where the current profile is a member.                   |
| `/`             | `POST`  | (Auth)            | Initializes a new team and assigns the creator as the primary owner. |
| `/[id]/members` | `GET`   | (Auth)            | Fetches the full roster of profiles associated with the team.        |
| `/[id]/invite`  | `POST`  | `ManageMembers`   | Issues a new invitation to a profile via email or platform ID.       |
| `/[id]/roles`   | `PATCH` | `ManageTeamRoles` | Updates a member's internal team permissions and title.              |

---

## 🔒 Security & Logic

### Permission Hierarchy

Team management utilizes `BusinessPermission` and `ProjectPermission` enums to enforce authority.

- **ManageTeamRoles**: Essential for organizational leads to promote members to Admin status.
- **ManageMembers**: Allows team leads to add or remove personnel from the collective.

### Audit Integration

Modifying team structures or roles generates critical logs in `security.audit_logs`.

```json
{
	"action": "team.member_invited",
	"entity_table": "team_members",
	"actor_profile_id": "active_owner_uuid",
	"metadata": {
		"team_id": "target_team_uuid",
		"invited_profile_id": "invitee_uuid",
		"initial_role": "collaborator"
	}
}
```
