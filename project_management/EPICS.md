# Epics — Master Board

The thirteen product pillars of Projective, derived from `documentation/business/brain.md`. Each
epic's status is the roll-up of its features (see [FEATURES.md](FEATURES.md)). Status is edited in
place — no history is kept here.

## Board

| ⬜ Todo                              | 🟡 In Progress                           | ✅ Done |
| :----------------------------------- | :--------------------------------------- | :------ |
| **E9** · Marketplace & IP Governance | **E0** · Platform Foundation & Security  | **E7** · Collaboration & Communications |
| **E10** · Dispute Resolution         | **E1** · Identity, Access & Onboarding   |         |
| **E11** · Sessions & Scheduling      | **E2** · Organizational Structures       |         |
| **E12** · Compliance, Taxes & Legal  | **E3** · Project & Stage Engine          |         |
|                                      | **E4** · Resource Allocation & Ticketing |         |
|                                      | **E5** · Hiring & Negotiation            |         |
|                                      | **E6** · Finance, Escrow & Wallets       |         |
|                                      | **E8** · Discovery & Reputation          |         |

---

## E0 · Platform Foundation & Security — 🟡 In Progress

The cross-cutting substrate: RLS/permissions, realtime, storage, notifications, session context, and
the shared monorepo package suite.

- **Done:** Row-level security & permission grants (`0200`–`0206`), storage buckets (`0207`), the
  notifications pipeline (writer `comms.fn_notify`, list API + SSE stream, live inbox island), the
  design-system packages (`@projective/ui`, `fields`, `data`, `charts`, `time`, `files`, `utils`,
  `types`). Premium guest presentation shell: glassmorphism navbar (live search + spring light/dark
  `ThemeToggle` + ripple links), dense multi-column global footer, and a cinematic landing page
  (`routes/(public)/(index)`) built from atomic islands (parallax aurora-canvas hero, showcase
  rails) + static partials (value engine, escrow-loop explainer, reviews, stats, CTA). New shared
  primitives: `SearchInput` (`@projective/fields`), `ThemeToggle` + `RippleSurface` + premium
  gradient/glass/blur/elevation tokens (`@projective/ui`, `styles/themes/variables`).
- **Gap:** `security.session_context` / active-profile propagation is only partially wired into the
  app.

## E1 · Identity, Access & Onboarding — 🟡 In Progress

Registration, login, OAuth, email verification, password recovery, and multi-persona onboarding.

- **Done:** Full auth flow — email/password, OAuth PKCE, `token_hash` confirm/recovery (`(auth)/*`
  routes, `api/v1/auth/*`, backend services). Onboarding (`/join`) provisions the profile,
  initialises `security.session_context` with the active profile and writes a `user.onboarded`
  `security.audit_logs` entry (US-001 complete). The email/password path provisions in the
  `handle_new_user()` trigger; first-time OAuth sign-ups (which arrive without a username) are
  created profile-less and finish via the `complete_onboarding()` RPC on `/join` — both share
  `provision_user_profile()`. Step 2 offers a circular avatar picker backed by the files pipeline.
- **Gap:** KYC/KYB identity tiers are unstarted (those live in E12).

## E2 · Organizational Structures — 🟡 In Progress

Businesses and Freelancer Teams (the "Virtual Agency"), their membership, roles, and shared vaults.

- **Done:** Business & Teams spaces redesigned into a 70/30 workspace (glass roster + operational
  overview) with in-context, draft-first creation — the `CreateBusinessModal` / `CreateTeamModal`
  islands capture only Name + `@handle` and the minimal-payload `org.create_business` /
  `org.create_team` RPCs create the entity in `status = 'draft'`, initialise the finance wallet /
  Team Vault (`treasury_wallet_id`), and write `business.created` / `team.created` audit rows
  (US-002 fully wired; extended metadata deferred to settings). The left-nav gates the surfaces:
  **Businesses** appears only under account-level **Client / Operator Mode** (`is_operator` /
  `org.set_operator_mode`) and **Teams** is freelancer-only. Org context switch upserts
  `session_context` (`0110`, `0107`, `0111`, `0209`–`0212`, `0301`,
  `20260709120000_business_teams_overhaul`).
