# 🗺️ Projective – Routes & Sitemap (Freelancers, Creators, Teams)

> Tech: **Deno Fresh 2.x**  
> Conventions:  
> - **Route Groups**: `(group-name)/` — folder name does **not** appear in the URL.  
> - **Slug**: `[param]`  
> - **Catch-all**: `[...path]`  
> - **Regex / Constraints**: put a `matchers.ts` next to the route to validate params (see examples).  
> - Auth-gated areas live under `(dashboard)/…` with a shared `_middleware.ts`.

---

## 🌍 Public

| URL Path | Page | Route File (apps/web/routes) | Notes |
|---|---|---|---|
| `/` | Home | `(public)/index.tsx` | Marketing landing |
| `/about` | About | `(public)/about.tsx` |  |
| `/explore` | Explore / Search | `(public)/explore/index.tsx` | Unified search hub |
| `/categories` | Categories | `(public)/categories/index.tsx` | List all |
| `/categories/[slug]` | Category detail | `(public)/categories/[slug].tsx` | **Matcher**: `slug=/^[a-z0-9-]+$/` |
| `/freelancers/[handle]` | Public freelancer profile | `(public)/freelancers/[handle].tsx` | **Matcher**: `handle=/^[a-z0-9_-]{3,32}$/` |
| `/teams/[slug]` | Public team profile | `(public)/teams/[slug].tsx` | Slug constrained via matcher |
| `/articles` | Articles directory | `(public)/articles/index.tsx` |  |
| `/templates` | Templates directory | `(public)/templates/index.tsx` |  |
| `/templates/[id]` | Template detail | `(public)/templates/[id].tsx` | UUID matcher |
| `/assets` | Marketplace (future) | `(public)/marketplace/index.tsx` |  |
| `/assets/[id]` | Asset page (future) | `(public)/marketplace/[id].tsx` | UUID matcher |
| `/pricing` | Pricing (future) | `(public)/pricing.tsx` |  |
| `/help` | Help / Support | `(public)/help/index.tsx` |  |
| `/help/[...path]` | Help article catch-all | `(public)/help/[...path].tsx` | MD/MDX renderer |
| `/terms` | Terms | `(public)/legal/terms.tsx` |  |
| `/privacy` | Privacy | `(public)/legal/privacy.tsx` |  |

---

## 🔐 Auth & Account

| URL Path | Page | Route File | Notes |
|---|---|---|---|
| `/login` | Login | `(auth)/login.tsx` |  |
| `/signup` | Signup | `(auth)/signup.tsx` |  |
| `/auth/verify/[token]` | Email verify | `(auth)/verify/[token].tsx` | **Matcher**: base64/uuid |
| `/auth/forgot-password` | Forgot | `(auth)/forgot-password.tsx` |  |
| `/auth/reset/[token]` | Reset | `(auth)/reset/[token].tsx` |  |
| `/setup` | Choose role | `(auth)/setup/index.tsx` |  |
| `/setup/freelancer` | Freelancer setup | `(auth)/setup/freelancer.tsx` |  |
| `/setup/creator` | Creator setup | `(auth)/setup/creator.tsx` |  |
| `/account` | User account (global) | `(dashboard)/account/index.tsx` | Security, profiles, emails, 2FA |
| `/switch-account` | Account switcher | `(dashboard)/switch-account.tsx` | Updates session context |

> `(dashboard)/_middleware.ts` enforces auth + injects session context (`active_profile_id`, `active_team_id`).

---

## 🧑‍🎨 Freelancer

| URL Path | Page | Route File | Notes |
|---|---|---|---|
| `/freelancer` | Redirect → dashboard | `(dashboard)/freelancer/index.tsx` |  |
| `/freelancer/dashboard` | Overview | `(dashboard)/freelancer/dashboard.tsx` |  |
| `/freelancer/projects` | My projects | `(dashboard)/freelancer/projects/index.tsx` |  |
| `/freelancer/projects/[id]` | Project workspace | `(dashboard)/freelancer/projects/[id]/index.tsx` | UUID |
| `/freelancer/projects/[id]/stage/[stageId]` | Stage details | `(dashboard)/freelancer/projects/[id]/stage/[stageId].tsx` | UUIDs |
| `/freelancer/messages` | Inbox | `(dashboard)/freelancer/messages/index.tsx` |  |
| `/freelancer/messages/[threadId]` | Thread | `(dashboard)/freelancer/messages/[threadId].tsx` |  |
| `/freelancer/teams` | Teams list | `(dashboard)/freelancer/teams/index.tsx` |  |
| `/freelancer/teams/create` | Create team | `(dashboard)/freelancer/teams/create.tsx` |  |
| `/freelancer/teams/[teamId]` | Team dashboard | `(dashboard)/freelancer/teams/[teamId]/index.tsx` | UUID |
| `/freelancer/teams/[teamId]/members` | Manage members | `(dashboard)/freelancer/teams/[teamId]/members.tsx` |  |
| `/freelancer/profile` | Edit profile | `(dashboard)/freelancer/profile/index.tsx` |  |
| `/freelancer/portfolio/new` | Add portfolio item | `(dashboard)/freelancer/portfolio/new.tsx` |  |
| `/freelancer/earnings` | Wallet & payouts | `(dashboard)/freelancer/earnings.tsx` |  |
| `/freelancer/notifications` | Notifications | `(dashboard)/freelancer/notifications.tsx` |  |
| `/freelancer/settings` | Settings | `(dashboard)/freelancer/settings.tsx` |  |

