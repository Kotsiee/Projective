# Features — Per-Epic Kanban

One Kanban per epic. Each lane holds features in that state; evidence pointers sit under each board.
Status is edited **in place** — move a feature between lanes, don't append notes.

---

## E0 · Platform Foundation & Security

| ⬜ Todo                                         | 🟡 In Progress                               | ✅ Done                                                                    |
| :---------------------------------------------- | :------------------------------------------- | :------------------------------------------------------------------------- |
| Departmental isolation (dept-scoped visibility) | Session context / active-profile propagation | Row-level security & permission grants                                     |
|                                                 |                                              | Main `/dashboard` — live Business Administration panel (US-008)            |
|                                                 |                                              | Realtime infrastructure                                                    |
|                                                 |                                              | Storage buckets & file security                                            |
|                                                 |                                              | Notifications pipeline (writer + API + SSE inbox)                          |
|                                                 |                                              | Shared package suite (ui, fields, data, charts, time, files, utils, types) |

_Evidence:_ `supabase/migrations/0200`–`0207`; notifications — `comms.fn_notify` (`0305`),
`api/v1/notifications` (list) + `.../notifications/stream` (SSE), `features/dashboard/inbox`
(`NotificationsInbox.island`); `/dashboard` — server-rendered route
(`routes/(dashboard)/dashboard/index.tsx` loads finance + members via
`BusinessOverviewServiceBackend` and renders `features/dashboard/overview` as static server
components; only `FinanceChart.island` + `RefreshButton.island` hydrate, refresh via Fresh
Partial), `packages/*` (charts `AreaLineChart`, ui `TransactionLedger`/`StatusBadge`/`MetricCard`).

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

| ⬜ Todo                                   | 🟡 In Progress                          | ✅ Done                                                                      |
| :---------------------------------------- | :-------------------------------------- | :--------------------------------------------------------------------------- |
| Business RBAC (Owner/PM/Observer perms)   | Business member management (add/remove) | Draft-first entity creation (name + `@handle`, modal, draft status)          |
| Team RBAC (Lead/Member/Contributor perms) | Two-entity workspace (frontend seed)    | Business / Teams 70/30 workspace index (glass roster + operational overview) |
| Spending caps / budget controls           |                                         | Dynamic nav gating — Businesses (Operator Mode) / Teams (freelancer-only)    |
|                                           |                                         | Team create / view                                                           |
|                                           |                                         | Team member management                                                       |
|                                           |                                         | Business admin dashboard — live balances, finance ledger, members (US-008)   |
|                                           |                                         | Business profile management — legal name / logo / billing email (US-008 AC2) |
|                                           |                                         | Member visibility list (roles + seat state, US-008 AC5)                      |
|                                           |                                         | Business create / view / settings                                            |
|                                           |                                         | Team Vault / Business Wallet init + `*.created` audit                        |
|                                           |                                         | Multi-business / team active-context switching                               |

_Evidence:_ `routes/(dashboard)/business/index.tsx` + `teams/index.tsx` render the 70/30 workspace
(shared `features/dashboard/shared/components/EntityWorkspace.tsx`; `BusinessWorkspace.island` /
`TeamsWorkspace.island` — the old `BusinessList.island` / `TeamsList.island` + `BusinessCard` /
`TeamCard` search-grid are removed). Creation is in-context: `CreateBusinessModal.island` /
`CreateTeamModal.island` capture only Name + `@handle` (relaxed Zod in
`features/dashboard/{business,teams}/contracts/new/_validation.ts`) and call the minimal-payload
`create_business` / `create_team` RPCs, which default the entity to `status = 'draft'`
(the standalone `/business/new` + `/teams/new` wizard routes/islands are deleted). `[businessid]/settings`
still server-loads `getBusinessAdminProfile` and completes the deferred profile. Nav gating —
`features/navigation/contracts/navigation.ts` + `components/side/side.tsx` show **Businesses** only
when `isOperator` (account-level `org.users_public.is_operator`, surfaced via `getMe`/`UserContext`)
and **Teams** only when `activeProfileType === 'freelancer'`. New primitives: `@projective/fields`
`HandleField`; `@projective/ui` `GlassPanel` / `QuickActionCard` / `ActivityFeed` / `EntityRoster` /
`MetricPlaceholder`. `api/v1/dashboard/business/*` (`[id]` GET/PATCH, `[id]/finance`,
`[id]/memebers`); `features/dashboard/overview`;
`migrations/0107,0110,0111,0209–0212,0301,0309,20260709120000_business_teams_overhaul` (`is_operator`
+ `status`/tier surfacing + `set_operator_mode` + minimal-payload create RPCs); context switch:
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
`migrations/0101,0115–0122,0204,0303,0306–0308`. Stage shell: `[stageid]/_layout.tsx` server-loads
the stage (`ProjectsBackendService.getStage`) and seeds it into `StageLayout.island`'s `StageProvider`
as `initialStage`, so every tab paints without the first-load "Loading…" flash (provider keeps
`refresh()` + falls back to a client fetch). The **Finance** (`getStageFinance`), **Staffing**
(`getStageStaffing`), **Files** (`getStage`→`getFiles`→`parseStageFiles`) and **Submissions**
(`SubmissionsServiceBackend.listForStage` → `SubmissionsProvider initialSubmissions`) tabs each
additionally server-hydrate their own payload — client-side actions/filtering/mutations stay
interactive. Staffing UI: the stage **Staffing** tab
(`[stageid]/staffing.tsx` server-loads the roster via `StaffingServiceBackend.getStageStaffing` and
passes it to the `StageStaffing` island as `initialData` — no client fetch on mount) on
`@projective/ui` RosterCard +
`@projective/fields` StatusSlider/Checkbox/ProgressBar. Checklist/roster seed:
`features/dashboard/projects/contracts/Submissions.ts`.

