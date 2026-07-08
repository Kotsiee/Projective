# Features — Per-Epic Kanban

One Kanban per epic. Each lane holds features in that state; evidence pointers sit under each board.
Status is edited **in place** — move a feature between lanes, don't append notes.

---

## E0 · Platform Foundation & Security

| ⬜ Todo                                         | 🟡 In Progress                                     | ✅ Done                                                                    |
| :---------------------------------------------- | :------------------------------------------------- | :------------------------------------------------------------------------- |
| Departmental isolation (dept-scoped visibility) | Session context / active-profile propagation       | Row-level security & permission grants                                     |
|                                                 |                                                    | Main `/dashboard` — live Business Administration panel (US-008)            |
|                                                 |                                                    | Realtime infrastructure                                                    |
|                                                 |                                                    | Storage buckets & file security                                            |
|                                                 |                                                    | Notifications pipeline (writer + API + SSE inbox)                          |
|                                                 |                                                    | Shared package suite (ui, fields, data, charts, time, files, utils, types) |

_Evidence:_ `supabase/migrations/0200`–`0207`; notifications — `comms.fn_notify` (`0305`),
`api/v1/notifications` (list) + `.../notifications/stream` (SSE), `features/dashboard/inbox`
(`NotificationsInbox.island`); `/dashboard` — `features/dashboard/overview` (`DashboardOverview.island`),
`packages/*` (charts `AreaLineChart`, ui `TransactionLedger`/`StatusBadge`/`MetricCard`).

---

## E1 · Identity, Access & Onboarding

| ⬜ Todo | 🟡 In Progress | ✅ Done                                           |
| :------ | :------------- | :------------------------------------------------ |
|         |                | Email/password registration & login               |
|         |                | OAuth PKCE (Google, GitHub-gated)                 |
|         |                | Multi-persona onboarding (`/join`, email + OAuth) |
|         |                | Profile / team context switching                  |
|         |                | Email verification (`token_hash` + `verifyOtp`)   |
|         |                | Password recovery / reset                         |
|         |                | Logout, token refresh, `me` / `user`              |
|         |                | Onboarding session-context init                   |
|         |                | Onboarding audit logging                          |
|         |                | Onboarding avatar picker + upload                 |

_Evidence:_ `routes/(auth)/*`, `api/v1/auth/*` (incl. `switch-profile`, `switch-team`,
`complete-onboarding`); `features/auth/services/*Backend.ts`; `packages/backend/src/auth/pkce.ts`;
`provision_user_profile()` / deferred `handle_new_user()` / `complete_onboarding()` in
`supabase/migrations/0304_onboarding_session_and_audit.sql`; avatar upload —
`api/v1/files/avatar/{init,finalise}`,
`features/auth/components/onboarding/inputs/AvatarPicker.tsx`.

---

## E2 · Organizational Structures

| ⬜ Todo                                   | 🟡 In Progress                       | ✅ Done                                               |
| :---------------------------------------- | :----------------------------------- | :---------------------------------------------------- |
| Business RBAC (Owner/PM/Observer perms)   | Business member management (add/remove) | Team create / list / view                          |
| Team RBAC (Lead/Member/Contributor perms) | Two-entity workspace (frontend seed) | Team member management                                |
| Spending caps / budget controls           |                                      | Business admin dashboard — live balances, finance ledger, members (US-008) |
|                                           |                                      | Business profile management — legal name / logo / billing email (US-008 AC2) |
|                                           |                                      | Member visibility list (roles + seat state, US-008 AC5) |
|                                           |                                      | Business create / view / settings                     |
|                                           |                                      | Team Vault / Business Wallet init + `*.created` audit |
|                                           |                                      | Multi-business / team active-context switching        |

_Evidence:_ `routes/(dashboard)/business/*`, `.../teams/*`, `.../dashboard`; `api/v1/dashboard/business/*`
(`[id]` GET/PATCH, `[id]/finance`, `[id]/memebers`); `features/dashboard/overview`;
`migrations/0107,0110,0111,0209–0212,0301,0309`; context switch:
`features/auth/services/context.ts`; `features/public/workspace` (seed).

---

## E3 · Project & Stage Engine

| ⬜ Todo                             | 🟡 In Progress                          | ✅ Done                                                                         |
| :---------------------------------- | :-------------------------------------- | :------------------------------------------------------------------------------ |
| Session-based stage format          | CREATE-framework categorization         | Project draft save / publish                                                    |
| Industry-category taxonomy / picker | Deliverable-based stage format          | Stage CRUD (create/rename/edit/delete)                                          |
| Productised-service instantiation   | Ticket checklist model (frontend-only)  | Stage reorder                                                                   |
| One-off Gantt / timeline view       | Multi-freelancer roster (frontend-only) | Stage board (per-stage Kanban)                                                  |
|                                     |                                         | Submission ledger + review workflow                                             |
|                                     |                                         | Kanban↔submission sync (Review auto-creates submission)                         |
|                                     |                                         | Stage staffing: open seats + required skills + applications + atomic assignment |
|                                     |                                         | Stage workspace access control (stage-scoped chat/room)                         |
|                                     |                                         | Modular project creation (header + draft)                                       |
|                                     |                                         | Per-stage IP overrides + timeline sequencing                                    |