- **Done (US-008 backend):** The business finance ledger is live — `org.get_business_finance`
  (`0309`) exposes real-time wallet balances, an Area/Line volume series and a filterable
  Transaction Ledger from `finance.*`, plus the member visibility list and functional profile
  management (`org.update_business`). Every business wallet is seeded a one-time opening platform
  credit so escrow holds/releases post real ledger lines. Its former `/dashboard` overview page is
  retired by the persona-adaptive `/home` feed; re-homing the finance surface is pending.
- **Now (Home):** `/home` replaces the business-only `/dashboard` as the authenticated landing — a
  persona-adaptive engagement feed (recommended projects/services/talent/teams from the discovery
  engine with seed fallback, horizontal reels, sponsored slots, personal insights + a live
  highlights strip) with profile-setup completeness trackers on the home hero, nav dropdown, and
  profile side rail.
- **Gap:** Full RBAC role matrices (Owner/PM/Observer; Lead/Member/Contributor), member add/remove,
  spending caps, and Stripe card attach (US-008 AC4, deferred) remain.

## E3 · Project & Stage Engine — 🟡 In Progress

Stage-based projects, the CREATE framework, the three work flows (One-Off / Pipeline / Session),
stage CRUD, and deliverable submissions.

- **Done:** Modular project creation (US-003) — draft/publish, project header (title, global IP
  mode, timeline preset), per-stage IP overrides + sequential dependencies persisted by
  `projects.create_project`, stage CRUD + reorder, the stage board, the submission ledger/review
  backend, and **stage staffing (US-004)** — open seats + required skills, freelancer/team
  applications, and atomic conflict-guarded assignment (`0101`, `0115`–`0122`, `0204`, `0303`,
  `0306`–`0308`).
- **Partial UI only (workspace CRM):** the Projects Workspace hub now carries a freelancer/team
  **workspace toggle** (Projects Workspace ⇄ Services Pipeline) and an elegant **CRM filter tray**
  that segments the client roster three ways — by client account, by specific service tier, and by
  distinct project contract. The live projects matrix stays the default body; engaging any filter (or
  the Services Pipeline tab) swaps in the filtered roster. All CRM state resets on SPA navigation;
  roster data is seed (`/api/v1/dashboard/workspace-crm`).
- **Gap:** Session-based stages, the industry-category taxonomy/picker, and the checklist model are
  frontend-only or unstarted.

## E4 · Resource Allocation & Ticketing — 🟡 In Progress

The claim-and-commit ticket state machine, workload-intensity weighting, concurrency caps, and
assignment modes.

- **Done:** Ticket lifecycle RPCs (claim/complete/move/purchase/reassign/report); the full
  **automation engine** (`0310`) — claim-TTL auto-release ("ticket parking", refunding the client on
  a parked claim), the global + per-stage $W_i$ **concurrency caps** enforced on every
  claim/assignment, and all four **assignment modes** (open-pull self-claim, round-robin
  lowest-$W_i$, manual pin, parallel-stream fan-out); the workload-report dispute loop wired
  end-to-end (assignee "flag mismatch" micro-interaction → `file_workload_report`); and the
  **Workload Capacity Gauge** (`packages/charts`) consumed in the staffing panel + profile meta
  (`0007`, `0115`, `0117`, `0121`, `0307`, `0310`).
- **Gap:** The cost/pricing model ($W_i$ = category × difficulty) is still computed
  **frontend-only** (`ticketPricing.ts`); the ticket's stored `workload_intensity` is client-set,
  not derived from a backend category taxonomy.

## E5 · Hiring & Negotiation — 🟡 In Progress

Discovery paths (proposals/invitations), soft/hard budget negotiation, open seats, and purchase
methods.

- **Done:** "Buy Now" ticket purchase and the Basket/Cart checkout UI.
- **Gap:** The proposal/invitation flow, soft→hard budget counter-offer engine, per-seat
  negotiation, and Invoicing checkout are unstarted.

## E6 · Finance, Escrow & Wallets — 🟡 In Progress

The escrow ledger engine, multi-persona wallets, platform fees, fair-exit splits, and invoicing.

- **Done:** The entire escrow/ledger/payout engine in Postgres — hold/release/split/spending-limit,
  5% fee (`platform_fee_bp`=500), fair-exit split logic (`0009` + `projects.*` wrappers, `0305`).
  The **stage funding & payout loop is UI-wired**: the Finance tab funds/approves/fair-exit-cancels
  a stage via `projects.fund_stage`/`approve_stage`/`cancel_stage_fair_exit` against pre-loaded
  wallets.
