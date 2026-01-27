# Sitemap: (auth) Domain

This documentation details the frontend routes and backend API endpoints dedicated to
authentication, onboarding, and identity management.

---

## 🛤️ Frontend Routes

**Folder Path:** `/apps/web/routes/(auth)/`

The `(auth)` group uses a shared `_layout.tsx` to provide a consistent branding experience (e.g.,
logo, background) and a `_middleware.ts` to redirect authenticated users away from login pages.

| Route Path         | File Path              | Description                                       |
| :----------------- | :--------------------- | :------------------------------------------------ |
| `/login`           | `login.tsx`            | Primary entry point for email/password and OAuth. |
| `/register`        | `register.tsx`         | New user account creation.                        |
| `/forgot-password` | `forgot-password.tsx`  | Initiates the recovery flow.                      |
| `/onboarding`      | `onboarding/index.tsx` | Multi-step persona selection and profile setup.   |
| `/reset/[token]`   | `reset/[token].tsx`    | Password reset destination from email link.       |
| `/verify`          | `verify/index.tsx`     | Email verification landing page.                  |

---

## ⚡ API Endpoints

**Base Path:** `/api/v1/auth/`

These endpoints bridge the frontend to the `auth` and `security` schemas in the database.

| Endpoint         | Method | Description                                                     |
| :--------------- | :----- | :-------------------------------------------------------------- |
| `email/`         | `POST` | Handles email-based registration and login logic.               |
| `google/`        | `GET`  | Initiates Google OAuth2 handshake.                              |
| `callback`       | `GET`  | Handles the redirection and token exchange from providers.      |
| `me`             | `GET`  | Returns the current user's identity and active session context. |
| `onboarding`     | `POST` | Saves initial `ProfileType` and creates the `session_context`.  |
| `switch-profile` | `POST` | Updates `active_profile_id` in `security.session_context`.      |
| `switch-team`    | `POST` | Sets the `active_team_id` for the current session.              |
| `refresh`        | `POST` | Issues a new session token without requiring credentials.       |
| `logout`         | `POST` | Revokes the current session and clears client cookies.          |

---

## 🔒 Security Logic

### Session Syncing

The `me` and `onboarding` endpoints are critical for populating the `security.session_context`
table. This state ensures that every subsequent request carries the correct `active_profile_id` for
RLS validation across the `projects` and `finance` schemas.

### Audit Integration

Every successful login or profile switch must trigger an entry in `security.audit_logs`.

```ts
// Example payload for security.audit_logs upon profile switch
{
  "user_id": "uuid",
  "action": "profile.switch",
  "actor_profile_id": "new_profile_uuid",
  "metadata": {
    "previous_profile": "old_profile_uuid",
    "type": "business"
  }
}
```