_Evidence:_ `api/v1/dashboard/projects/new/{save,publish}`, `.../stages/*`,
`.../stages/[id]/submissions/*`, `.../stages/[id]/seats/*`,
`.../stages/[id]/applications/[id]/assign`;
`services/{Projects,ProjectLifecycle,Stages,Submissions,Staffing}ServiceBackend.ts`;
`migrations/0101,0115–0122,0204,0303,0306–0308`. Staffing UI: the stage **Staffing** tab
(`[stageid]/staffing.tsx` → `StageStaffing` island) on `@projective/ui` RosterCard +
`@projective/fields` StatusSlider/Checkbox/ProgressBar. Checklist/roster seed:
`features/dashboard/projects/contracts/Submissions.ts`.

---

## E4 · Resource Allocation & Ticketing

| ⬜ Todo                                   | 🟡 In Progress                              | ✅ Done                                                               |
| :---------------------------------------- | :------------------------------------------ | :-------------------------------------------------------------------- |
| Claim TTL auto-release ("ticket parking") | Workload-intensity weighting engine         | Ticket lifecycle (create/edit/move/delete)                            |
| Round-Robin assignment mode               | Concurrency caps (project + global $W_i$)   | Claim-and-commit protocol                                             |
| Parallel-Stream assignment (one-offs)     | Cost/pricing model (frontend deterministic) | Ticket purchase ("Buy Now") + escrow lock                             |
|                                           |                                             | Manual assignment mode (accept application → assign)                  |
|                                           |                                             | Ticket reassign / force-complete-stage                                |
|                                           |                                             | Conflict-free assignment (no double-book on overlapping active slots) |
|                                           |                                             | Workload-intensity report (48h hidden loop)                           |

_Evidence:_ `api/v1/dashboard/projects/[pid]/tickets/*` (claim, complete, move, purchase, reassign,
report, finance, timeline), `.../stages/[id]/applications/[id]/assign` (manual assignment);
`migrations/0007,0115,0117,0121,0307`; pricing:
`features/dashboard/projects/contracts/new/ticketPricing.ts`.

---

## E5 · Hiring & Negotiation

| ⬜ Todo                               | 🟡 In Progress         | ✅ Done                          |
| :------------------------------------ | :--------------------- | :------------------------------- |
| Inbound proposals (freelancer-led)    | Basket / Cart checkout | "Buy Now" single-ticket purchase |
| Outbound invitations (client-led)     |                        |                                  |
| Soft→Hard budget counter-offer engine |                        |                                  |
| Open seats & per-seat negotiation     |                        |                                  |
| Invoicing checkout (KYB L3)           |                        |                                  |

_Evidence:_ Buy Now — `api/v1/dashboard/projects/[pid]/tickets/[id]/purchase.ts`; Cart —
`features/dashboard/cart` + `routes/(dashboard)/services/cart`. Negotiation: no backend present.

---

## E6 · Finance, Escrow & Wallets

| ⬜ Todo                                      | 🟡 In Progress                    | ✅ Done                                                |
| :------------------------------------------- | :-------------------------------- | :----------------------------------------------------- |
| Stripe payment intents / Connect             | Wallet Hub UI (frontend seed)     | Escrow hold / release engine                           |
| Stripe billing / customer portal             | Project-level finance rollup view | Team smart-split payouts                               |
| Intervaled invoicing (monthly consolidation) |                                   | 5% platform-fee ledger lines _(`platform_fee_bp`=500)_ |
| Withdrawal / payout-to-bank flow             |                                   | Fair-exit cancellation splits                          |
|                                              |                                   | Spending-limit & wallet credit/debit fns               |
|                                              |                                   | Consolidated-invoice generation fn                     |
|                                              |                                   | Stage funding / approval / fair-exit UI                |
|                                              |                                   | Ticket finance view (installment monitor)              |

_Evidence:_ `migrations/0009_finance_tables.sql` + `projects.*` wrappers (`0115,0117,0305`); stage
funding/approval/fair-exit — `projects.fund_stage`/`approve_stage`/`cancel_stage_fair_exit`
(`0305`), `api/v1/dashboard/projects/[pid]/stages/[sid]/{fund,approve,cancel,finance}`,
`StageFinance.island`; ticket finance — `.../tickets/[id]/finance`. Wallet Hub —
`features/dashboard/wallet` (seed). Stripe: `infra/stripe/README.md` only.

---

## E7 · Collaboration & Communications

| ⬜ Todo                            | 🟡 In Progress                          | ✅ Done                                                         |
| :--------------------------------- | :-------------------------------------- | :-------------------------------------------------------------- |
| PII filter / protected phase       | Channel architecture (stage + DM built) | Realtime messaging (channels/messages/subscribe)                |
| "Projective Unlock" handover state |                                         | Stage chat                                                      |
| Team private channels              |                                         | Stage-scoped workspace access control (assigned talent + owner) |
| Business private channels          |                                         | Project channel provisioning                                    |
|                                    |                                         | File library / upload / folders / access                        |
|                                    |                                         | Message attachments                                             |

