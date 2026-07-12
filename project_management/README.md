# Project Management — Projective

This directory is the **live status board** for the Projective platform. It is derived from a
codebase audit against the authoritative product spec (`documentation/business/brain.md` +
`brain2.md`) and reflects the **current implemented state of the repository**, not a plan or a
wishlist.

> **This is a state snapshot, not a log.** These files carry no changelog, no "recently done"
> section, and no dated history. When something changes, the status is edited **in place** and the
> old state is replaced. See the root `CLAUDE.md` for the sync rule that keeps this true.

## Files

| File                               | Level   | What it tracks                                                            |
| :--------------------------------- | :------ | :------------------------------------------------------------------------ |
| [EPICS.md](EPICS.md)               | Epic    | The 13 top-level product pillars and their overall status                 |
| [FEATURES.md](FEATURES.md)         | Feature | Every feature under each epic, on a per-epic Kanban                       |
| [USER_STORIES.md](USER_STORIES.md) | Story   | The 8 tracked technical user stories, with per-acceptance-criterion state |

## Status Legend

| Badge | Status                   | Meaning                                                                                                    |
| :---- | :----------------------- | :--------------------------------------------------------------------------------------------------------- |
| ✅    | **Done**                 | Implemented and wired end-to-end. For backend-only concerns, the backend is complete and exposed.          |
| 🟡    | **In Progress**          | Partially implemented — e.g. backend exists but UI is a frontend mock, or some acceptance criteria remain. |
| ⬜    | **Todo**                 | Specified in the brain docs but not started in code.                                                       |
| ⛔    | **Blocked / Deprecated** | Dead code slated for removal, or work blocked on an external dependency.                                   |

## How to Read the Boards

Each Kanban is a three-to-four-lane table. Left → right is **Todo → In Progress → Done** (with a
**Blocked/Deprecated** lane where relevant). An item lives in exactly one lane. Evidence pointers
(routes, services, SQL migrations) sit beneath each board so any status is auditable against the
tree.

## Master Epic Board

| ⬜ Todo                          | 🟡 In Progress                       | ✅ Done                               |
| :------------------------------- | :----------------------------------- | :------------------------------------ |
| E9 · Marketplace & IP Governance | E0 · Platform Foundation & Security  | E7 · Collaboration & Communications   |
| E10 · Dispute Resolution         | E1 · Identity, Access & Onboarding   |                                       |
| E11 · Sessions & Scheduling      | E2 · Organizational Structures       |                                       |
| E12 · Compliance, Taxes & Legal  | E3 · Project & Stage Engine          |                                       |
|                                  | E4 · Resource Allocation & Ticketing |                                       |
|                                  | E5 · Hiring & Negotiation            |                                       |
|                                  | E6 · Finance, Escrow & Wallets       |                                       |
|                                  | E8 · Discovery & Reputation          |                                       |

**Snapshot:** 1 epic done · 8 in progress · 4 todo. The platform's **transactional core** (auth,
projects, stages, tickets, escrow SQL engine, messaging, files, search) is materially built; the
**trust, commerce, and compliance layers** (disputes, marketplace, sessions, KYC/tax) are largely
unstarted. The **guest presentation shell** (glass navbar with live search + light/dark toggle,
global footer, cinematic landing page) is built, and the **Explore search UI now consumes the live
ranking engine** (`/api/v1/public/search`) with a seed fallback. The authenticated landing is now
the persona-adaptive **`/home`** engagement feed (recommended work + horizontal reels + sponsored
slots + insights/highlights, with profile-setup trackers), which **replaced the business-only
`/dashboard`**; the **business finance ledger** (US-008) still reads live balances, transaction
lines and escrow allocations from `finance.*` via `org.get_business_finance` (`0309`), though its
overview UI is pending relocation off the retired route. A new **Services management suite**
(`/services`) — productised listings, pricing-tier editing, and an ultra-luxury analytics
sub-section — plus a **workspace CRM** (client-roster filter tray + Projects⇄Services Pipeline
toggle) and **luxury sidebar quick-link submenus** ship as freelancer/team-facing UI; both are
**frontend seed** behind clean Service boundaries (E9 / E3). The remaining gap is that several mature
UIs (Wallet, Profile, the Explore **home hub**, Workspace, the new Services suite + workspace CRM,
Submissions checklist/roster) still render from **frontend seed data** rather than the live backend.

## Authoritative Sources

- **Product spec (source of truth):** `documentation/business/brain.md`, `brain2.md`
- **Route index:** `brain.md` §"Sitemap and Route Overview"
- **Database contracts:** `documentation/database/<schema>/{Tables,Functions,Policies}.md`
- **Migrations (implemented DB):** `supabase/migrations/`