- **Gap:** The Wallet Hub UI is **frontend-seed only**; Stripe (payment intents / Connect / billing
  portal) and Intervaled Invoicing are unstarted.

## E7 · Collaboration & Communications — ✅ Done

The channel architecture, realtime chat, file sharing, the PII "protected phase", and the project
handover.

- **Done:** Realtime messaging (channels/messages/subscribe), stage chat, the file
  library/upload/access system, **stage-scoped workspace access control** (`projects.has_stage_access`),
  **Team & Business private channels** — a stage room splits into General / Team / Business scopes via
  `comms.can_access_scope` + `comms.has_channel_access`, enforced by comms RLS so a private channel
  never leaks over the realtime WAL stream, the **anti-disintermediation PII filter & protected phase**
  (`comms.mask_pii` BEFORE-INSERT trigger gated by `projects.is_protected_phase`, mirrored by the
  `@projective/backend` `PIIFilter`), and the **"Projective Unlock" handover state**
  (`projects.handover_unlocked_at`, fired when the final escrow releases in `projects.approve_stage`) —
  which lifts the PII filter and unlocks the full file library. New shared UI: `ChannelTabs`,
  `PiiNotice`, `FileHandoverCard` (`@projective/ui`) + `HandoverLibrary` (`packages/files`) (`0112`,
  `0113`, `0202`, `0206`–`0208`, `0300`, `0308`, `0311`).

## E8 · Discovery & Reputation — 🟡 In Progress

The Explore engine, the Postgres search-ranking engine, reviews, and the Reliability Index.

- **Done:** Search-ranking engine — pgvector, weighted scoring RPC, admin weights, telemetry
  (`0214`, `0217`–`0220`) plus `/api/v1/*/search` routes; reviews schema (`0216`). The **search UI
  is wired to the live engine**: `SearchService` calls `GET /api/v1/public/search`, a
  `scoredToExplore` adapter maps ranked rows to `ExploreEntity`, and `useLiveSearch` (debounced, in
  `ExploreContext`) drives the federated + single-entity results, with the frontend seed kept as an
  instant-paint fallback when the backend returns empty.
- **Gap:** The Explore **home hub** (hero/categories/cinematic sections) still renders from the
  frontend seed; the Reliability Index computation, availability-boost ranking, and
  reciprocal-review governance are unstarted.

## E9 · Marketplace & IP Governance — ⬜ Todo

Digital storefront for templates/assets, the Client-first IP framework, request-to-sell, and
royalties.

- **Partial backend only:** a `marketplace` schema exists (`0215`); no products routes, no IP/
  request-to-sell/royalty logic, and the search seed explicitly excludes products.
- **Partial UI only:** a frontend-seed **Services management suite** (`/services`) — an executive
  dashboard where freelancers/teams create productised service listings, edit pricing tiers, and
  activate/pause active listings, alongside an ultra-luxury **analytics sub-section** (page views,
  conversion, active pipeline value, engagement trends) rendered with `@projective/charts`. The
  primary nav carries a persona-gated (`requires: 'freelancer'` ⇒ freelancer **or** team) **Services**
  entry with a lazy, luxurious quick-link submenu of recent/favorited listings. All data is seed
  behind `ServicesServiceBackend` + `/api/v1/navigation/quick-links`; no `services.*` backend exists.

## E10 · Dispute Resolution — ⬜ Todo

Evidence Vault, the tiered resolution lifecycle, the Projective Auditor, and no-show audits.

- **Partial backend only:** the workload-intensity report loop exists (`0007`); there is no
  `/disputes` route, Evidence Vault, cooling-off/settlement tooling, or auditor workflow.

## E11 · Sessions & Scheduling — ⬜ Todo

The proactive calendar, availability windows, session-based escrow (24-hour rule), and the Digital
Handshake presence verification.

- **Partial UI only:** the availability calendar exists as a **frontend mock** (`@projective/time`);
  the proposal flow, conferencing webhooks, and session escrow are unstarted.

## E12 · Compliance, Taxes & Legal — ⬜ Todo

KYC/KYB tiers, automated tax documents, AML/fraud detection, and IP transfer deeds / audit packs.

- **Not started:** no `/legal` route, no verification tiers, no tax/AML/deed generation. The
  `security` schema provides audit primitives but none of the compliance features.