_Evidence:_ `api/v1/dashboard/comms/channels/*`; `features/dashboard/messages`; `api/v1/files/*`,
`packages/files`; stage access — `projects.has_stage_access` gates the channel-open RPC + comms RLS
(`0308`); `migrations/0112,0113,0202,0206,0207,0208,0300,0308`.

---

## E8 · Discovery & Reputation

| ⬜ Todo                                     | 🟡 In Progress                            | ✅ Done                                         |
| :------------------------------------------ | :---------------------------------------- | :---------------------------------------------- |
| Reliability Index ($R_i$) computation       | Explore home hub (frontend seed)          | Search-ranking engine (pgvector + weighted RPC) |
| Availability-boost / workload-aware ranking | Reviews (schema built, UI mock)           | Federated + single-entity search RPC            |
| Reciprocal-review governance                | Public profile pages (frontend mock)      | Admin search weights & analytics                |
| "Architect" tier & discovery boost          | Premium search UI polish (glass cascade)  | Search telemetry (interest events, query logs)  |
| Client Trust Score & warning modal          |                                           | `/api/v1/*/search` routes                       |
|                                             |                                           | Search UI ↔ live engine (adapter + seed fallback) |

_Evidence:_ `migrations/0214,0216,0217–0220`; `api/v1/public/search/*`, `.../admin/search/*`;
`SearchEngineServiceBackend.ts`. Frontend wiring: `explore/services/{SearchService,scoredToExplore}.ts`,
`explore/contexts/ExploreContext.tsx` (`useLiveSearch`), `explore/components/search/*` (results read
context signals); Explore home hub + inspector still seed-backed (`features/public/explore/data`).

---

## E9 · Marketplace & IP Governance

| ⬜ Todo                             | 🟡 In Progress                             | ✅ Done |
| :---------------------------------- | :----------------------------------------- | :------ |
| Product listings & storefront       | _(marketplace schema scaffolding, `0215`)_ | —       |
| IP framework (Client-first default) |                                            |         |
| "Request to Sell" approval workflow |                                            |         |
| Shared-IP negotiation               |                                            |         |
| Royalties / revenue split on resale |                                            |         |
| IP audit trail / provenance linking |                                            |         |

_Evidence:_ `migrations/0215_marketplace.sql` (schema only). No products routes; search seed
explicitly omits products.

---

## E10 · Dispute Resolution

| ⬜ Todo                                  | 🟡 In Progress | ✅ Done                                     |
| :--------------------------------------- | :------------- | :------------------------------------------ |
| Evidence Vault (immutable snapshot)      | —              | Workload-intensity report loop (48h hidden) |
| Mutual-resolution / refund-offer tooling |                |                                             |
| Cooling-off period (48h)                 |                |                                             |
| Projective Auditor workflow              |                |                                             |
| Session no-show automated audit          |                |                                             |
| Dispute Summary PDF / reputation impact  |                |                                             |
| `/disputes` routes                       |                |                                             |

_Evidence:_ `migrations/0007` (`ticket_workload_reports`, `fn_open/resolve_workload_report`);
`api/v1/dashboard/projects/[pid]/tickets/[id]/report.ts`. No dispute UI or Evidence Vault.

---

## E11 · Sessions & Scheduling

| ⬜ Todo                               | 🟡 In Progress                        | ✅ Done |
| :------------------------------------ | :------------------------------------ | :------ |
| Proactive calendar & proposal flow    | Availability calendar (frontend mock) | —       |
| Availability windows (tz-converted)   | Stage calendar route (scaffold)       |         |
| Majority-consensus reschedule         |                                       |         |
| Digital Handshake (presence webhooks) |                                       |         |
| Session-based escrow (24h rule)       |                                       |         |
| Lesson-plan / tutoring vs advisory    |                                       |         |

_Evidence:_ `packages/time` (Calendar/Availability components, mock data via
`features/public/profile/data/mockProfile.ts`); `routes/.../[stageid]/calendar.tsx`. No session
backend or conferencing integration.

---

## E12 · Compliance, Taxes & Legal

| ⬜ Todo                                   | 🟡 In Progress | ✅ Done |
| :---------------------------------------- | :------------- | :------ |
| KYC tiers (L1 basic, L2 verified)         | —              | —       |
| KYB (L3 business verification)            |                |         |
| Automated tax docs (1099-K/NEC, W-9, VAT) |                |         |
| AML / fraud detection (round-trip, churn) |                |         |
| Sanctions screening                       |                |         |
| IP Transfer Deed generation               |                |         |
| Organization Audit Pack                   |                |         |
| `/legal` routes (audit-packs, transfers)  |                |         |

_Evidence:_ None implemented. `security` schema (`0205`) supplies audit primitives only; no
compliance feature code, no `/legal` route.
