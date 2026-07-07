# Epics — Master Board

The thirteen product pillars of Projective, derived from `documentation/business/brain.md`. Each
epic's status is the roll-up of its features (see [FEATURES.md](FEATURES.md)). Status is edited in
place — no history is kept here.

## Board

| ⬜ Todo | 🟡 In Progress | ✅ Done |
| :--- | :--- | :--- |
| **E9** · Marketplace & IP Governance | **E0** · Platform Foundation & Security | — |
| **E10** · Dispute Resolution | **E1** · Identity, Access & Onboarding | |
| **E11** · Sessions & Scheduling | **E2** · Organizational Structures | |
| **E12** · Compliance, Taxes & Legal | **E3** · Project & Stage Engine | |
| | **E4** · Resource Allocation & Ticketing | |
| | **E5** · Hiring & Negotiation | |
| | **E6** · Finance, Escrow & Wallets | |
| | **E7** · Collaboration & Communications | |
| | **E8** · Discovery & Reputation | |

---

## E0 · Platform Foundation & Security — 🟡 In Progress
The cross-cutting substrate: RLS/permissions, realtime, storage, notifications, session context, and
the shared monorepo package suite.
- **Done:** Row-level security & permission grants (`0200`–`0206`), storage buckets (`0207`), the
  design-system packages (`@projective/ui`, `fields`, `data`, `charts`, `time`, `files`, `utils`, `types`).
- **Gap:** `security.session_context` / active-profile propagation and the notifications pipeline are
  only partially wired into the app.

## E1 · Identity, Access & Onboarding — 🟡 In Progress
Registration, login, OAuth, email verification, password recovery, and multi-persona onboarding.
- **Done:** Full auth flow — email/password, OAuth PKCE, `token_hash` confirm/recovery (`(auth)/*`
  routes, `api/v1/auth/*`, backend services).
- **Gap:** Onboarding (`/join`) does not yet initialise session context or write audit logs; KYC/KYB
  identity tiers are unstarted (those live in E12).

## E2 · Organizational Structures — 🟡 In Progress
Businesses and Freelancer Teams (the "Virtual Agency"), their membership, roles, and shared vaults.
- **Done:** Business & Team create/list/view/settings routes and member APIs; DB for businesses,
  teams, memberships (`0110`, `0111`, `0209`–`0212`, `0301`).
- **Gap:** Full RBAC role matrices (Owner/PM/Observer; Lead/Member/Contributor), workspace context
  switching, and business analytics dashboard are incomplete.

## E3 · Project & Stage Engine — 🟡 In Progress
Stage-based projects, the CREATE framework, the three work flows (One-Off / Pipeline / Session),
stage CRUD, and deliverable submissions.
- **Done:** Project draft/publish, stage CRUD + reorder, the stage board, and the submission
  ledger/review backend (`0115`–`0122`, `0204`, `0303`).
- **Gap:** Session-based stages, CREATE-driven IP overrides, and the checklist/roster models are
  frontend-only or unstarted.

## E4 · Resource Allocation & Ticketing — 🟡 In Progress
The claim-and-commit ticket state machine, workload-intensity weighting, concurrency caps, and
assignment modes.
- **Done:** Ticket lifecycle RPCs (claim/complete/move/purchase/reassign/report) and the
  workload-report dispute loop (`0007`, `0115`, `0117`, `0121`).
- **Gap:** The full weighting engine (global $W_i$ cap), Round-Robin / Parallel-Stream assignment
  modes, and claim TTL auto-release remain to build.

## E5 · Hiring & Negotiation — 🟡 In Progress
Discovery paths (proposals/invitations), soft/hard budget negotiation, open seats, and purchase
methods.
- **Done:** "Buy Now" ticket purchase and the Basket/Cart checkout UI.
- **Gap:** The proposal/invitation flow, soft→hard budget counter-offer engine, per-seat negotiation,
  and Invoicing checkout are unstarted.

## E6 · Finance, Escrow & Wallets — 🟡 In Progress
The escrow ledger engine, multi-persona wallets, platform fees, fair-exit splits, and invoicing.
- **Done:** The entire escrow/ledger/payout engine in Postgres — hold/release/split/spending-limit,
  5% fee, fair-exit logic (`0009` + `projects.*` wrappers).
- **Gap:** The Wallet Hub UI is **frontend-seed only**; Stripe (payment intents / Connect / billing
  portal) and Intervaled Invoicing are unstarted.

## E7 · Collaboration & Communications — 🟡 In Progress
The channel architecture, realtime chat, file sharing, and the PII "protected phase".
- **Done:** Realtime messaging (channels/messages/subscribe), stage chat, and the file
  library/upload/access system (`0112`, `0113`, `0202`, `0206`–`0208`, `0300`).
- **Gap:** Team/Business private channels, the PII filter, and the completed-project "handover" state
  are not built.

## E8 · Discovery & Reputation — 🟡 In Progress
The Explore engine, the Postgres search-ranking engine, reviews, and the Reliability Index.
- **Done:** Search-ranking engine — pgvector, weighted scoring RPC, admin weights, telemetry
  (`0214`, `0217`–`0220`) plus `/api/v1/*/search` routes; reviews schema (`0216`).
- **Gap:** Explore surfaces render from **frontend seed**, not the live engine; the Reliability Index
  computation, availability-boost ranking, and reciprocal-review governance are unstarted.

## E9 · Marketplace & IP Governance — ⬜ Todo
Digital storefront for templates/assets, the Client-first IP framework, request-to-sell, and royalties.
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