---

## E4 · Resource Allocation & Ticketing

| ⬜ Todo | 🟡 In Progress                              | ✅ Done                                                                |
| :------ | :------------------------------------------ | :--------------------------------------------------------------------- |
| —       | Cost/pricing model (frontend deterministic) | Ticket lifecycle (create/edit/move/delete)                             |
|         |                                             | Claim-and-commit protocol                                              |
|         |                                             | Ticket purchase ("Buy Now") + escrow lock                              |
|         |                                             | Concurrency caps — global + per-stage $W_i$ validation on claim/assign |
|         |                                             | Claim TTL auto-release ("ticket parking", client-refunded)             |
|         |                                             | Round-Robin assignment (next ticket → lowest-$W_i$ member)             |
|         |                                             | Parallel-Stream assignment (one-off fan-out across the roster)         |
|         |                                             | Manual assignment mode (owner pin / accept application → assign)       |
|         |                                             | Assignment-mode picker + auto-assign trigger (stage Staffing tab)      |
|         |                                             | Ticket reassign / force-complete-stage                                 |
|         |                                             | Conflict-free assignment (no double-book on overlapping active slots)  |
|         |                                             | Workload-intensity report loop + assignee "flag mismatch" UI           |
|         |                                             | Workload Capacity Gauge (`packages/charts`) — staffing                 |

_Evidence:_ `api/v1/dashboard/projects/[pid]/tickets/*` (claim, complete, move, purchase, reassign,
report, finance, timeline), `.../[pid]/workload` (gauge capacity feed),
`.../stages/[id]/{assignment-mode,auto-assign}` (routing picker + trigger),
`.../stages/[id]/applications/[id]/assign` (manual assignment); automation engine —
`migrations/0310` (`fn_release_expired_claims`, `check_ticket_capacity`, `get_workload_capacity`,
`assignment_routing_mode` + `set_stage_assignment_mode` + `auto_assign_round_robin` /
`assign_parallel_stream` / `assign_ticket_manual`, `file_workload_report`; mode surfaced via
`get_stage_details`) over `migrations/0007,0104,0115,0117,0121,0307`; gauge — `packages/charts`
`WorkloadCapacityGauge`, consumed in `StageStaffingPanel`; routing picker —
`StageStaffingPanel`; dispute UI — `WorkloadReportMenu`; pricing:
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
`StageFinance.island` (its route server-loads the snapshot via `StagesServiceBackend.getStageFinance`
into `initialData` — the tab paints instantly, actions stay client-side); ticket finance —
`.../tickets/[id]/finance`. Wallet Hub —
`features/dashboard/wallet`; seed (`walletSeed.ts`) is owned by the server layout
(`routes/(dashboard)/wallet/_layout.tsx`) and passed to the persistent `WalletShell.island` as
`initialData` props (out of the client bundle), swap the constant for a Service when the wallet
backend lands. Stripe: `infra/stripe/README.md` only.

---

## E7 · Collaboration & Communications

| ⬜ Todo | 🟡 In Progress | ✅ Done                                                         |
| :------ | :------------- | :-------------------------------------------------------------- |
|         |                | Realtime messaging (channels/messages/subscribe)                |
|         |                | Stage chat                                                      |
|         |                | Stage-scoped workspace access control (assigned talent + owner) |
|         |                | Project channel provisioning                                    |
|         |                | File library / upload / folders / access                        |
|         |                | Message attachments                                             |
|         |                | Team & Business private channels (scoped RLS, tabbed UI)        |
|         |                | Anti-disintermediation PII filter / protected phase             |
|         |                | "Projective Unlock" handover state + file-library downloader    |

