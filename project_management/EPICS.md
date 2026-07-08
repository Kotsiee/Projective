# Epics — Master Board

The thirteen product pillars of Projective, derived from `documentation/business/brain.md`. Each
epic's status is the roll-up of its features (see [FEATURES.md](FEATURES.md)). Status is edited in
place — no history is kept here.

## Board

| ⬜ Todo                              | 🟡 In Progress                           | ✅ Done |
| :----------------------------------- | :--------------------------------------- | :------ |
| **E9** · Marketplace & IP Governance | **E0** · Platform Foundation & Security  | —       |
| **E10** · Dispute Resolution         | **E1** · Identity, Access & Onboarding   |         |
| **E11** · Sessions & Scheduling      | **E2** · Organizational Structures       |         |
| **E12** · Compliance, Taxes & Legal  | **E3** · Project & Stage Engine          |         |
|                                      | **E4** · Resource Allocation & Ticketing |         |
|                                      | **E5** · Hiring & Negotiation            |         |
|                                      | **E6** · Finance, Escrow & Wallets       |         |
|                                      | **E7** · Collaboration & Communications  |         |
|                                      | **E8** · Discovery & Reputation          |         |

---

## E0 · Platform Foundation & Security — 🟡 In Progress

The cross-cutting substrate: RLS/permissions, realtime, storage, notifications, session context, and
the shared monorepo package suite.

- **Done:** Row-level security & permission grants (`0200`–`0206`), storage buckets (`0207`), the
  notifications pipeline (writer `comms.fn_notify`, list API + SSE stream, live inbox island), the
  design-system packages (`@projective/ui`, `fields`, `data`, `charts`, `time`, `files`, `utils`,
  `types`). Premium guest presentation shell: glassmorphism navbar (live search + spring
  light/dark `ThemeToggle` + ripple links), dense multi-column global footer, and a cinematic
  landing page (`routes/(public)/(index)`) built from atomic islands (parallax aurora-canvas hero,
  showcase rails) + static partials (value engine, escrow-loop explainer, reviews, stats, CTA).
  New shared primitives: `SearchInput` (`@projective/fields`), `ThemeToggle` + `RippleSurface` +
  premium gradient/glass/blur/elevation tokens (`@projective/ui`, `styles/themes/variables`).
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

- **Done:** Business & Team create/list/view/settings routes and member APIs; org-unit formation
  (US-002) fully wired — `org.create_business`/`org.create_team` persist branding + `bio`,
  initialise the finance wallet / Team Vault (`treasury_wallet_id`), write `business.created` /
  `team.created` audit rows, and the org context switch upserts `session_context` (`0110`, `0107`,
  `0111`, `0209`–`0212`, `0301`).
- **Done (US-008):** The Business Administration dashboard is live — `/dashboard` renders real-time
  wallet balances, an Area/Line volume chart and a filterable Transaction Ledger read straight from
  the `finance.*` ledger via `org.get_business_finance` (`0309`), plus the member visibility list and
  functional profile management (`org.update_business`). Every business wallet is seeded a one-time
  opening platform credit so escrow holds/releases post real ledger lines.
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
- **Gap:** Session-based stages, the industry-category taxonomy/picker, and the checklist model are
  frontend-only or unstarted.

## E4 · Resource Allocation & Ticketing — 🟡 In Progress

The claim-and-commit ticket state machine, workload-intensity weighting, concurrency caps, and
assignment modes.

- **Done:** Ticket lifecycle RPCs (claim/complete/move/purchase/reassign/report), the
  workload-report dispute loop, and **manual assignment** — accept a seat application → atomic,
  conflict-guarded `stage_assignment` (`0007`, `0115`, `0117`, `0121`, `0307`).
- **Gap:** The full weighting engine (global $W_i$ cap), Round-Robin / Parallel-Stream assignment
  modes, and claim TTL auto-release remain to build.

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

## E7 · Collaboration & Communications — 🟡 In Progress

The channel architecture, realtime chat, file sharing, and the PII "protected phase".

- **Done:** Realtime messaging (channels/messages/subscribe), stage chat, the file
  library/upload/access system, and **stage-scoped workspace access control** — the stage room is
  gated to the stage's assigned talent + client/owner via `projects.has_stage_access` (`0112`,
  `0113`, `0202`, `0206`–`0208`, `0300`, `0308`).
- **Gap:** Team/Business private channels, the PII filter, and the completed-project "handover"
  state are not built.

## E8 · Discovery & Reputation — 🟡 In Progress

The Explore engine, the Postgres search-ranking engine, reviews, and the Reliability Index.

- **Done:** Search-ranking engine — pgvector, weighted scoring RPC, admin weights, telemetry
  (`0214`, `0217`–`0220`) plus `/api/v1/*/search` routes; reviews schema (`0216`). The **search UI
  is wired to the live engine**: `SearchService` calls `GET /api/v1/public/search`, a
  `scoredToExplore` adapter maps ranked rows to `ExploreEntity`, and `useLiveSearch` (debounced,
  in `ExploreContext`) drives the federated + single-entity results, with the frontend seed kept as
  an instant-paint fallback when the backend returns empty.
- **Gap:** The Explore **home hub** (hero/categories/cinematic sections) still renders from the
  frontend seed; the Reliability Index computation, availability-boost ranking, and
  reciprocal-review governance are unstarted.

## E9 · Marketplace & IP Governance — ⬜ Todo

Digital storefront for templates/assets, the Client-first IP framework, request-to-sell, and
royalties.

- **Partial backend only:** a `marketplace` schema exists (`0215`); no products routes, no IP/
  request-to-sell/royalty logic, and the search seed explicitly excludes products.

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