---

## 🧑‍🤝‍🧑 Teams (shared)

| URL Path | Page | Route File | Notes |
|---|---|---|---|
| `/teams/[teamId]` | Team dashboard | `(dashboard)/teams/[teamId]/index.tsx` |  |
| `/teams/[teamId]/projects` | Team projects | `(dashboard)/teams/[teamId]/projects/index.tsx` |  |
| `/teams/[teamId]/projects/[projectId]` | Team project | `(dashboard)/teams/[teamId]/projects/[projectId]/index.tsx` |  |
| `/teams/[teamId]/members` | Members | `(dashboard)/teams/[teamId]/members.tsx` |  |
| `/teams/[teamId]/settings` | Settings | `(dashboard)/teams/[teamId]/settings.tsx` |  |
| `/teams/[teamId]/analytics` | Analytics (future) | `(dashboard)/teams/[teamId]/analytics.tsx` |  |

---

## ✨ Creator (formerly Business)

| URL Path | Page | Route File | Notes |
|---|---|---|---|
| `/creator` | Redirect → dashboard | `(dashboard)/creator/index.tsx` |  |
| `/creator/dashboard` | Overview | `(dashboard)/creator/dashboard.tsx` |  |
| `/creator/projects` | All projects | `(dashboard)/creator/projects/index.tsx` |  |
| `/creator/projects/new` | New project | `(dashboard)/creator/projects/new.tsx` |  |
| `/creator/projects/new/template` | Guided creation | `(dashboard)/creator/projects/new-template.tsx` |  |
| `/creator/projects/[id]` | Project overview | `(dashboard)/creator/projects/[id]/index.tsx` |  |
| `/creator/projects/[id]/stage/[stageId]` | Stage view | `(dashboard)/creator/projects/[id]/stage/[stageId].tsx` |  |
| `/creator/messages` | Inbox | `(dashboard)/creator/messages/index.tsx` |  |
| `/creator/messages/[threadId]` | Thread | `(dashboard)/creator/messages/[threadId].tsx` |  |
| `/creator/wallet` | Payments & invoices | `(dashboard)/creator/wallet.tsx` |  |
| `/creator/settings` | Creator profile & billing | `(dashboard)/creator/settings.tsx` |  |
| `/creator/notifications` | Notifications | `(dashboard)/creator/notifications.tsx` |  |

---

## 🧱 Project Workspace (URL-based, role-agnostic)

These mirror deep-links that both roles can use; they live under `(dashboard)/projects` to keep logic centralized. Your role decides what controls render.

| URL Path | Page | Route File | Notes |
|---|---|---|---|
| `/projects/[id]` | Project dashboard | `(dashboard)/projects/[id]/index.tsx` |  |
| `/projects/[id]/stages` | Stages list | `(dashboard)/projects/[id]/stages.tsx` |  |
| `/projects/[id]/stage/[stageId]` | Stage details | `(dashboard)/projects/[id]/stage/[stageId].tsx` |  |
| `/projects/[id]/chat` | Project chat (general) | `(dashboard)/projects/[id]/chat/index.tsx` |  |
| `/projects/[id]/chat/[channelId]` | Channel view | `(dashboard)/projects/[id]/chat/[channelId].tsx` |  |
| `/projects/[id]/files` | File gallery | `(dashboard)/projects/[id]/files.tsx` |  |
| `/projects/[id]/activity` | Activity feed | `(dashboard)/projects/[id]/activity.tsx` |  |

---

## 💬 Global Messaging & Notifications

| URL Path | Page | Route File | Notes |
|---|---|---|---|
| `/messages` | Unified inbox | `(dashboard)/(comms)/messages/index.tsx` | Combines DMs + project threads |
| `/messages/[threadId]` | DM / group thread | `(dashboard)/(comms)/messages/[threadId].tsx` |  |
| `/notifications` | Notification center | `(dashboard)/(comms)/notifications.tsx` |  |

---

## 🧩 Templates (creator & freelancer)

| URL Path | Page | Route File | Notes |
|---|---|---|---|
| `/templates` | Browse (public) | `(public)/templates/index.tsx` |  |
| `/templates/[id]` | Detail (public) | `(public)/templates/[id].tsx` |  |
| `/dashboard/templates` | My templates | `(dashboard)/dashboard/templates/index.tsx` | owner view |
| `/dashboard/templates/create` | Create template | `(dashboard)/dashboard/templates/create.tsx` |  |
| `/dashboard/templates/[id]/edit` | Edit template | `(dashboard)/dashboard/templates/[id]/edit.tsx` |  |

---

## Articles (future)