_Evidence:_ `api/v1/dashboard/comms/channels/*` (incl. `channels/stage/[stageid]`);
`features/dashboard/messages`; `api/v1/files/*`, `packages/files`; scoped-channel access —
`comms.can_access_scope` / `comms.has_channel_access` gate the channel-open RPC + comms RLS; PII —
`comms.mask_pii` BEFORE-INSERT trigger gated by `projects.is_protected_phase`, mirrored by
`@projective/backend` `PIIFilter`; handover — `projects.handover_unlocked_at` set in
`projects.approve_stage`; shared UI `ChannelTabs` / `PiiNotice` / `FileHandoverCard` / `HandoverLibrary`;
tests `tests/communications_e7.test.ts`; `migrations/0112,0113,0202,0206,0207,0208,0300,0308,0311`.

---

## E8 · Discovery & Reputation

| ⬜ Todo                                     | 🟡 In Progress                           | ✅ Done                                           |
| :------------------------------------------ | :--------------------------------------- | :------------------------------------------------ |
| Reliability Index ($R_i$) computation       | Explore home hub (frontend seed)         | Search-ranking engine (pgvector + weighted RPC)   |
| Availability-boost / workload-aware ranking | Reviews — profile tab UI (frontend mock) | Federated + single-entity search RPC              |
| Reciprocal-review governance                | Public profile pages (frontend mock)     | Admin search weights & analytics                  |
| "Architect" tier & discovery boost          | Premium search UI polish (glass cascade) | Search telemetry (interest events, query logs)    |
| Client Trust Score & warning modal          |                                          | `/api/v1/*/search` routes                         |
|                                             |                                          | Search UI ↔ live engine (adapter + seed fallback) |

_Evidence:_ `migrations/0214,0216,0217–0220`; `api/v1/public/search/*`, `.../admin/search/*`;
`SearchEngineServiceBackend.ts`. Frontend wiring:
`explore/services/{SearchService,scoredToExplore}.ts`, `explore/contexts/ExploreContext.tsx`
(`useLiveSearch`), `explore/components/search/*` (results read context signals); Explore home hub +
inspector still seed-backed (`features/public/explore/data`). Public profile surface
(`features/public/profile`) — seed-backed (`data/mockProfile.ts`), Explore-standardised entity cards
(shared `@projective/ui` `ServiceCard`/`ProjectCard`/`ProfileCard`, grid-locked, bookmark save icon),
custom `@projective/ui` `NavTabs` bar with hash routing (`#services`…#`reviews`), shared-Accordion
project groups, a live **Reviews** tab reachable from the meta-sidebar rating badges, an owner
Editor-Mode suite (Details/Services/Projects/Portfolio/Teams/Experience/Education/Members/Settings/
Availability modules via `EntityControlCenter` add/hide-show + tab-visibility toggles), and a
re-engineered side rail persisting collapse to `localStorage` (`profile_sidebar_collapsed`,
auto-expands on edit).

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

_Evidence:_ `migrations/0007` (`ticket_workload_reports`, `fn_open/resolve_workload_report`) +
`projects.file_workload_report` (`0310`); `api/v1/dashboard/projects/[pid]/tickets/[id]/report.ts`;
the assignee "flag mismatch" micro-interaction (`WorkloadReportMenu`) is wired. No Evidence Vault,
cooling-off/settlement tooling, or auditor workflow.

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
`features/public/profile/data/mockProfile.ts`); `routes/.../[stageid]/calendar.tsx`. The calendar
engine ships a premium interaction layer: a **boundless** (truly infinite, both directions) virtual
viewport with bounce-snap settling (½-hour on day/week, week-row in month); a custom velocity
scrollbar (`useViewportScroll`) whose thumb rests centred at 50%, shrinks/drifts with scroll
velocity, and acts as a drag-to-accelerate jog control (displacement → continuous scroll speed);
that scrollbar doubles as a **Schedule Minimap** (`TimelineScrollbar`) — ultra-thin
Available / Reserved / Unavailable ticks + a current-time anchor mapped from a window around the
viewport; plus middle-mouse grab-pan, a midnight/multi-day demarcation band, and a "return to
present" teleport (`PresentButton`). External profile viewers are privacy-masked (`masked` prop):
booked activity collapses to anonymous **Reserved** blocks. No session backend or conferencing
integration.

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