| URL Path | Page | Route File | Notes |
|---|---|---|---|
| `/articles` | Browse (public) | `(public)/articles/index.tsx` |  |
| `/articles/[id]` | Detail (public) | `(public)/articles/[id].tsx` |  |
| `/dashboard/articles` | My article | `(dashboard)/dashboard/articles/index.tsx` | owner view |
| `/dashboard/articles/create` | Create article | `(dashboard)/dashboard/articles/create.tsx` |  |
| `/dashboard/articles/[id]/edit` | Edit article | `(dashboard)/dashboard/articles/[id]/edit.tsx` |  |

---

## 🛍️ Marketplace (future)

| URL Path | Page | Route File | Notes |
|---|---|---|---|
| `/marketplace` | Catalog | `(public)/marketplace/index.tsx` |  |
| `/marketplace/[id]` | Asset | `(public)/marketplace/[id].tsx` |  |
| `/dashboard/marketplace/upload` | Upload asset | `(dashboard)/dashboard/marketplace/upload.tsx` |  |
| `/dashboard/marketplace/sales` | My sales | `(dashboard)/dashboard/marketplace/sales.tsx` |  |
| `/dashboard/marketplace/purchases` | My purchases | `(dashboard)/dashboard/marketplace/purchases.tsx` |  |

---

## 💰 Finance

| URL Path | Page | Route File | Notes |
|---|---|---|---|
| `/wallet` | Wallet overview | `(dashboard)/finance/wallet/index.tsx` | Context-aware (profile/team) |
| `/transactions` | Transactions | `(dashboard)/finance/transactions.tsx` |  |
| `/invoices` | Invoices | `(dashboard)/finance/invoices/index.tsx` |  |
| `/invoices/[id]` | Invoice detail | `(dashboard)/finance/invoices/[id].tsx` |  |
| `/disputes` | Disputes | `(dashboard)/finance/disputes/index.tsx` |  |
| `/ratings` | Ratings & reviews | `(dashboard)/finance/ratings.tsx` |  |
| `/subscription` | Subscription (future) | `(dashboard)/finance/subscription.tsx` | Promoted listings mgmt later |

---

## 📊 Analytics (later)

| URL Path | Page | Route File |
|---|---|---|
| `/analytics/freelancer` | Freelancer insights | `(dashboard)/analytics/freelancer.tsx` |
| `/analytics/creator` | Creator insights | `(dashboard)/analytics/creator.tsx` |
| `/analytics/team` | Team insights | `(dashboard)/analytics/team.tsx` |

---

## ⚙️ Admin (internal)

| URL Path | Page | Route File |
|---|---|---|
| `/admin` | Dashboard | `(dashboard)/admin/index.tsx` |
| `/admin/users` | Users | `(dashboard)/admin/users.tsx` |
| `/admin/projects` | Projects | `(dashboard)/admin/projects.tsx` |
| `/admin/flags` | Moderation flags | `(dashboard)/admin/flags.tsx` |
| `/admin/emails` | Email queue | `(dashboard)/admin/emails.tsx` |
| `/admin/webhooks` | Webhooks | `(dashboard)/admin/webhooks.tsx` |
| `/admin/feature-flags` | Feature flags | `(dashboard)/admin/feature-flags.tsx` |

---

## 🔧 Matchers (Regex) — Examples

Create a `matchers.ts` next to any dynamic route to constrain params:

```ts
// apps/web/routes/(public)/freelancers/[handle].tsx
export const match = { handle: /^[a-z0-9_-]{3,32}$/i };

// apps/web/routes/(public)/templates/[id].tsx
export const match = { id: /^[0-9a-f-]{36}$/i }; // UUID v4 relaxed

// apps/web/routes/(dashboard)/projects/[id]/stage/[stageId].tsx
export const match = {
  id: /^[0-9a-f-]{36}$/i,
  stageId: /^[0-9a-f-]{36}$/i,
};
```

```text
apps/web/routes/
├─ (public)/
│  ├─ index.tsx
│  ├─ about.tsx
│  ├─ explore/index.tsx
│  ├─ categories/[slug].tsx
│  ├─ freelancers/[handle].tsx
│  ├─ teams/[slug].tsx
│  ├─ templates/[id].tsx
│  ├─ marketplace/[id].tsx
│  └─ help/[...path].tsx
├─ (auth)/
│  ├─ login.tsx
│  ├─ signup.tsx
│  ├─ verify/[token].tsx
│  ├─ forgot-password.tsx
│  ├─ reset/[token].tsx
│  └─ onboarding/{index.tsx, freelancer.tsx, creator.tsx}
├─ (dashboard)/
│  ├─ _middleware.ts
│  ├─ account/index.tsx
│  ├─ switch-account.tsx
│  ├─ freelancer/…
│  ├─ creator/…
│  ├─ teams/…
│  ├─ projects/…
│  ├─ comms/…
│  ├─ templates/…
│  ├─ finance/…
│  ├─ analytics/…
│  ├─ admin/…
│  └─ account/…
└─ _app.tsx
```