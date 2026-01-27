# Selected Codebase Context

> Included paths: ./documentation

## Project Tree (Selected)

```text
./documentation/
  documentation/
  business/
  features.md
  governance-ip.md
  investor-summary.md
  market-analysis.md
  monetization.md
  payout.md
  README.md
  roadmap.md
  tech-stack.md
  vision.md
  database/
  analytics/
  Functions.md
  Policies.md
  Tables.md
  comms/
  Functions.md
  Policies.md
  Tables.md
  files/
  Functions.md
  Policies.md
  Storage.md
  Tables.md
  finance/
  Functions.md
  Policies.md
  Tables.md
  integrations/
  Functions.md
  Policies.md
  Tables.md
  marketplace/
  Functions.md
  Policies.md
  Tables.md
  ops/
  Functions.md
  Policies.md
  Tables.md
  org/
  Functions.md
  Policies.md
  Tables.md
  projects/
  Functions.md
  Policies.md
  Tables.md
  README.md
  Schemas.md
  search/
  Functions.md
  Policies.md
  Tables.md
  security/
  Functions.md
  Policies.md
  Tables.md
  packages/
  data/
  ChatList.md
  DataDisplay.md
  DataSource.md
  README.md
  UseVirtual.md
  fields/
  ComboboxField.md
  DateField.md
  FileDrop.md
  Hooks_Wrappers.md
  README.md
  RichTextField.md
  SelectField.md
  SliderField.md
  TextField.md
  TimeField.md
  README.md
  types/
  README.md
  ui/
  Accordion.md
  README.md
  Splitter.md
  Stepper.md
  Toast.md
  README.md
  sitemap/
  Auth.md
  dashboard/
  Business.md
  Communications.md
  Projects.md
  README.md
  Teams.md
  public/
  README.md
```

## File Contents

### File: documentation\business\features.md

```md
# Features Overview: A Multi-Persona Ecosystem

Projective is designed to provide specific value to four core user roles: **Business Entities**,
**Business Clients**, **Freelancers**, and **Freelancer Teams**. The platform facilitates a seamless
transition from discovery to delivery through structured collaboration, predictable pricing, and
tiered organizational management.

## 1. Features for Business Entities & Clients

Businesses use Projective to reduce the overhead of managing fragmented talent and to gain
transparency into project progress.

- **Business Layer Organization**: Establish a "Business" profile to act as a structured management
  layer for grouping complex projects.
- **Step-Ladder Growth**: Transition from a single-user business to an Enterprise account with
  multi-user access and departmental scoping.
- **Guided Project Templates**: Start projects using predefined templates that automatically
  populate required stages and suggested budgets.
- **Modular Hiring**: Hire a mix of individual freelancers and full teams within the same project,
  assigning different providers to different stages as needed.
- **Stage-Based Budgeting**: Fund escrows one stage at a time, where funds are only released upon
  approval of specific stage deliverables.
- **Unified Workspace**: Access a central hub for each project stage containing real-time chat, file
  sharing, and version-tracked submissions.
- **Multi-Account Switching**: Manage multiple brands or company profiles from a single login
  session using the active profile context.

## 2. Features for Freelancers

Projective empowers individuals to showcase their expertise and collaborate without the
administrative burden of traditional agency setups.

- **Dynamic Portfolios**: Showcase previous work and link it to specific skills for better
  discoverability, with configurable display rights.
- **Stage-Based Pricing**: Define fixed-stage budgets, including specific pricing for minor tweaks
  vs. major revisions.
- **Account Flexibility**: Act as an individual freelancer on one project while being an active
  member of several teams on others.
- **Income Smoothing (Phase 2)**: Utilize the AI-driven "Income Smoother" wallet to stabilize
  monthly payouts during fluctuating earning cycles.
- **Digital Storefront (Phase 2)**: Sell templates, code snippets, or assets directly on your
  profile with customizable IP licensing.

## 3. Features for Freelancer Teams

Teams on Projective function as "micro-agencies," offering businesses the reliability of an agency
with the agility of freelancers.

- **Team Formation**: Create a collective profile with a shared portfolio and branding.
- **Internal Role Management**: Define internal roles and manage task distribution within the team
  room.
- **Collective Revenue Sharing**: Transparently manage how stage payments are distributed among team
  members based on pre-set agreements.
- **Team Visibility Control**: Set the team to 'Public' for discovery, 'Unlisted', or 'Invite-Only'
  for private collaborations.

## 4. Platform-Wide Capabilities

These core system features ensure security, trust, and efficiency across all interactions.

- **IP Ownership Modes**: Choose between "Exclusive Transfer," "Licensed Use," "Shared Ownership,"
  or "Projective Partner" for stage deliverables.
- **Moderated Dispute Resolution**: Access a formal dispute workflow where funds are locked until a
  resolution is reached via moderator intervention.
- **Real-time Collaboration**: WebSocket-powered chat and activity feeds ensure all participants
  stay updated on project changes.
- **Secure File Handling**: Files are classified by category and processed through an asynchronous
  pipeline for optimization and security.

````text // Feature Priority Matrix MVP (Alpha): Core Hiring, Businesses & Teams, Escrow, Stage
Rooms, RLS Security. Phase 2: Marketplace, AI Income Smoothing, Reviews, Disputes. Phase 3+:
Multi-user Business Departments, API Access, Global Search Embeddings. ```
````

```

### File: documentation\business\governance-ip.md

```md

```

### File: documentation\business\investor-summary.md

```md
# Executive Summary: Projective

## 1. The Elevator Pitch

Projective is a collaborative freelancing marketplace that enables businesses to hire entire
teams—functioning as "micro-agencies"—to deliver projects end-to-end. By replacing fragmented
individual hiring with structured, stage-based team collaboration, we provide the predictability of
an agency with the cost-efficiency of the gig economy.

## 2. Market Opportunity (2026)

The global freelancing market has matured into a **$1.5 trillion economy** (as of 2023 Upwork data),
yet the infrastructure for collaborative work remains broken.

- **The Fragmented Gig Gap**: 2026 enterprises are moving away from managing five separate
  freelancers and toward hiring unified, project-ready units.
- **The "Agency-Builder" Opportunity**: Projective aims to be the primary platform for freelance
  teams to formalize their operations and scale.

## 3. Competitive Advantage

- **Collaboration-First Architecture**: While Fiverr focuses on tasks and Upwork on individuals,
  Projective is built for **teams**.
- **Predictable Modular Pricing**: Fixed-stage budgets eliminate the "bidding wars" and endless
  negotiations common on legacy platforms.
- **Operational Transparency**: Built-in shared workspaces with real-time tracking give clients
  agency-level visibility without the agency-level price tag.

## 4. Monetization & Business Model

Our revenue model is designed for long-term scalability and user alignment.

- **Transaction Fees**: A 10% service fee on every project stage completed.
- **SaaS Subscriptions**: Premium tiers for freelancer teams (advanced analytics) and enterprises
  (departmental controls).
- **Asset Marketplace**: Commission on sales of digital templates, code, and design assets.

## 5. Development Roadmap

- **Phase 1 (MVP)**: Core team formation, stage-based hiring, and escrow payments.
- **Phase 2 (Growth)**: AI-driven "Income Smoother" wallet, review systems, and affiliate programs.
- **Phase 3 (Enterprise)**: Departmental scoping, API access, and global search embeddings.

## 6. The Team & Technology

The platform is built on an **Edge-first, Deno-powered architecture** with a Supabase backend and
Rust-based WASM modules for heavy compute. This ensures minimal operational overhead, high security
through Row-Level Security (RLS), and global scalability.

""" text // Financial Snapshot Current Status: MVP under development Burn Rate: Minimal (Open-source
stack / Edge-first) Key Metric: Total Value Locked (TVL) in Stage Escrows """

```

### File: documentation\business\market-analysis.md

```md
# Market Analysis: The $1.5T Opportunity & Competitor Gaps

## 1. Global Market Landscape (2026)

The freelancing economy is no longer a peripheral workforce; it is the global standard for digital
service delivery.

- **Workforce Scale**: Approximately **1.57 billion people** freelance worldwide, representing
  nearly 47% of the global workforce.
- **Economic Impact**: The online freelance market was valued at approximately **8.5 trillion** in
  2025 and is projected to reach **28.88 trillion by 2033** (CAGR of 16.52%).
- **Platform Revenue**: The specific market for freelance platforms is estimated at **8.9 billion in
  2026**, on a trajectory to hit **22 billion by 2031**.

## 2. Competitive Gaps & Opportunities

While legacy platforms dominate volume, they fail to support the **complex, multi-stage,
collaborative** workflows that modern businesses require.

| Feature           | Fiverr                   | Upwork              | Projective (The Gap)                  |
| :---------------- | :----------------------- | :------------------ | :------------------------------------ |
| **Hiring Unit**   | Individual Gigs          | Individual Profiles | **Pre-formed Teams (Micro-Agencies)** |
| **Workflow**      | Transactional/Task-based | Proposal/Bidding    | **Modular Stage-Based Execution**     |
| **Collaboration** | Minimal                  | Juggling/Siloed     | **Unified Shared Workspaces**         |
| **Pricing**       | Fixed per task           | Hourly or Fixed     | **Predictable Stage-Based Budgets**   |

### Critical Gaps Identified:

- **The "Team-as-a-Service" Absence**: Most platforms are optimized for hiring a single designer or
  a single developer. Projective targets the **collaborative gap** where these individuals work
  together as a cohesive unit.
- **Procurement Friction**: Enterprises in 2026 are increasingly risk-averse, favoring agencies that
  offer **scale and multi-disciplinary services** over fragmented individual talent.
- **Inefficient Mid-Project Transitions**: On current platforms, "firing" a freelancer mid-project
  often results in a total loss of progress. Projective’s **Modular Stage** architecture allows for
  seamless transitions between talent per stage.

## 3. Emerging Trends in 2026

- **Shift to Value-Based Charging**: Market models are moving away from hourly tracking toward
  **outcome-based milestones**.
- **AI as Infrastructure**: 84% of freelancers now integrate AI into their daily operations.
  Projective leverages this through **AI-assisted matching** and **"Income Smoothing"** financial
  tools.
- **Networking Dominance**: 56% of freelancers acquire work through professional networks, a massive
  jump from 2024. Projective formalizes these networks into **Teams**.

## 4. Target Market Verticals

1. **SMEs & Startups**: Need fast, agency-level results without high agency overhead.
2. **Enterprise Departments**: Large firms (Google, Sony) require departmental scoping and scalable,
   repeatable delivery models.
3. **Digital Transformation Projects**: Companies are accelerating AI integration, requiring highly
   skilled, multi-disciplinary technical teams.

```text
// Market Opportunity Summary
Addressable Market: $1.5T (Legacy platforms)
Target Gap: High-complexity, Team-based projects
Forecasted Growth: 16%+ CAGR through 2031
```

```

### File: documentation\business\monetization.md

```md
# Monetization Strategy: Sustainable Growth & Ecosystem Value

Projective’s monetization model is designed to align platform revenue with user success. By moving
away from aggressive upfront bidding fees and focusing on successful project delivery and asset
sales, we create a high-trust, low-friction financial environment.

## 1. Primary Revenue Streams (Phase 2+)

### 1.1 Project Service Fees

The core engine of Projective is a performance-based fee on successful stage completions.

- **Standard Service Fee**: A **5% fee** plus Stripe processing costs is applied to each project
  stage upon the release of escrowed funds.
- **Structure**: This fee is split between the platform’s operational costs, escrow management, and
  dispute mediation infrastructure.
- **Freelancer Capacity**: Unlike competitors, freelancers are not limited by paywalls for project
  volume; instead, limits are based on onboarding declarations and historical deadline performance.

### 1.2 Marketplace Commissions

As the platform expands into digital assets and templates, Projective acts as a digital storefront.

- **Digital Asset Sales**: A commission (targeted at **8-20%**) is taken from the sale of templates,
  codebases, and design assets.
- **Competitive Commission**: The base rate of 8% competes directly with platforms like Etsy, while
  the 20% tier applies to items utilizing internal "Search Boosts" or promotion.

## 2. Subscription Tiers & Paywalls (Phase 3+)

While the base platform is free for individual freelancers, advanced organizational features are
gated behind subscription models to support "Step-Ladder" growth.

| Tier           | Target           | Key Paywall Triggers                                                        | Pricing (Est.) |
| :------------- | :--------------- | :-------------------------------------------------------------------------- | :------------- |
| **Starter**    | Solo Freelancers | Unlimited portfolios, Unlimited active project stages (based on capacity).  | **Free**       |
| **Pro Team**   | Micro-Agencies   | High limit on Team members and active team projects.                        | **£29/mo**     |
| **Enterprise** | Large Corps      | Unlimited Businesses, multi-department scoping, API access, and audit logs. | **Custom**     |

## 3. Financial Services & Visibility

Projective provides unique stability tools for the freelance economy while offering internal
promotion paths.

- **The "Income Smoother"**: A nominal micro-fee (e.g., 0.5%) for the AI-managed wallet that
  automates "paycheck" consistency across high and low earning cycles.
- **Instant Payouts**: Optional small fee for freelancers to bypass standard clearing periods via
  Stripe Connect integration.
- **Search Boosts**: Teams and Creators can sponsor their profiles or project templates to appear at
  the top of the "Explore" page or "Guided Hiring" suggestions.

## 4. Organizational Limits (The Scale Ladder)

To ensure the platform remains accessible while capturing value from high-scale users, the following
limits are applied via paywalls:

- **Team/Business Count**: Limits on the number of distinct Team or Business profiles a single user
  can create.
- **Seat Limits**: Constraints on the number of users allowed within a specific Team or Business
  entity (Phase 3).
- **Active Project Volume**: Limits on the number of active projects a Business can manage
  simultaneously without an upgrade.

````text // Revenue Forecast Focus Short-term: Transactional Service Fees (5%) Mid-term: Marketplace
Commissions & Pro Subscriptions Long-term: Enterprise Licensing & AI Financial Services ```
````

```

### File: documentation\business\payout.md

```md
# Financial Workflow: Payouts & Escrow Logic

The financial engine of Projective is designed to ensure fair compensation for freelancers while
maintaining client trust through a transparent, stage-based escrow system. By anchoring payouts to
the **CREATE** framework and a time-based "Fair Exit" logic, we minimize disputes and maximize
accountability.

---

## 1. The CREATE Framework: Payout Triggers

Every project stage is categorized by the **CREATE** framework, which determines the "Proof of Work"
required to release funds from escrow.

| Stage Type        | CREATE Category         | Payout Trigger (Proof of Work)                                                         |
| :---------------- | :---------------------- | :------------------------------------------------------------------------------------- |
| **File Based**    | **C**reate, **R**un     | A final submission is made and the client clicks "Approve".                            |
| **Session Based** | **E**ducate, **A**dvise | The scheduled session duration is completed and logged by the system.                  |
| **Maintenance**   | **R**un, **T**est       | Completion of the `MaintenanceCycleInterval` (Weekly/Monthly) without an open dispute. |

---

## 2. The "Fair Exit" Logic: 25/50/75 Splits

To protect both parties during early project termination, Projective uses a time-based split for
**File-Based** stages. This ensures freelancers are paid for their time and clients receive a fair
refund for incomplete work.

- **< 25% of Stage Duration**: Full refund to the client. The freelancer forfeits payment as the
  work is considered not started or significantly underscoring the commitment.
- **25% – 75% of Stage Duration**: A 50/50 split of the escrowed funds. This recognizes shared
  accountability and compensates the freelancer for "lost time" while allowing the client to retain
  any drafts uploaded.
- **> 75% of Stage Duration (or Final Submission)**: Full payout to the freelancer. At this stage,
  the project is considered substantially complete or a deliverable has already been provided.

---

## 3. Session & Maintenance Specifics

Non-file-based work requires specialized exit triggers to handle scheduling and recurring
commitments.

### Session-Based (Educate/Advise)

- **Client Cancellation**: If cancelled less than 24 hours before a session, the freelancer receives
  a 50% "cancellation penalty" from that session's fee.
- **Freelancer Cancellation**: If the freelancer cancels, the client is issued a 100% refund for all
  remaining sessions.
- **Completed Sessions**: Money for sessions already held and logged is always paid to the
  freelancer.

### Maintenance-Based (Execute/Test)

- **Cycle-Based Payouts**: Funds are released at the end of each `MaintenanceCycleInterval` (Weekly
  or Monthly).
- **The "Negative Confirmation" Model**: If a freelancer submits a status report and the client does
  not file a dispute within 48 hours, the funds release automatically.
- **Freelancer Resignation**: If a freelancer quits mid-cycle, they forfeit the current cycle’s
  payment to account for the disruption caused to the client.

---

## 4. Wallet States & Dispute Windows

The Projective Wallet manages funds through three distinct states to ensure security:

1. **Escrowed (Locked)**: Funds are held by the platform and cannot be accessed by either party
   until a trigger is met.
2. **Pending (7-Day Safety Window)**: Once released from escrow, funds sit in a 7-day holding
   period. This allows the client time to review work for ToS violations before final settlement.
3. **Available**: Funds can be withdrawn to the user’s bank account via Stripe Connect.

```text
// Financial Transition Logic Summary
[Stage Funded] -> [Escrowed State] -> [Trigger/Approval] -> [7-Day Pending Window] -> [Available Balance]
```

```

### File: documentation\business\roadmap.md

```md

```

### File: documentation\business\tech-stack.md

```md

```

### File: documentation\business\vision.md

```md
# Projective Vision: The Future of Collaborative Work

## 1. Executive Core

Projective is an authentic, adaptive AI-driven ecosystem designed to bridge the gap between solo gig
work and high-overhead agencies. We provide a platform where freelancers can form "micro-agencies"
with peers and where businesses can hire modularly across structured project stages.

## 2. The Problem: The "Isolation & All-or-Nothing" Trap

Traditional platforms suffer from three structural flaws:

- **Freelancer Isolation**: Skilled individuals work in silos, making complex projects difficult for
  clients to manage.
- **Negotiation Fatigue**: Constant bidding and scope-creep discussions slow project momentum.
- **Procurement Risk**: Hiring is often an "all-or-nothing" commitment; if a partnership fails
  early, the business loses significant time.

## 3. The Solution: Modular Collaboration

Projective solves this through a "Collaboration-First" architecture:

### 3.1 Pre-formed Micro-Agencies (Teams)

Freelancers can form teams with peers for free, functioning like micro-agencies. We provide the
infrastructure for simple setup and fair, transparent financial distribution within the team.

### 3.2 Organizational Layers (Businesses)

Clients can establish "Businesses" to act as a structured management layer.

- **Current Utility**: Provides an additional layer of organization for grouping complex projects.
- **Future Evolution**: Acts as the "Step Ladder" to Enterprise subscriptions by allowing multiple
  users within a single business entity to manage cross-departmental projects.

### 3.3 Modular Stage-Based Hiring

Projects are broken into atomic stages categorized by the CREATE framework (Create, Run, Educate,
Advise, Test, Empower).

- **Granular Control**: Businesses can hire individuals or full teams per project stage.
- **Fluidity**: If a business is unsatisfied with a stage's output, they can hire a different team
  or freelancer for the subsequent stage.
- **Escrow Integrity**: Funds sit in escrow and are released only upon approval of deliverables per
  stage.

## 4. Market Evolution

### Phase 1: The Core Digital Workspace (Alpha)

The MVP focus is on digital services (Design, Dev, Marketing). It includes team and business
formation, stage-based management, analytics, and secure financial infrastructure.

### Phase 2: The Digital Marketplace & Income Smoothing

We expand into a passive income ecosystem:

- **Asset Marketplace**: Freelancers can sell digital products (templates, code, assets), taking a
  share of the Etsy-style market.
- **IP Flexibility**: "IP Mode" contracts define whether the buyer, the freelancer, or both retain
  resale rights.
- **Financial Wellness**: The "Income Smoother" wallet uses AI to siphon "excess" earnings during
  high-earning months into a buffer to provide a steady "paycheck" during low-earning months.

### Phase 3: The Enterprise Layer

Targeting large-scale organizations with complex hierarchies:

- **Departmental Scoping**: Support for multi-user Business accounts, different departments, and
  higher levels of permission control.
- **Advanced Orchestration**: API access for enterprise clients and more detailed analytics.

## 5. Strategic Focus: From Digital to Physical

While starting with digital services, the "Stage & Team" architecture is industry-agnostic. Future
iterations will support location-based services requiring credentials and certifications,
positioning Projective to compete with legacy directories like the Yellow Pages.

## 6. Philosophy of Trust

Projective acts as a passive facilitator. We do not guarantee quality; that is the responsibility of
the freelancers and teams. The platform intervenes strictly as a moderator for disputes and abuse,
maintaining high autonomy for all users.

```text
// Conceptual Roadmap Visual
[Phase 1: Alpha Testing & Business Layers] -> [Phase 2: Marketplace & AI Smoothing] -> [Phase 3: Enterprise & Physical Services]
```

```

### File: documentation\database\analytics\Functions.md

```md

```

### File: documentation\database\analytics\Policies.md

```md

```

### File: documentation\database\analytics\Tables.md

```md

```

### File: documentation\database\comms\Functions.md

```md

```

### File: documentation\database\comms\Policies.md

```md

```

### File: documentation\database\comms\Tables.md

```md
# comms Schema: Tables

The `comms` schema handles all real-time and asynchronous communication within the platform. It is
split between project-specific collaboration (Channels) and personal messaging (DMs), supported by a
robust notification delivery system.

## 🔔 Notifications & Preferences

### `comms.notification_prefs`

Stores per-user configuration for alert delivery across different channels.

| Column        | Type      | Notes                                     |
| :------------ | :-------- | :---------------------------------------- |
| `user_id`     | uuid      | PK, FK → `auth.users.id`.                 |
| `email`       | boolean   | Toggle for email alerts (Default: true).  |
| `push`        | boolean   | Toggle for mobile push notifications.     |
| `quiet_hours` | tstzrange | Time range to suppress non-urgent alerts. |

### `comms.notifications`

The central ledger of all system-generated alerts. Real-time delivery is handled via Supabase
Realtime.

| Column         | Type        | Notes                                        |
| :------------- | :---------- | :------------------------------------------- |
| `id`           | uuid        | PK.                                          |
| `user_id`      | uuid        | Recipient.                                   |
| `type`         | text        | e.g., `message.new`, `stage.status_changed`. |
| `entity_table` | text        | Source table for the event.                  |
| `entity_id`    | uuid        | Specific row ID related to the alert.        |
| `read_at`      | timestamptz | Null if unread.                              |

---

## 💬 Direct Messaging (DMs)

### `comms.dm_threads`

Containers for 1:1 or group conversations separate from project work.

### `comms.dm_participants`

Join table mapping users to threads. Only users in this table can access thread history.

### `comms.dm_messages`

The individual message entries for DMs.

| Column            | Type    | Notes                       |
| :---------------- | :------ | :-------------------------- |
| `thread_id`       | uuid    | FK → `comms.dm_threads.id`. |
| `sender_user_id`  | uuid    | FK → `auth.users.id`.       |
| `body`            | text    | Message content.            |
| `has_attachments` | boolean | Flag for UI optimization.   |

---

## 🧱 Project Collaboration

### `comms.project_channels`

Themed chat rooms within a project workspace. Channels can be global to the project or restricted to
specific stages.

| Column       | Type | Notes                                       |
| :----------- | :--- | :------------------------------------------ |
| `project_id` | uuid | FK → `projects.projects.id`.                |
| `stage_id`   | uuid | Optional FK → `projects.project_stages.id`. |
| `visibility` | text | `project_all` or restricted.                |

### `comms.project_messages`

Stage-aware communication between clients and freelancers.

```sql
CREATE TABLE comms.project_messages (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    channel_id uuid NOT NULL,
    sender_user_id uuid NOT NULL,
    body text NOT NULL,
    has_attachments boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    edited_at timestamp with time zone,
    deleted_at timestamp with time zone,
    CONSTRAINT project_messages_pkey PRIMARY KEY (id)
);
```

---

## 📎 Attachments & Shared Files

### `comms.message_attachments`

Poly-morphic link table connecting messages to `org.attachments`.

| Column          | Type | Notes                                            |
| :-------------- | :--- | :----------------------------------------------- |
| `message_table` | text | `comms.project_messages` or `comms.dm_messages`. |
| `message_id`    | uuid | ID from the specified message table.             |
| `attachment_id` | uuid | FK → `org.attachments.id`.                       |

### `comms.channel_files`

Aggregates all files shared within a channel for easy gallery browsing.

---

## 🚩 Refactor Notes & Suggestions

- **Message Retention**: `deleted_at` columns exist for soft-deletion. Ensure a background cron job
  handles permanent purging for privacy compliance if required.
- **Presence Tracking**: While table-based notifications are implemented, ephemeral user presence
  (typing indicators, "online" status) should be handled via **Supabase Realtime Broadcast** rather
  than database writes to reduce IO.
- **Attachment Logic**: The `message_attachments` table uses a text-based `message_table` reference.
  This prevents hard foreign keys at the DB level.
  - _Suggestion_: Consider using a database view or function for unified attachment retrieval to
    simplify frontend queries.

```

### File: documentation\database\files\Functions.md

```md

```

### File: documentation\database\files\Policies.md

```md

```

### File: documentation\database\files\Storage.md

```md
# files Schema: Storage

This document outlines the Supabase Storage bucket architecture for Projective. The storage layer is
physically isolated into buckets based on access patterns, caching requirements, and security
levels.

## 🪣 Bucket Overview

| Bucket          | Access  | Description                                                          |
| :-------------- | :------ | :------------------------------------------------------------------- |
| `public_assets` | Public  | Unrestricted read access for profile branding and public portfolios. |
| `project`       | Private | Restricted to project participants; requires signed URLs.            |
| `personal`      | Private | Owner-only access for drafts, personal templates, and private DMs.   |
| `quarantine`    | Private | Temporary landing zone for virus scanning and MIME validation.       |

---

## 📂 Directory Structure

### 1. `public_assets`

Contains assets that are safe for global edge caching.

```text
public_assets/
├── users/
│   └── [user_id]/
│       ├── avatar.webp
│       └── banner.webp
├── businesses/
│   └── [business_id]/
│       └── logo.webp
├── teams/
│   └── [team_id]/
│       └── avatar.webp
└── portfolios/
    └── [portfolio_id]/
        └── preview.webp
```

### 2. `project` (Private)

Files related to active or archived collaboration. Access is governed by
`projects.has_project_access()`.

```text
project/
└── [project_id]/
    ├── stages/
    │   └── [stage_id]/
    │       └── submissions/
    │           └── [submission_id]/
    │               └── file.xyz
    ├── channels/
    │   └── [channel_id]/
    │       └── attachments/
    │           └── [attachment_id]/
    │               └── file.xyz
    └── assets/
        └── file.xyz
```

### 3. `personal` (Private)

User-specific storage for work-in-progress and non-project communications.

```text
personal/
└── users/
    └── [user_id]/
        ├── drafts/
        │   ├── messages/
        │   │   └── [draft_id]/
        │   │       └── file.xyz
        │   ├── projects/
        │   │   └── [draft_id]/
        │   │       └── file.xyz
        │   └── templates/
        │       └── [draft_id]/
        │           └── file.xyz
        ├── templates/
        │   └── [template_id]/
        │       └── bundle.zip
        └── dms/
            └── [dm_id]/
                └── [message_id]/
                    └── file.xyz
```

### 4. `quarantine` (Restricted)

The entry point for all uploads. Files are moved to their target bucket only after passing system
checks.

```text
quarantine/
└── [upload_session_id]/
    └── original_file.xyz
```

---

## 🔗 Database Integration

Storage paths are mapped to the database through two primary tables:

- **`org.attachments`**: Maps immutable files (submissions, profile avatars) to their storage
  location.
- **`files.items`**: Tracks the virtualized path (folders/items) for a user's personal file library.

### Example: Resolving a File Path

```sql
-- Fetching a signed URL for a stage submission deliverable
SELECT 
  'project/' || p.id || '/stages/' || ps.id || '/submissions/' || ss.id || '/' || a.path as full_storage_path
FROM projects.stage_submissions ss
JOIN projects.project_stages ps ON ss.project_stage_id = ps.id
JOIN projects.projects p ON ps.project_id = p.id
JOIN org.attachments a ON a.id = ss.attachment_id -- Assuming attachment link
WHERE ss.id = :submission_id;
```

## 🔐 Security Enforcement

- **Signed URLs**: All private buckets (`project`, `personal`, `quarantine`) utilize short-lived
  signed URLs (60s TTL) for downloads.
- **Upload Policy**: Users can only `INSERT` into the `quarantine` bucket or their specific
  `personal/users/[user_id]/` path.
- **Move Logic**: Moving a file from `quarantine` to `project` is an atomic operation performed by a
  `SECURITY DEFINER` function or a service role to prevent users from bypassing project-access
  checks.

```

### File: documentation\database\files\Tables.md

```md
# files Schema: Tables

The `files` schema provides a virtualized file system layer over Supabase Storage. It allows users
to organize their assets into folders, track metadata, and manage file statuses independently of the
physical storage buckets.

## 📂 Directory Structure

### `files.folders`

Enables hierarchical organization of user assets. Folders are private to the owning user.

| Column             | Type        | Notes                                                |
| :----------------- | :---------- | :--------------------------------------------------- |
| `id`               | uuid        | PK.                                                  |
| `owner_user_id`    | uuid        | FK → `auth.users.id`.                                |
| `parent_folder_id` | uuid        | FK → `files.folders.id` (Allows nested directories). |
| `name`             | text        | Folder display name.                                 |
| `created_at`       | timestamptz | Timestamp of creation.                               |

```sql
CREATE TABLE files.folders (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    owner_user_id uuid NOT NULL,
    parent_folder_id uuid,
    name text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT folders_pkey PRIMARY KEY (id),
    CONSTRAINT folders_owner_fkey FOREIGN KEY (owner_user_id) REFERENCES auth.users (id),
    CONSTRAINT folders_parent_fkey FOREIGN KEY (parent_folder_id) REFERENCES files.folders (id)
);
```

---

## 📄 File Management

### `files.items`

The central registry for all files uploaded to the platform. It tracks the relationship between the
database entry and the actual Supabase Storage object.

| Column          | Type    | Notes                                                         |
| :-------------- | :------ | :------------------------------------------------------------ |
| `id`            | uuid    | PK.                                                           |
| `owner_user_id` | uuid    | FK → `auth.users.id`.                                         |
| `folder_id`     | uuid    | FK → `files.folders.id` (Optional).                           |
| `bucket_id`     | text    | Supabase Storage bucket name (e.g., `project`, `quarantine`). |
| `storage_path`  | text    | Full path to the object within the bucket.                    |
| `display_name`  | text    | User-defined name.                                            |
| `original_name` | text    | Filename as uploaded by the client.                           |
| `mime_type`     | text    | Sanitized MIME type.                                          |
| `size_bytes`    | bigint  | File size for quota management.                               |
| `metadata`      | jsonb   | Extra fields (e.g., image dimensions, PDF page count).        |
| `status`        | text    | `pending_upload`, `uploaded`, `error`.                        |
| `is_archived`   | boolean | Logical deletion flag.                                        |

```sql
CREATE TABLE files.items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL,
  folder_id uuid,
  bucket_id text NOT NULL,
  storage_path text NOT NULL,
  target_bucket text,
  target_path text,
  display_name text NOT NULL,
  original_name text NOT NULL,
  mime_type text NOT NULL,
  size_bytes bigint NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text DEFAULT 'pending_upload',
  is_archived boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT items_pkey PRIMARY KEY (id),
  CONSTRAINT files_owner_fkey FOREIGN KEY (owner_user_id) REFERENCES auth.users(id),
  CONSTRAINT files_folder_fkey FOREIGN KEY (folder_id) REFERENCES files.folders(id)
);
```

---

## 🚩 Refactor Notes & Suggestions

- **Bucket Synchronization**: The `bucket_id` and `storage_path` columns must stay in sync with the
  physical Supabase Storage state.
  - _Suggestion_: Use a database trigger or a Deno Edge Function to handle `DELETE` operations on
    `files.items` to ensure orphaned files aren't left in the storage bucket.
- **Redundancy with org.attachments**: There is overlap between `files.items` and `org.attachments`.
  - _Suggestion_: Consolidate these into a single storage metadata table or clarify the distinction
    (e.g., `files.items` for user-facing file management, `org.attachments` for strictly immutable
    project deliverables).
- **Target Bucket Fields**: The columns `target_bucket` and `target_path` in `files.items` appear to
  be placeholders for a "Move" or "Promote from Quarantine" workflow. These should be clearly
  defined in the file processing service logic.

```

### File: documentation\database\finance\Functions.md

```md

```

### File: documentation\database\finance\Policies.md

```md

```

### File: documentation\database\finance\Tables.md

```md

```

### File: documentation\database\integrations\Functions.md

```md

```

### File: documentation\database\integrations\Policies.md

```md

```

### File: documentation\database\integrations\Tables.md

```md

```

### File: documentation\database\marketplace\Functions.md

```md

```

### File: documentation\database\marketplace\Policies.md

```md

```

### File: documentation\database\marketplace\Tables.md

```md

```

### File: documentation\database\ops\Functions.md

```md

```

### File: documentation\database\ops\Policies.md

```md

```

### File: documentation\database\ops\Tables.md

```md

```

### File: documentation\database\org\Functions.md

```md

```

### File: documentation\database\org\Policies.md

```md
# org Schema: Policies

Row-Level Security (RLS) in the `org` schema ensures that identity data, profile settings, and team
configurations are isolated and protected. Access is primarily governed by the `auth.uid()` of the
requester and helper functions that verify administrative or membership status.

## 🛡️ Security Helpers

These functions are used throughout the policies to provide a clean and consistent authorization
layer.

- **`security.is_admin()`**: Returns true if the `auth.uid()` exists in `ops.admin_users`.
- **`org.is_active_team_member(_team_id)`**: Returns true if the `auth.uid()` has an 'active' status
  in `org.team_memberships` for the specified team.

---

## 👤 User & Profile Policies

### `org.users_public`

Controls visibility of basic user identity.

```sql
-- SELECT: Any authenticated user can view public profiles
CREATE POLICY "Any authenticated user can view public profiles" 
ON org.users_public FOR SELECT TO public 
USING (auth.role() = 'authenticated');

-- INSERT/UPDATE: Restricted to the user themselves or an admin
CREATE POLICY "Users can manage their own profile" 
ON org.users_public FOR ALL TO public 
USING (user_id = auth.uid() OR security.is_admin());
```

### `org.freelancer_profiles`

Protects seller-specific data and professional settings.

```sql
-- ALL: Managed by the profile owner or an administrator
CREATE POLICY "Users can manage their own freelancer profile" 
ON org.freelancer_profiles FOR ALL TO public 
USING (user_id = auth.uid() OR security.is_admin());
```

### `org.business_profiles`

Ensures businesses are only manageable by their designated owners.

```sql
-- ALL: Only the owner (owner_user_id) or an admin can view/edit/delete
CREATE POLICY "Users can manage their own business profiles" 
ON org.business_profiles FOR ALL TO public 
USING (owner_user_id = auth.uid() OR security.is_admin());
```

### `org.user_emails`

Protects secondary and primary email associations.

```sql
-- ALL: Strictly private to the owning user or platform admins
CREATE POLICY "Users can manage their own emails" 
ON org.user_emails FOR ALL TO public 
USING (user_id = auth.uid() OR security.is_admin());
```

---

## 🧑‍🤝‍🧑 Team & Membership Policies

### `org.teams`

Governs access to micro-agency data.

```sql
-- SELECT: Visible to the owner, active team members, or admins
CREATE POLICY "Users can view teams they belong to or own" 
ON org.teams FOR SELECT TO public 
USING (
    owner_user_id = auth.uid() 
    OR org.is_active_team_member(id) 
    OR security.is_admin()
);

-- INSERT/UPDATE/DELETE: Restricted to the team owner or admin
CREATE POLICY "Team owners can manage their teams" 
ON org.teams FOR ALL TO public 
USING (owner_user_id = auth.uid() OR security.is_admin());
```

### `org.team_memberships`

Critical policies for managing team rosters and permissions.

```sql
-- SELECT: Users see their own rows, and team members see fellow members
CREATE POLICY "Users can view members of their teams" 
ON org.team_memberships FOR SELECT TO public 
USING (
    user_id = auth.uid() 
    OR org.is_active_team_member(team_id) 
    OR security.is_admin()
);

-- INSERT/UPDATE: Restricted to Team Owners or Admins
CREATE POLICY "Team owners can manage memberships" 
ON org.team_memberships FOR ALL TO public 
USING (
    EXISTS (
        SELECT 1 FROM org.teams t 
        WHERE t.id = team_id AND t.owner_user_id = auth.uid()
    ) 
    OR security.is_admin()
);

-- DELETE: Owner can remove members; members can leave
CREATE POLICY "Team owners can remove members or members can leave" 
ON org.team_memberships FOR DELETE TO public 
USING (
    user_id = auth.uid() 
    OR EXISTS (
        SELECT 1 FROM org.teams t 
        WHERE t.id = team_id AND t.owner_user_id = auth.uid()
    ) 
    OR security.is_admin()
);
```

---

## 🛠 Asset & Skill Policies

### `org.attachments`

(Referencing common security patterns in codebase) Access is typically linked to the
`owner_profile_id` or visibility within a project context.

### `org.team_roles`

Strictly managed by the team hierarchy.

```sql
-- ALL: Managed by team owners
CREATE POLICY "Team owners manage roles" 
ON org.team_roles FOR ALL TO public 
USING (
    EXISTS (
        SELECT 1 FROM org.teams t 
        WHERE t.id = team_id AND t.owner_user_id = auth.uid()
    )
);
```

---

## ⚠️ Security Notes

- **Recursive Triggers**: The `is_active_team_member` helper must be used carefully to avoid
  infinite recursion in policies where `org.team_memberships` checks itself.
- **Admin Bypass**: All policies include an `OR security.is_admin()` check to allow platform-level
  moderation and support.
- **Public Discovery**: Currently, `freelancer_profiles` are only visible to the owner. To enable
  the 'Explore' page, a policy allowing public `SELECT` based on `visibility = 'public'` is
  required.

```

### File: documentation\database\org\Tables.md

```md
# org Schema: Tables

The `org` schema serves as the identity and organizational backbone of Projective. It handles user
profiles (freelancer and business), team structures, skill taxonomies, and cross-profile linkages.

## 👤 Identity Tables

### `org.users_public`

Public-facing profile data mirrored from `auth.users`. This ensures that sensitive internal auth
data remains isolated while providing a searchable directory for the platform.

| Column       | Type | Notes                                      |
| :----------- | :--- | :----------------------------------------- |
| `user_id`    | uuid | PK, FK → `auth.users.id`.                  |
| `username`   | text | Unique platform handle.                    |
| `first_name` | text | User's legal/given name.                   |
| `last_name`  | text | User's family name.                        |
| `avatar_url` | text | Reference to storage object.               |
| `headline`   | text | Short professional tagline.                |
| `bio`        | text | Long-form professional summary.            |
| `visibility` | text | Defaults to `unlisted`.                    |
| `dob`        | date | Date of birth for verification/compliance. |

### `org.freelancer_profiles`

The "Seller" persona. A user has exactly one freelancer profile.

| Column        | Type    | Notes                            |
| :------------ | :------ | :------------------------------- |
| `id`          | uuid    | PK.                              |
| `user_id`     | uuid    | FK → `auth.users.id`, UNIQUE.    |
| `hourly_rate` | integer | Signalling rate in minor units.  |
| `skills`      | text[]  | Fast-lookup array of skill tags. |

### `org.business_profiles`

The "Buyer" persona. Users can manage multiple business profiles (e.g., for different brands or
projects).

| Column          | Type | Notes                                |
| :-------------- | :--- | :----------------------------------- |
| `id`            | uuid | PK.                                  |
| `owner_user_id` | uuid | FK → `auth.users.id`.                |
| `name`          | text | Business display name.               |
| `plan`          | text | Subscription tier (default: `free`). |
| `billing_email` | text | Primary contact for invoices.        |

---

## 🧑‍🤝‍🧑 Organization & Teams

### `org.teams`

Micro-agencies or collaborative units.

| Column          | Type | Notes                                       |
| :-------------- | :--- | :------------------------------------------ |
| `id`            | uuid | PK.                                         |
| `owner_user_id` | uuid | FK → `auth.users.id` (Ultimate controller). |
| `slug`          | text | UNIQUE, used for team URLs.                 |
| `payout_model`  | text | Internal distribution logic.                |

### `org.team_memberships`

Join table mapping users to teams with specific roles.

| Column    | Type | Notes                              |
| :-------- | :--- | :--------------------------------- |
| `id`      | uuid | PK.                                |
| `team_id` | uuid | FK → `org.teams.id`.               |
| `user_id` | uuid | FK → `auth.users.id`.              |
| `role`    | text | e.g., `owner`, `admin`, `member`.  |
| `status`  | text | e.g., `active`, `invited`, `left`. |

---

## 🛠 Skills & Assets

### `org.skills`

The canonical taxonomy of platform skills.

```sql
CREATE TABLE org.skills (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    slug text NOT NULL UNIQUE,
    label text NOT NULL,
    CONSTRAINT skills_pkey PRIMARY KEY (id)
);
```

### `org.attachments`

Centralized metadata for files associated with profiles or portfolios.

| Column             | Type | Notes                                        |
| :----------------- | :--- | :------------------------------------------- |
| `owner_profile_id` | uuid | Link to creator profile.                     |
| `bucket`           | text | Target storage bucket (e.g., `attachments`). |
| `status`           | text | `draft`, `uploaded`, `quarantined`, `clean`. |

---

## 🔗 Portfolios & Links

### `org.portfolios`

Freelancer work samples.

| Column                  | Type | Notes                                        |
| :---------------------- | :--- | :------------------------------------------- |
| `freelancer_profile_id` | uuid | FK → `org.freelancer_profiles.id`.           |
| `attachment_id`         | uuid | FK → `org.attachments.id` for proof of work. |

### `org.profile_links`

Social and portfolio links for both profile types.

```sql
CREATE TABLE org.profile_links (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    profile_type text NOT NULL, -- 'freelancer' or 'business'
    profile_id uuid NOT NULL,
    kind text NOT NULL, -- 'github', 'linkedin', etc.
    url text NOT NULL,
    is_public boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT profile_links_pkey PRIMARY KEY (id)
);
```

---

## 🚩 Refactor Notes & Suggestions

- **DRY Violations**: `headline`, `bio`, `languages`, and `timezone` are currently duplicated across
  `users_public`, `freelancer_profiles`, and `business_profiles`.
  - _Suggestion_: Move shared attributes to `users_public` and only keep persona-specific data in
    the profiles.
- **Team Roles**: The `org.team_roles` table uses `jsonb` for permissions. Ensure the Deno backend
  has a strict TypeScript interface to validate these structures during team operations.
- **Email Management**: `org.user_emails` allows for secondary emails but the auth linkage remains
  strictly on the primary `auth.users` record.

```

### File: documentation\database\projects\Functions.md

```md

```

### File: documentation\database\projects\Policies.md

```md

```

### File: documentation\database\projects\Tables.md

```md
# projects Schema: Tables

The `projects` schema is the functional core of the platform. It manages the lifecycle of work, from
project definition and stage-based modularity to staffing, execution, and revision tracking.

## 📑 Core Project Management

### `projects.projects`

The top-level container for all collaborative work. It defines global settings, legal requirements,
and high-level metadata.

| Column               | Type            | Notes                                                   |
| :------------------- | :-------------- | :------------------------------------------------------ |
| `id`                 | uuid            | PK.                                                     |
| `client_business_id` | uuid            | FK → `org.business_profiles.id`.                        |
| `owner_user_id`      | uuid            | FK → `auth.users.id` (The creator).                     |
| `status`             | project_status  | `draft`, `active`, `on_hold`, `completed`, `cancelled`. |
| `visibility`         | visibility      | `public`, `invite_only`, `unlisted`.                    |
| `ip_ownership_mode`  | ip_option_mode  | Global default for the project.                         |
| `timeline_preset`    | timeline_preset | `sequential`, `simultaneous`, `staggered`, `custom`.    |

### `projects.project_stages`

Atomic units of work. Each stage has its own type, status, and specific delivery logic.

| Column               | Type               | Notes                                 |
| :------------------- | :----------------- | :------------------------------------ |
| `id`                 | uuid               | PK.                                   |
| `project_id`         | uuid               | FK → `projects.projects.id`.          |
| `stage_type`         | stage_type_enum    | `file_based`, `session_based`, etc..  |
| `status`             | stage_status       | Current progress state.               |
| `sort_order`         | integer            | Execution order.                      |
| `start_trigger_type` | start_trigger_type | Defines when work can begin.          |
| `ip_mode`            | ip_option_mode     | Override for stage-specific IP terms. |

---

## 👥 Staffing & Participation

### `projects.stage_assignments`

Maps a specific freelancer or team to a project stage.

| Column                  | Type            | Notes                                         |
| :---------------------- | :-------------- | :-------------------------------------------- |
| `project_stage_id`      | uuid            | FK → `projects.project_stages.id`.            |
| `assignee_type`         | assignment_type | `freelancer` or `team`.                       |
| `freelancer_profile_id` | uuid            | FK → `org.freelancer_profiles.id` (optional). |
| `team_id`               | uuid            | FK → `org.teams.id` (optional).               |

### `projects.project_participants`

A registry of all profiles (Business or Freelancer) with access to the project workspace.

### `projects.stage_staffing_roles` & `projects.stage_open_seats`

Used during the recruitment/staffing phase to define requirements and attract talent.

---

## 🚀 Execution & Quality Control

### `projects.stage_submissions`

The formal handover of work for review.

```sql
CREATE TABLE projects.stage_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_stage_id uuid NOT NULL,
  submitted_by uuid NOT NULL,
  title text NOT NULL,
  notes text,
  status text DEFAULT 'pending_review'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT stage_submissions_pkey PRIMARY KEY (id)
);
```

### `projects.stage_revision_requests`

Tracks requests for changes following a submission.

| Column             | Type | Notes                              |
| :----------------- | :--- | :--------------------------------- |
| `project_stage_id` | uuid | FK → `projects.project_stages.id`. |
| `request_type`     | text | e.g., `minor`, `major`.            |
| `status`           | text | `open`, `in_progress`, `resolved`. |

---

## 🛠 Project Infrastructure

### `projects.project_activity`

A unified ledger of events occurring within a project (e.g., status changes, file uploads).

### `projects.user_preferences`

Per-user metadata for UI customization (e.g., starring or archiving projects).

### `projects.maintenance_contracts`

Specifically for `maintenance_based` stages that require recurring billing logic.

---

## 🚩 Refactor Notes & Suggestions

- **Industry Categories**: `projects.projects` references `industry_category_id`, but no
  `industry_categories` table is defined in the current migration.
- **JSONB Consistency**: `description` in `projects.projects` and `project_stages` uses `jsonb`. We
  should define a standardized schema (e.g., Tiptap JSON or Markdown) to avoid rendering issues in
  the Fresh frontend.
- **Circular Dependencies**: `project_stages.start_dependency_stage_id` references its own table.
  Ensure the backend prevents circular logic (A depends on B, B depends on A) during project
  creation.

```

### File: documentation\database\Schemas.md

```md
# Database Schemas & Global Types

Projective utilizes a multi-schema approach within PostgreSQL to maintain strict domain boundaries,
simplify Row-Level Security (RLS) management, and ensure the platform can scale into enterprise and
marketplace layers without architectural friction.

## 🏗 Logical Schemas

The following schemas are initialized to isolate data by business domain:

| Schema             | Responsibility                                                     |
| :----------------- | :----------------------------------------------------------------- |
| **`org`**          | Identity, Freelancer/Business profiles, Teams, and Skills.         |
| **`projects`**     | Project headers, modular stages, assignments, and submissions.     |
| **`finance`**      | Wallets, multi-party escrows, transactions, and dispute records.   |
| **`comms`**        | Real-time project channels, DM threads, and notification delivery. |
| **`security`**     | Session context, JWT-linked RLS helpers, and audit logging.        |
| **`files`**        | User file library, folder structures, and storage item metadata.   |
| **`marketplace`**  | Digital asset listings, versions, and purchase history.            |
| **`search`**       | Full-text search indexes and semantic embeddings (pgvector).       |
| **`ops`**          | Platform administration, moderation flags, and outbound webhooks.  |
| **`analytics`**    | Event logging and pre-calculated daily rollups.                    |
| **`integrations`** | OAuth connections and third-party app installations.               |

---

## 🏷 Global Enums

These custom types ensure data consistency across all schemas and are defined during initial
migration.

### Identity & Access

```sql
-- Profile & Assignment Types
CREATE TYPE profile_type AS ENUM ('freelancer', 'business');
CREATE TYPE assignment_type AS ENUM ('freelancer', 'team');
CREATE TYPE visibility AS ENUM ('public', 'invite_only', 'unlisted');
```

### Project Lifecycle

```sql
-- Status Tracking
CREATE TYPE project_status AS ENUM ('draft', 'active', 'on_hold', 'completed', 'cancelled');
CREATE TYPE stage_status AS ENUM ('open', 'assigned', 'in_progress', 'submitted', 'approved', 'revisions', 'paid');
CREATE TYPE dispute_status AS ENUM ('open', 'under_review', 'resolved', 'refunded');
```

### Modular Stage Configuration

```sql
-- Stage Behavior & Logic
CREATE TYPE stage_type_enum AS ENUM ('file_based', 'session_based', 'group_session_based', 'management_based', 'maintenance_based');
CREATE TYPE start_trigger_type AS ENUM ('fixed_date', 'on_project_start', 'on_hire_confirmed', 'dependent_on_stage');
CREATE TYPE timeline_preset AS ENUM ('sequential', 'simultaneous', 'staggered', 'custom');
```

### Legal & Financial

```sql
-- IP & Budgeting
CREATE TYPE ip_option_mode AS ENUM ('exclusive_transfer', 'licensed_use', 'shared_ownership', 'projective_partner');
CREATE TYPE portfolio_rights AS ENUM ('allowed', 'forbidden', 'embargoed');
CREATE TYPE budget_type AS ENUM ('fixed_price', 'hourly_cap');
```

---

## 🛠 Initialization SQL

The schemas are created as follows to ensure the environment is ready for table migrations:

```sql
CREATE SCHEMA IF NOT EXISTS security;
CREATE SCHEMA IF NOT EXISTS org;
CREATE SCHEMA IF NOT EXISTS projects;
CREATE SCHEMA IF NOT EXISTS comms;
CREATE SCHEMA IF NOT EXISTS finance;
CREATE SCHEMA IF NOT EXISTS marketplace;
CREATE SCHEMA IF NOT EXISTS search;
CREATE SCHEMA IF NOT EXISTS ops;
CREATE SCHEMA IF NOT EXISTS analytics;
CREATE SCHEMA IF NOT EXISTS integrations;
CREATE SCHEMA IF NOT EXISTS files;
```

```

### File: documentation\database\search\Functions.md

```md

```

### File: documentation\database\search\Policies.md

```md

```

### File: documentation\database\search\Tables.md

```md

```

### File: documentation\database\security\Functions.md

```md

```

### File: documentation\database\security\Policies.md

```md

```

### File: documentation\database\security\Tables.md

```md
# security Schema: Tables

The `security` schema manages platform-level access control, session state, and auditability. It
bridges the gap between Supabase Auth and the application's domain-specific RLS requirements.

## 🔑 Session & Context

### `security.session_context`

The heart of the application's context-switching logic. It tracks which persona (freelancer,
business, or team) the user is currently acting as. This state is synchronized with the user's JWT
to drive Row-Level Security across all other schemas.

| Column                | Type         | Notes                          |
| :-------------------- | :----------- | :----------------------------- |
| `user_id`             | uuid         | PK, FK → `auth.users.id`.      |
| `active_profile_type` | profile_type | `freelancer` or `business`.    |
| `active_profile_id`   | uuid         | UUID of the active profile.    |
| `active_team_id`      | uuid         | Optional active team context.  |
| `updated_at`          | timestamptz  | Last context switch timestamp. |

```sql
CREATE TABLE security.session_context (
    user_id uuid NOT NULL,
    active_profile_type public.profile_type,
    active_profile_id uuid,
    active_team_id uuid,
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT session_context_pkey PRIMARY KEY (user_id),
    CONSTRAINT session_context_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id)
);
```

---

## 🛡️ Trust & Verification

### `security.feature_flags`

Allows for granular rollout of new features (e.g., Phase 2 payments or Phase 3 templates) without
redeploying the backend.

| Column    | Type    | Notes                                |
| :-------- | :------ | :----------------------------------- |
| `key`     | text    | PK (e.g., `enable-marketplace`).     |
| `enabled` | boolean | Global toggle.                       |
| `payload` | jsonb   | Extra configuration for the feature. |

### `security.turnstile_verifications`

Logs bot protection results from Cloudflare Turnstile to prevent automated abuse of anonymous
endpoints.

| Column         | Type    | Notes                              |
| :------------- | :------ | :--------------------------------- |
| `token_prefix` | text    | Partial token for audit reference. |
| `success`      | boolean | Verification result.               |

---

## 📜 Auditability

### `security.audit_logs`

A comprehensive, immutable record of critical actions. This table provides the necessary trail for
dispute resolution and security auditing.

| Column             | Type  | Notes                                            |
| :----------------- | :---- | :----------------------------------------------- |
| `user_id`          | uuid  | The human user performing the action.            |
| `action`           | text  | e.g., `stage.approved`, `dispute.opened`.        |
| `actor_profile_id` | uuid  | The profile ID active at the time of the action. |
| `ip`               | inet  | Client IP address.                               |
| `metadata`         | jsonb | Structured data regarding the change.            |

```sql
CREATE TABLE security.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  entity_table text NOT NULL,
  entity_id uuid NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip inet,
  user_agent text,
  request_id uuid,
  actor_profile_id uuid,
  actor_team_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
```

---

## 🚩 Refactor Notes & Suggestions

- **Persona Consistency**: `actor_profile_id` in `audit_logs` should strictly reference the profile
  that was active in `session_context` during the event to ensure we can distinguish between "User
  acting as Freelancer" vs "User acting as Business" for the same human user.
- **Retention Policy**: Audit logs will grow rapidly. I recommend implementing a partitioning
  strategy (by `created_at` month/year) for this table early to maintain query performance on large
  datasets.

```

### File: documentation\packages\data\ChatList.md

```md
# Data Component: ChatList

The `ChatList` is a specialized display component optimized for real-time messaging interfaces. It
features reverse-infinite scrolling (loading history as the user scrolls up), scroll anchoring to
maintain position during message bursts, and a seamless integration with subscription-based data
sources.

## 📂 Project Structure

```text
packages/data/
├── src/
│   ├── components/
│   │   └── displays/
│   │       └── ChatList.tsx      # Main chat orchestrator
│   ├── hooks/
│   │   ├── useScrollAnchoring.ts # Logic for sticky-to-bottom behavior
│   │   └── useVirtual.ts         # Window-scroll virtualizer integration
│   └── styles/
│       └── components/
│           └── chat-list.css     # Optional inversion or chat-specific layout
```

## 🚀 Usage

### Real-time Message Feed

Implementing a chat view with a `RealtimeDataSource` that supports metadata for total counts and a
subscription method for new messages.

```tsx
import { ChatList } from '@projective/data';

export default function ProjectChat({ messageSource }) {
	return (
		<ChatList
			dataSource={messageSource}
			estimateHeight={80}
			pageSize={30}
			renderItem={(message) => (
				<div className='chat-bubble'>
					<span className='author'>{message.sender}</span>
					<p>{message.text}</p>
				</div>
			)}
		/>
	);
}
```

## ⚙️ API Reference

### ChatList Props

Designed specifically for the messaging persona.

| Prop             | Type                    | Default | Description                                                   |
| :--------------- | :---------------------- | :------ | :------------------------------------------------------------ |
| `dataSource`     | `RealtimeDataSource<T>` | -       | A DataSource extended with `getMeta` and `subscribe` methods. |
| `renderItem`     | `(item: T) => VNode`    | -       | Function to render the individual message bubble.             |
| `estimateHeight` | `number`                | `80`    | Average height of a message for virtualization.               |
| `pageSize`       | `number`                | `20`    | Number of messages to load when fetching history.             |

## 🕹️ Logic & Real-time Features

- **Reverse-Infinite Loading**: On mount, the component fetches the _last_ page of messages. As the
  user scrolls toward the top (index < 5), it triggers `loadMore()` to prepend older messages
  without losing the current scroll position.
- **Scroll Anchoring**: The `useScrollAnchoring` hook tracks the `scrollHeight` and `scrollTop`. If
  the user is at the bottom, it "locks" them there as new messages arrive; if they are reading
  history, it adjusts the scroll position by the height of newly loaded items to prevent jumping.
- **Real-time Subscriptions**: If the `dataSource` provides a `subscribe` method, the component
  automatically listens for incoming messages, appends them to the signal, and triggers a smooth
  scroll to bottom.
- **Window Virtualization**: Unlike the general `DataDisplay`, `ChatList` is hard-coded to use
  `window` scroll mode, ensuring it feels like a native mobile or desktop chat application.

## 🎨 Styling

Styles are defined in `chat-list.css`:

- **Scroll Inversion**: Some implementations use `transform: scaleY(-1)` on the container and items
  to force the "bottom" to be the start of the list.
- **Loading Indicators**: Includes an absolute-positioned "Loading history..." spinner that appears
  at the top of the viewport when `loadMore` is active.
- **Skeleton States**: Leverages `skeleton.css` to show pulsing placeholders during the initial
  meta-fetch or history load.

```

### File: documentation\packages\data\DataDisplay.md

```md
# Data Component: DataDisplay

The `DataDisplay` component is the primary interface for rendering large datasets in the Projective
platform. It acts as a high-level orchestrator that connects a data source to a virtualization
engine, allowing the user to switch between List, Grid, and Table layouts seamlessly while
maintaining state and performance.

## 📂 Project Structure

```text
packages/data/
├── src/
│   ├── components/
│   │   ├── DataDisplay.tsx       # Main orchestrator component
│   │   ├── ScrollPane.tsx        # Scroll container abstraction
│   │   ├── displays/             # Specific layout implementations
│   │   └── table/                # Table-specific sub-components
│   └── styles/
│       └── base.css              # Core layout and loader styles
```

## 🚀 Usage

### Basic List Mode

Standard vertical list with remote data fetching and item selection.

```tsx
import { DataDisplay } from '@projective/data';

export default function UserList({ userSource }) {
	return (
		<DataDisplay
			dataSource={userSource}
			mode='list'
			estimateHeight={64}
			selectionMode='single'
			renderItem={(user) => (
				<div className='p-4 border-b'>
					<h3>{user.name}</h3>
					<p>{user.email}</p>
				</div>
			)}
		/>
	);
}
```

### Responsive Grid Mode

Rendering items in a multi-column grid that handles its own virtualization offsets.

```tsx
<DataDisplay
	dataSource={projectSource}
	mode='grid'
	gridColumns={3}
	estimateHeight={200}
	renderItem={(project) => <ProjectCard project={project} />}
/>;
```

### Advanced Table Mode

A structured data table with sortable and resizable columns.

```tsx
<DataDisplay
	dataSource={invoiceSource}
	mode='table'
	columns={[
		{ id: 'id', field: 'invoice_no', label: 'Invoice #', width: 100 },
		{ id: 'date', field: 'created_at', label: 'Date', sortable: true },
		{ id: 'amount', field: (item) => `$${item.total}`, label: 'Amount', align: 'right' },
	]}
	renderItem={(invoice) => <span>{invoice.status}</span>}
/>;
```

## ⚙️ API Reference

### DataDisplay Props

All props are defined in `DataDisplayProps.ts`.

| Prop             | Type                            | Default       | Description                                 |
| :--------------- | :------------------------------ | :------------ | :------------------------------------------ |
| `dataSource`     | `DataSource \| TOut[]`          | -             | The source of data (remote or local array). |
| `mode`           | `'list' \| 'grid' \| 'table'`   | `'list'`      | The visual layout used for rendering.       |
| `scrollMode`     | `'container' \| 'window'`       | `'container'` | Whether the component or the body scrolls.  |
| `estimateHeight` | `number`                        | `50`          | Average item height for virtualizer math.   |
| `gridColumns`    | `number`                        | `3`           | Columns to use specifically in `grid` mode. |
| `selectionMode`  | `'none' \| 'single' \| 'multi'` | `'single'`    | Behavior for item clicks.                   |
| `scrollToBottom` | `boolean`                       | `false`       | Initial scroll position (useful for chat).  |

## 🕹️ Logic & Integration

- **DataManager Lifecycle**: The component uses `useDataManager` to track visible ranges and trigger
  fetches only when the user scrolls near "gaps" in the data.
- **Layout-Specific Virtualization**:
  - In `list` and `table` modes, one virtual row equals one data item.
  - In `grid` mode, the virtualizer treats a group of items (based on `gridColumns`) as a single
    virtual row to maintain layout integrity.
- **Dynamic Table State**: In `table` mode, the component manages a local `TableState` to track
  column widths and sort directions, which can trigger local or remote re-sorting.
- **Window Scroll Support**: If `scrollMode` is set to `window`, the component attaches listeners to
  `globalThis` and uses `getBoundingClientRect` to calculate the relative viewport offset for the
  virtualizer.

## 🎨 Styling

Styles are modularly loaded based on the active mode:

- **Base Layout**: `base.css` defines the core `.data-display` container and the absolute-positioned
  loader.
- **Scroll Abstraction**: `scroll-pane.css` handles the difference between internal container
  scrolling and window-level overflow.
- **Theme-Awareness**: Leverages CSS variables from `theme.css` (e.g., `--bg-selection`) to ensure
  selection highlights match the platform's visual identity.

```

### File: documentation\packages\data\DataSource.md

```md
# Data Core: DataSource Guide

The `DataSource` system provides a unified abstraction layer for fetching, mapping, and normalizing
data from any source—be it a REST API, a local array, or a real-time WebSocket stream. By decoupling
the UI from the specific data-fetching logic, the platform can maintain high-performance
virtualization and gap-detection regardless of where the data resides.

## 📂 Project Structure

```text
packages/data/
├── src/
│   └── core/
│       ├── datasource.ts      # Abstract base class and config
│       ├── restdatasource.ts  # Concrete REST implementation with caching
│       ├── normalization.ts   # Logic for merging new items into the dataset
│       └── types.ts           # Shared FetchResult and Range interfaces
```

## 🏗️ Implementing a Custom DataSource

To create a new data provider, you must extend the `DataSource` abstract class and implement the
`fetch` method.

```ts
import { DataSource, type FetchResult, type Range } from '@projective/data';

export class MyCustomSource extends DataSource<MyUIModel, MyRawAPIModel> {
	async fetch(range: Range): Promise<FetchResult<MyRawAPIModel>> {
		const response = await myApi.getData(range.start, range.length);

		return {
			items: response.data,
			meta: { totalCount: response.total },
		};
	}
}
```

## ⚙️ The RestDataSource

Projective provides a robust `RestDataSource` out of the box that handles common API patterns and
caching.

### Key Features

- **Built-in Normalization**: Automatically uses a `keyExtractor` and optional `mapper` to transform
  API response shapes into UI-ready models.
- **Intelligent Caching**: Uses a global `GLOBAL_CACHE` with a configurable TTL (Time-To-Live) to
  prevent redundant network requests for the same offsets.
- **Meta-Only Fetching**: Includes a `getMeta()` method to retrieve only the `totalCount`, allowing
  the virtualizer to set its scroll height before rows are loaded.

### Usage Example

```ts
const userSource = new RestDataSource({
	url: '/api/users',
	keyExtractor: (raw) => raw.user_id,
	mapper: (raw) => ({
		name: `${raw.first_name} ${raw.last_name}`,
		email: raw.email_address,
	}),
	defaultParams: { active: 'true' },
	cacheTtl: 10000, // 10 seconds
});
```

## 🕹️ Logic & Integration

- **Range Fetching**: The `DataManager` calculates "gaps" in the current view and requests specific
  `Range` objects (start/length) from the source.
- **Normalization Engine**: The `source.normalize()` method is called for every incoming raw item to
  ensure the UI only interacts with stable keys and mapped data.
- **Automatic Total Discovery**: If the API does not provide a `totalCount`, the `normalization`
  logic intelligently determines the end of the dataset if a fetch returns fewer items than
  requested.
- **Param Chaining**: Use `.withParams()` to create a new instance of a `RestDataSource` with merged
  parameters, which is ideal for filtering and searching without re-instantiating the entire config.

## 🧪 Advanced: RealtimeDataSource

Used specifically by components like `ChatList`, this interface extends the base source with
subscription capabilities.

```ts
interface RealtimeDataSource<T> extends DataSource<T> {
	getMeta(): Promise<{ totalCount: number }>;
	subscribe?: (cb: (item: T) => void) => () => void;
}
```

```

### File: documentation\packages\data\UseVirtual.md

```md
# Data Hook: useVirtual

The `useVirtual` hook is the low-level engine that powers high-performance rendering for large
datasets in the Projective platform. It calculates which items should be visible based on the
current scroll position and manages the lifecycle of the `Virtualizer` instance, supporting both
fixed and variable-height rows.

## 📂 Project Structure

```text
packages/data/
├── src/
│   ├── hooks/
│   │   └── useVirtual.ts         # Hook interface and scroll listeners
│   └── core/
│       └── virtualizer.ts        # Core math, measurements, and ResizeObserver logic
```

## 🚀 Usage

### Manual Virtualization

While `DataDisplay` handles this automatically, you can use `useVirtual` to build custom
high-performance components.

```tsx
import { useVirtual } from '@projective/data';

export function CustomVirtualList({ items }) {
	const { parentRef, getItems, getTotalSize } = useVirtual({
		count: items.length,
		estimateSize: () => 60, // Estimated px height
		overscan: 5, // Buffer items to render outside viewport
	});

	const virtualItems = getItems();

	return (
		<div
			ref={parentRef}
			style={{ height: '500px', overflow: 'auto', position: 'relative' }}
		>
			<div style={{ height: `${getTotalSize()}px`, width: '100%' }}>
				{virtualItems.map((virtualRow) => (
					<div
						key={virtualRow.index}
						ref={virtualRow.measureElement} // Dynamic height tracking
						style={{
							position: 'absolute',
							top: 0,
							transform: `translateY(${virtualRow.start}px)`,
							width: '100%',
						}}
					>
						{items[virtualRow.index].content}
					</div>
				))}
			</div>
		</div>
	);
}
```

## ⚙️ API Reference

### useVirtual Options

Extends the core `VirtualizerOptions`.

| Option                  | Type              | Default | Description                                         |
| :---------------------- | :---------------- | :------ | :-------------------------------------------------- |
| `count`                 | `number`          | -       | Total number of items in the dataset.               |
| `estimateSize`          | `(idx) => number` | -       | Returns the estimated height of an item.            |
| `overscan`              | `number`          | `1`     | Number of items to render above/below the viewport. |
| `useWindowScroll`       | `boolean`         | `false` | Attach listeners to window instead of `parentRef`.  |
| `initialScrollToBottom` | `boolean`         | `false` | Auto-scroll to end on mount (for chat).             |
| `fixedItemHeight`       | `number`          | -       | Optimization if all rows are identical height.      |

### Hook Return Values

| Value            | Type                  | Description                                      |
| :--------------- | :-------------------- | :----------------------------------------------- |
| `parentRef`      | `RefObject`           | Attach to the scrollable container element.      |
| `getItems()`     | `() => VirtualItem[]` | Returns the subset of items currently in view.   |
| `getTotalSize()` | `() => number`        | Returns the total calculated height of the list. |
| `virtualizer`    | `Virtualizer`         | Direct access to the underlying class instance.  |

## 🕹️ Logic & Performance

- **Dynamic Measurement**: Every `VirtualItem` provides a `measureElement` ref. When attached to a
  DOM node, it uses a `ResizeObserver` to report the exact `borderBoxSize` back to the engine,
  updating the layout without manual intervention.
- **Window Scroll Mapping**: When `useWindowScroll` is enabled, the hook calculates the relative
  offset of the `parentRef` to ensure the virtualizer understands where the list starts on the page.
- **Scroll Debouncing**: Scroll updates trigger a lightweight re-render via a signal-like
  force-update mechanism, ensuring minimal latency during rapid scrolling.
- **Size Caching**: The `Virtualizer` caches measured heights and total size calculations to prevent
  expensive O(n) loops on every frame.

## 🎨 Styling Requirements

- **Relative Container**: The inner shim (the element with `getTotalSize()`) must have
  `position: relative` or `absolute` to allow the items to be positioned correctly via `translateY`.
- **Absolute Items**: Virtualized rows must be `position: absolute` with `top: 0` and `left: 0` for
  the math to remain consistent across different viewports.

```

### File: documentation\packages\fields\ComboboxField.md

```md
# Field Component: ComboboxField

A hybrid input component that combines the flexibility of a text field with the structured selection
of a dropdown. It is ideal for large lists where users need to filter options via typing while
maintaining the ability to select from a predefined set.

## 📂 Project Structure

```text
packages/fields/
├── src/
│   ├── components/
│   │   └── ComboboxField.tsx     # Hybrid input and filtering logic
│   ├── styles/
│   │   └── fields/
│   │       └── combobox-field.css # Dropdown menu and layout styling
│   └── types/
│       └── components/
│           └── combobox-field.ts # Interface extending SelectFieldProps
```

## 🚀 Usage

### Searchable Selection

A standard combobox that filters options as the user types.

```tsx
import { ComboboxField } from '@projective/fields';

const languages = [
	{ label: 'TypeScript', value: 'ts' },
	{ label: 'Rust', value: 'rs' },
	{ label: 'Go', value: 'go' },
	{ label: 'Python', value: 'py' },
];

export default function TechStack() {
	return (
		<ComboboxField
			label='Primary Language'
			options={languages}
			placeholder='Start typing a language...'
		/>
	);
}
```

## ⚙️ API Reference

### ComboboxField Props

Extends `SelectFieldProps<T>`.

| Prop          | Type               | Default | Description                                    |
| :------------ | :----------------- | :------ | :--------------------------------------------- |
| `options`     | `SelectOption[]`   | `[]`    | The list of searchable options.                |
| `value`       | `T \| Signal<T>`   | -       | The currently selected value.                  |
| `onChange`    | `(val: T) => void` | -       | Callback triggered when an option is selected. |
| `placeholder` | `string`           | -       | Text shown in the input when empty.            |
| `disabled`    | `boolean`          | `false` | Prevents user interaction and dims the UI.     |

## 🕹️ Logic & Behavior

- **Fuzzy Filtering**: The component uses a `computed` signal to filter the `options` array in
  real-time based on the current input value, ignoring case sensitivity.
- **Automatic Positioning**: Upon opening, the component calculates available viewport space; if the
  bottom clearance is less than 250px, the menu automatically flips to open upwards.
- **Interaction States**: Utilizes the `useInteraction` hook to track focus and blur states,
  ensuring the floating label and focus rings respond correctly to user input.
- **Selection Sync**: Selecting an option automatically updates the internal `inputValue` to match
  the option's label and closes the menu.

## 🎨 Styling

Styles are defined in `combobox-field.css`:

- **Menu Transitions**: The dropdown menu uses a subtle vertical translation (`translateY`) and
  opacity fade during the open/close cycle.
- **Layout Consistency**: Reuses `LabelWrapper`, `MessageWrapper`, and `EffectWrapper` to ensure
  visual parity with other field components.
- **Upward Variant**: Includes dedicated CSS logic for the `.field-combobox--up` class to adjust
  shadows and transform origins when the menu is flipped.

```

### File: documentation\packages\fields\DateField.md

```md
# Field Component: DateField

A comprehensive date selection component that supports single dates, multiple dates, and date
ranges. It utilizes a custom-built calendar system and integrates with a Popover for a seamless user
experience.

## 📂 Project Structure

```text
packages/fields/
├── src/
│   ├── components/
│   │   ├── DateField.tsx         # Main component logic
│   │   └── datetime/
│   │       └── Calendar.tsx      # Core calendar grid and navigation
│   ├── styles/
│   │   ├── fields/
│   │   │   └── date-field.css    # Layout for the field container
│   │   └── components/
│   │       └── calendar.css      # Grid and cell styling
│   └── types/
│       └── components/
│           └── date-field.ts     # Selection modes and value types
```

## 🚀 Usage

### Single Date Picker (Default)

Standard date selection using a popup calendar.

```tsx
import { DateField } from '@projective/fields';
import { DateTime } from '@projective/types';

export default function MyForm() {
	return (
		<DateField
			label='Deadline'
			placeholder='YYYY-MM-DD'
			defaultValue={new DateTime()}
			onChange={(date) => console.log('Selected:', date)}
		/>
	);
}
```

### Date Range Selection

Allows users to select a start and end date with a visual hover preview.

```tsx
<DateField
	label='Project Duration'
	selectionMode='range'
	format='dd MMM yyyy'
	hint='Select the start and end dates for your project.'
/>;
```

### Inline Variant

Renders the calendar directly in the page flow rather than in a popup.

```tsx
<DateField
	label='Pick a Date'
	variant='inline'
	selectionMode='multiple'
/>;
```

## ⚙️ API Reference

### DateField Props

Extends `ValueFieldProps<DateValue>` and `AdornmentProps`.

| Prop            | Type                                | Default        | Description                                      |
| :-------------- | :---------------------------------- | :------------- | :----------------------------------------------- |
| `selectionMode` | `'single' \| 'multiple' \| 'range'` | `'single'`     | The type of selection behavior.                  |
| `variant`       | `'popup' \| 'inline' \| 'input'`    | `'popup'`      | Visual behavior of the component.                |
| `format`        | `string`                            | `'yyyy-MM-dd'` | Date display format in the input field.          |
| `minDate`       | `DateTime`                          | -              | Earliest selectable date.                        |
| `maxDate`       | `DateTime`                          | -              | Latest selectable date.                          |
| `modifiers`     | `DateModifiers`                     | `{}`           | Custom logic to style or disable specific dates. |

## 🕹️ Logic & Calendar Features

- **Calendar Views**: Supports day, month, and year selection modes for fast navigation across large
  time ranges.
- **Range Preview**: In `range` mode, the calendar provides a visual "middle" state during hover to
  help users visualize the selected span before finalizing.
- **Localization**: weekday labels are generated based on the `startOfWeek` prop (defaulting to
  Monday/1).
- **State Syncing**: The `useFieldState` hook ensures that `DateTime` objects are correctly
  synchronized between the UI and the parent application's signals.

## 🎨 Styling

Styles are defined in `date-field.css` and `calendar.css`:

- **Cell States**: Distinct styles for `--today`, `--selected`, `--range-start`, `--range-end`, and
  `--range-middle`.
- **Muted Days**: Days outside the current viewing month are rendered with a "muted" opacity to
  maintain focus.
- **Accessibility**: Calendar buttons use `type="button"` to prevent accidental form submissions
  when navigating months.

```

### File: documentation\packages\fields\FileDrop.md

```md
# Field Component: FileDrop

A sophisticated file upload and processing component. It features a drag-and-drop zone, support for
multiple files, MIME type filtering, and an integrated asynchronous processing pipeline for tasks
like virus scanning or image optimization.

## 📂 Project Structure

```text
packages/fields/
├── src/
│   ├── components/
│   │   └── FileDrop.tsx          # Main dropzone UI component
│   ├── hooks/
│   │   ├── useFileProcessor.ts   # Async processing queue logic
│   │   └── useGlobalDrag.ts      # Tracks window-level drag events
│   ├── styles/
│   │   └── fields/
│   │       └── file-drop.css     # Dropzone and file list styling
│   └── types/
│       └── file.ts               # FileWithMeta and Processor interfaces
└── wrappers/
    └── GlobalFileDrop.tsx        # App-wide drag-to-upload overlay
```

## 🚀 Usage

### Standard Dropzone

A simple file input with type restrictions and multi-file support.

```tsx
import { FileDrop } from '@projective/fields';

export default function DocumentUpload() {
	return (
		<FileDrop
			label='Identity Proof'
			accept='.pdf,.jpg,.png'
			multiple
			maxSize={5 * 1024 * 1024} // 5MB
			onChange={(files) => console.log('Files ready:', files)}
		/>
	);
}
```

### Global Drag Overlay

Wrap your application or specific layouts with `GlobalFileDrop` to enable "drop anywhere" uploads.

```tsx
import { GlobalFileDrop } from '@projective/fields';

export default function Layout({ children }) {
	return (
		<GlobalFileDrop overlayText='Drop project assets to upload'>
			{children}
		</GlobalFileDrop>
	);
}
```

## ⚙️ API Reference

### FileDrop Props

Extends `ValueFieldProps<FileWithMeta[]>`.

| Prop            | Type                           | Default | Description                                    |
| :-------------- | :----------------------------- | :------ | :--------------------------------------------- |
| `accept`        | `string`                       | -       | Standard HTML file input accept string.        |
| `multiple`      | `boolean`                      | `false` | Allow more than one file selection.            |
| `maxSize`       | `number`                       | -       | Maximum file size in bytes.                    |
| `processors`    | `FileProcessor[]`              | `[]`    | List of async tasks to run on drop.            |
| `dropzoneLabel` | `string`                       | -       | Custom text for the drop target.               |
| `onDrop`        | `(accepted, rejected) => void` | -       | Callback for immediate drag/selection results. |

## 🕹️ Logic & Processing Pipeline

- **FileWithMeta**: Files are wrapped in a metadata object that tracks `id`, `status` (`pending`,
  `processing`, `ready`, `error`), and a `progress` signal.
- **Processor Matcher**: The `useFileProcessor` hook iterates through the `processors` array. If a
  processor's `match(file)` function returns true, it executes the async `process` function.
- **Global Drag State**: `useGlobalDrag` manages a window-level counter to ensure the
  `GlobalFileDrop` overlay persists correctly when dragging over child elements without flickering.
- **Progress Tracking**: Processors can report granular progress (0-100), allowing the UI to show
  real-time upload or processing bars.

## 🎨 Styling

Styles are defined in `file-drop.css`:

- **Drag States**: The dropzone applies a `--dragging` variant with high-contrast borders and a
  `--primary-50` background to indicate a valid drop target.
- **Virtualized Overlay**: `GlobalFileDrop` uses a `fixed` inset overlay with
  `backdrop-filter: blur(4px)` to capture global events while blurring the main application content.
- **Disabled State**: When `disabled` is true, the dropzone reduces opacity and disables all pointer
  events.

```

### File: documentation\packages\fields\Hooks_Wrappers.md

```md
# Fields Library: Hooks & Wrappers

This document outlines the internal logic and utility wrappers that power `@projective/fields`.
These modules are designed to be composable, allowing developers to build custom field components
that maintain visual and functional consistency with the rest of the platform.

---

## 🪝 Core Hooks

Hooks in this package manage state, interaction, and complex formatting logic.

### `useFieldState<T>`

The primary state machine for any value-holding field. It handles signal normalization,
dirty/touched tracking, and basic required-field validation.

```ts
const { value, error, setValue, validate } = useFieldState({
	value: props.value,
	defaultValue: props.defaultValue,
	required: props.required,
	onChange: props.onChange,
});
```

- **Signal Normalization**: Automatically converts raw values or signals into a unified signal for
  internal use.
- **Validation**: Provides a `validate()` method that checks `required` constraints and updates the
  `error` signal.

### `useInteraction`

Tracks the physical state of a field (focus, hover, active) to drive CSS classes and floating label
logic.

- **Methods**: Includes `handleFocus`, `handleBlur`, `handleMouseEnter`, and `handleMouseLeave`.
- **Signals**: Returns `focused`, `hovered`, and `touched` signals.

### `useCurrencyMask`

Specialized logic for the `MoneyField` to handle locale-aware formatting and numeric parsing.

- **Formatting**: Converts a numeric signal into a formatted string (e.g., `1200` → `$1,200.00`).
- **Parsing**: Strips non-numeric characters on input to sync the raw number back to the state.

---

## 🏗️ Utility Wrappers

Wrappers provide the consistent "shell" for all fields. They handle labels, error messages, and
visual effects.

### `LabelWrapper`

Manages the positioning and animation of the field label.

```tsx
<LabelWrapper
	id='my-field'
	label='Email Address'
	active={isFocused || !!val}
	error={!!error}
	floatingRule='auto'
	help="We'll never share your email."
/>;
```

- **Floating Logic**: When `floatingRule` is `auto`, the label scales and moves to the border if
  `active` is true.
- **Help Tooltips**: Integrated support for `help` text and `helpLink` via a standardized tooltip
  icon.

### `MessageWrapper`

A specialized container for field feedback, following a strict priority order.

- **Priority**: Displays `error` > `warning` > `info` > `hint` in that specific order.
- **ARIA**: Automatically applies `role="alert"` for error messages to assist screen readers.

### `EffectWrapper`

The visual "polish" layer for field containers.

- **Focus Ring**: Renders a non-destructive glow (`box-shadow`) around the field when focused.
- **Ripple Support**: Provides the container and logic for CSS-based ripple animations on user
  click.

---

## 🛠️ Advanced: `FieldArrayWrapper`

Used for creating dynamic lists of fields (e.g., adding multiple links or phone numbers).

```tsx
<FieldArrayWrapper
	items={links}
	onAdd={() => links.value = [...links.value, '']}
	onRemove={(idx) => links.value = links.value.filter((_, i) => i !== idx)}
	renderItem={(item, idx) => <TextField value={item} label={`Link #${idx + 1}`} />}
/>;
```

| Prop         | Description                                              |
| :----------- | :------------------------------------------------------- |
| `items`      | A signal or array of data objects to iterate over.       |
| `renderItem` | A function returning the JSX for each individual row.    |
| `maxItems`   | Optional limit to disable the "Add" button once reached. |

```

### File: documentation\packages\fields\RichTextField.md

```md
# Field Component: RichTextField

A powerful WYSIWYG editor built on **Quill.js**, integrated into the Projective field system. It
supports multiple output formats (Delta, HTML, Markdown), image uploads, character counting, and
secure link handling.

## 📂 Project Structure

```text
packages/fields/
├── src/
│   ├── components/
│   │   └── RichTextField.tsx      # Preact wrapper for Quill.js
│   ├── styles/
│   │   └── fields/
│   │       └── rich-text-field.css # Snow theme overrides and container layout
│   ├── types/
│   │   └── components/
│   │       └── rich-text-field.ts  # Prop definitions and format types
│   └── utils/
│       └── QuillParser.ts         # Utility for Markdown conversions
```

## 🚀 Usage

### Basic Editor

Standard framed editor with basic formatting tools (Bold, Italic, Lists, Links).

```tsx
import { RichTextField } from '@projective/fields';

export default function MyForm() {
	return (
		<RichTextField
			label='Project Description'
			placeholder='Describe the scope of work...'
			toolbar='basic'
			minHeight='200px'
		/>
	);
}
```

### Markdown Output & Image Uploads

Configuring the editor to emit Markdown strings and handle image storage via a custom provider.

```tsx
<RichTextField
	label='Detailed Pitch'
	outputFormat='markdown'
	toolbar='full'
	onImageUpload={async (file) => {
		// Custom upload logic to Supabase/S3
		const url = await uploadService.push(file);
		return url;
	}}
	showCount
	maxLength={2000}
/>;
```

### Inline Mode

A "borderless" variant that only shows the toolbar when the container is hovered or focused—ideal
for comments or quick replies.

```tsx
<RichTextField
	variant='inline'
	placeholder='Write a comment...'
	toolbar='basic'
/>;
```

## ⚙️ API Reference

### RichTextField Props

Extends `ValueFieldProps<string>`.

| Prop            | Type                              | Default    | Description                                          |
| :-------------- | :-------------------------------- | :--------- | :--------------------------------------------------- |
| `outputFormat`  | `'delta' \| 'html' \| 'markdown'` | `'delta'`  | Data format for the `onChange` callback.             |
| `toolbar`       | `'basic' \| 'full' \| any[]`      | `'basic'`  | Predefined or custom Quill toolbar configuration.    |
| `variant`       | `'framed' \| 'inline'`            | `'framed'` | Visual style of the editor container.                |
| `minHeight`     | `string \| number`                | `'150px'`  | Minimum height of the editable area.                 |
| `maxLength`     | `number`                          | -          | Soft limit for character counting.                   |
| `showCount`     | `boolean`                         | `false`    | Displays a counter (e.g., 150/2000).                 |
| `secureLinks`   | `boolean`                         | `true`     | Sanitizes links to prevent `javascript:` execution.  |
| `onImageUpload` | `(file: File) => Promise<string>` | -          | Callback to handle image drag-and-drop or selection. |

## 🕹️ Logic & Implementation

- **Quill Integration**: Uses dynamic imports to load Quill.js only on the client side, ensuring
  compatibility with Deno Fresh SSR.
- **SecureLink Blot**: Extends the standard Quill Link blot to automatically apply
  `rel="noopener noreferrer"` and `target="_blank"` to all user-generated links.
- **Format Parsing**: If the initial value is valid JSON, it is parsed as a Quill Delta. If it looks
  like HTML or Markdown, it is parsed accordingly to maintain document structure.
- **Character Counting**: Automatically strips trailing newlines added by Quill to provide an
  accurate character count to the user.

## 🎨 Styling

Styles are defined in `rich-text-field.css`:

- **Theme Overrides**: Overwrites the default Quill "Snow" theme to use the platform's semantic
  colors (e.g., `--text-brand` for active buttons).
- **Read-Only State**: When `readOnly` is true, the toolbar is hidden, and the background shifts to
  `--bg-surface-disabled`.
- **Error Transitions**: Applies a high-contrast border color (`--field-border-error`) when the
  error signal is active.

```

### File: documentation\packages\fields\SelectField.md

```md
# Field Component: SelectField

A robust selection component supporting single and multi-select modes, searchability, hierarchical
grouping, and custom display formats. It leverages Preact Signals for high-performance dropdown
interactions and state management.

## 📂 Project Structure

```text
packages/fields/
├── src/
│   ├── components/
│   │   └── SelectField.tsx       # Main component and dropdown logic
│   ├── hooks/
│   │   ├── useSelectState.ts     # Flattening logic and selection state
│   │   └── useInteraction.ts     # Field focus and hover tracking
│   ├── styles/
│   │   └── fields/
│   │       └── select-field.css  # Dropdown and chip styling
│   └── types/
│       └── components/
│           └── select-field.ts   # SelectOption and Prop definitions
```

## 🚀 Usage

### Single Select (Standard)

Standard selection with a clearable value and custom icons.

```tsx
import { SelectField } from '@projective/fields';

const options = [
	{ label: 'Design', value: 'design' },
	{ label: 'Development', value: 'dev' },
	{ label: 'Marketing', value: 'marketing' },
];

export default function MyForm() {
	return (
		<SelectField
			label='Category'
			options={options}
			clearable
			placeholder='Select a category'
		/>
	);
}
```

### Multi-Select with Chips

Allows picking multiple values, displayed as removable chips within the field.

```tsx
<SelectField
	label='Skills'
	options={skillsOptions}
	multiple
	displayMode='chips-inside'
	searchable
	placeholder='Search skills...'
/>;
```

### Hierarchical Grouping

Supports nested options with different selection behaviors for parent groups.

```tsx
const groupedOptions = [
	{
		label: 'Frontend',
		value: 'fe-group',
		options: [
			{ label: 'React', value: 'react' },
			{ label: 'Preact', value: 'preact' },
		],
	},
];

// 'members' mode: Clicking a group selects all children
<SelectField
	label='Stack'
	options={groupedOptions}
	multiple
	groupSelectMode='members'
/>;
```

## ⚙️ API Reference

### SelectField Props

Extends `ValueFieldProps<T | T[]>` and `AdornmentProps`.

| Prop              | Type                   | Default          | Description                                                                  |
| :---------------- | :--------------------- | :--------------- | :--------------------------------------------------------------------------- |
| `options`         | `SelectOption[]`       | `[]`             | Array of label/value objects or nested groups.                               |
| `multiple`        | `boolean`              | `false`          | Enables multiple value selection.                                            |
| `searchable`      | `boolean`              | `false`          | Filters options based on user input.                                         |
| `displayMode`     | `SelectDisplayMode`    | `'chips-inside'` | How selected values appear (`chips-inside`, `chips-below`, `count`, `text`). |
| `groupSelectMode` | `'value' \| 'members'` | `'value'`        | Whether clicking a group selects the group value or its children.            |
| `loading`         | `boolean`              | `false`          | Shows a spinner in place of the chevron.                                     |
| `clearable`       | `boolean`              | `false`          | Shows an 'X' to reset the value.                                             |

## 🕹️ Interaction & Logic

- **Smart Positioning**: The dropdown automatically flips upward if there is insufficient space
  below the field (minimum 250px).
- **Flattening Engine**: The `useSelectState` hook flattens nested option trees into a linear list
  for keyboard navigation while maintaining depth metadata for indentation.
- **Keyboard Navigation**: Supports `ArrowDown`/`ArrowUp` for highlighting, `Enter` for selection,
  and `Backspace` to remove the last chip when the search query is empty.
- **Ripple Effects**: Integrated with `useRipple` to provide tactile feedback on container clicks.

## 🎨 Styling

Styles are defined in `select-field.css`:

- **Chip Variants**: Chips feature a removable 'X' and adaptive background colors based on the
  theme.
- **Dropdown Depth**: Indentation for nested items is calculated dynamically:
  `paddingLeft: (depth * 12) + 12 + 'px'`.
- **Focus States**: High-contrast border and focus ring application via `EffectWrapper`.

```

### File: documentation\packages\fields\SliderField.md

```md
# Field Component: SliderField

A highly customizable slider component for selecting single values or ranges. It supports linear and
logarithmic scales, snapping to custom marks, and vertical or horizontal orientations.

## 📂 Project Structure

```text
./packages/fields/
├── src/
│   ├── components/
│   │   └── SliderField.tsx       # Main slider component logic
│   ├── hooks/
│   │   └── useSliderState.ts     # Range logic, pointer math, and collision
│   ├── styles/
│   │   └── fields/
│   │       └── slider-field.css  # Track, fill, and thumb styling
│   └── types/
│       └── components/
│           └── slider-field.ts   # Mark definitions and field props
```

## 🚀 Usage

### Single Value Slider

A basic slider with defined min/max and step increments.

```tsx
import { SliderField } from '@projective/fields';

export default function VolumeControl() {
	return (
		<SliderField
			label='Volume'
			min={0}
			max={100}
			step={5}
			defaultValue={50}
		/>
	);
}
```

### Range Slider with Marks

Selecting a numeric span with visual indicators and snapping logic.

```tsx
<SliderField
	label='Price Range'
	range
	min={0}
	max={1000}
	defaultValue={[200, 800]}
	marks={[
		{ value: 0, label: '$0' },
		{ value: 500, label: '$500' },
		{ value: 1000, label: '$1k' },
	]}
	snapToMarks
/>;
```

### Vertical Orientation

A vertical slider with a logarithmic scale, useful for technical or scientific inputs.

```tsx
<SliderField
	label='Frequency'
	vertical
	height='300px'
	scale='logarithmic'
	min={20}
	max={20000}
/>;
```

## ⚙️ API Reference

### SliderField Props

Extends `ValueFieldProps<number | number[]>`.

| Prop          | Type                        | Default     | Description                                     |
| :------------ | :-------------------------- | :---------- | :---------------------------------------------- |
| `min` / `max` | `number`                    | `0` / `100` | The boundary values of the slider.              |
| `step`        | `number`                    | `1`         | The increment value for the handles.            |
| `range`       | `boolean`                   | `false`     | Enables dual handles for selecting a span.      |
| `vertical`    | `boolean`                   | `false`     | Flips the layout to a vertical axis.            |
| `marks`       | `boolean \| SliderMark[]`   | -           | Visual ticks and labels along the track.        |
| `snapToMarks` | `boolean`                   | `false`     | Forces handles to jump to the nearest mark.     |
| `scale`       | `'linear' \| 'logarithmic'` | `'linear'`  | Changes the distribution logic of the track.    |
| `minDistance` | `number`                    | `0`         | The minimum required gap between range handles. |
| `passthrough` | `boolean`                   | `false`     | Allows range handles to cross over each other.  |

## 🕹️ Logic & Physics

- **Precision Pointer Math**: The `useSliderState` hook calculates percentage values based on
  `getBoundingClientRect` to ensure handles track the pointer accurately across different screen
  sizes.
- **Collision Detection**: Unless `passthrough` is enabled, the state engine enforces `minDistance`
  constraints to prevent handles from overlapping or reversing order.
- **Logarithmic Scaling**: Converts linear track percentages to logarithmic values (and vice-versa)
  using utility functions to provide better resolution at the lower end of wide ranges.
- **Keyboard Support**: Handles include standard ARIA roles and can be navigated via arrow keys for
  accessibility.

## 🎨 Styling

Styles are defined in `slider-field.css`:

- **Dynamic Fill**: The highlighted track portion (fill) is calculated as a separate absolute
  element based on handle positions.
- **Thumb Feedback**: Thumb handles use `transform: scale()` on hover and active states to provide
  tactile visual feedback.
- **Vertical Layout**: When the `vertical` flag is present, flex directions and absolute positioning
  (e.g., `bottom` vs `left`) are automatically swapped.

```

### File: documentation\packages\fields\TextField.md

```md
# Field Component: TextField

The foundational input component for the Projective platform. It supports single-line text,
passwords, emails, and multi-line textareas with integrated label floating, validation messaging,
and icon adornments.

## 📂 Project Structure

```text
packages/fields/
├── src/
│   ├── components/
│   │   └── TextField.tsx         # Main component logic
│   ├── hooks/
│   │   ├── useFieldState.ts      # Validation and signal syncing
│   │   └── useInteraction.ts     # Focus and hover state tracking
│   ├── styles/
│   │   └── fields/
│   │       └── text-field.css    # Layout and visual states
│   └── types/
│       └── components/
│           └── text-field.ts     # TypeScript interfaces
```

## 🚀 Usage

### Basic Input

Standard text input with a floating label and a help tooltip.

```tsx
import { TextField } from '@projective/fields';
import { useSignal } from '@preact/signals';

export default function MyForm() {
	const name = useSignal('');

	return (
		<TextField
			id='user-name'
			label='Full Name'
			value={name}
			placeholder='e.g. John Doe'
			help='Enter your name exactly as it appears on your ID.'
			required
		/>
	);
}
```

### Multiline & Character Count

Auto-scaling textarea with character limit feedback.

```tsx
<TextField
	label='Bio'
	multiline
	rows={4}
	maxLength={200}
	showCount
	placeholder='Tell us about your experience...'
/>;
```

### Adornments & Password Toggle

Adding icons or text to the start or end of the field.

```tsx
import { IconEye, IconLock } from '@tabler/icons-preact';

<TextField
	type='password'
	label='Password'
	prefix={<IconLock size={18} />}
	suffix={<IconEye size={18} />}
	onSuffixClick={() => console.log('Toggle visibility')}
/>;
```

## ⚙️ API Reference

### TextField Props

Extends `ValueFieldProps<string>` and `AdornmentProps`.

| Prop           | Type            | Default    | Description                                          |
| :------------- | :-------------- | :--------- | :--------------------------------------------------- |
| `type`         | `TextType`      | `'text'`   | Input type (email, password, tel, etc.).             |
| `multiline`    | `boolean`       | `false`    | Renders a `textarea` instead of an `input`.          |
| `rows`         | `number`        | `3`        | Initial rows for multiline mode.                     |
| `floating`     | `boolean`       | `true`     | Whether the label should float into the border.      |
| `help`         | `string \| JSX` | -          | Contextual help content for the tooltip.             |
| `helpPosition` | `HelpPosition`  | `'inline'` | Position of the help icon (inline, top-right, etc.). |
| `prefix`       | `JSX \| string` | -          | Adornment placed before the input.                   |
| `suffix`       | `JSX \| string` | -          | Adornment placed after the input.                    |
| `showCount`    | `boolean`       | `false`    | Displays the current/max character count.            |

## 🕹️ Interaction & Validation

- **Floating Labels**: The label automatically transitions from a placeholder position to the top
  border when the field is focused or has a value.
- **Automatic Validation**: Validation (e.g., `required` check) is triggered on `blur` if the field
  has been "touched".
- **Signal Syncing**: Supports two-way binding with Preact Signals. If a non-signal value is passed,
  the component maintains an internal signal to ensure reactive UI updates.

## 🎨 Styling

Styles are defined in `text-field.css` and use semantic CSS variables:

- **States**: High-contrast borders are applied for `--focused`, `--error`, and `--disabled` states.
- **Focus Ring**: Utilizes the `EffectWrapper` to provide a non-destructive glow/ring effect around
  the field container.
- **Transitions**: Smooth 150ms transitions for border colors and label scaling.

```

### File: documentation\packages\fields\TimeField.md

```md
# Field Component: TimeField

A precise time selection component that utilizes an interactive analog-style clock interface. It
supports single and multiple time selections, custom intervals, and integration with the platform's
Popover system.

## 📂 Project Structure

```text
packages/fields/
├── src/
│   ├── components/
│   │   ├── TimeField.tsx         # Main component logic
│   │   └── datetime/
│   │       └── TimeClock.tsx     # Analog clock face and pointer logic
│   ├── styles/
│   │   ├── fields/
│   │   │   └── date-field.css    # Shared container layout
│   │   └── components/
│   │       └── time-clock.css    # Clock face and digital header styling
│   └── types/
│       └── components/
│           └── time-field.ts     # Selection modes and value types
```

## 🚀 Usage

### Single Time Picker (Default)

Standard time selection using a popup analog clock.

```tsx
import { TimeField } from '@projective/fields';
import { DateTime } from '@projective/types';

export default function MyForm() {
	return (
		<TimeField
			label='Start Time'
			placeholder='HH:MM'
			onChange={(time) => console.log('Selected:', time)}
		/>
	);
}
```

### Multiple Time Selection

Allows users to pick several distinct timestamps, useful for scheduling availability slots.

```tsx
<TimeField
	label='Available Slots'
	selectionMode='multiple'
	variant='popup'
/>;
```

### Inline Variant

Renders the `TimeClock` directly in the layout without a popup wrapper.

```tsx
<TimeField
	label='Select Time'
	variant='inline'
	defaultValue={new DateTime()}
/>;
```

## ⚙️ API Reference

### TimeField Props

Extends `ValueFieldProps<TimeValue>` and `AdornmentProps`.

| Prop            | Type                             | Default    | Description                                    |
| :-------------- | :------------------------------- | :--------- | :--------------------------------------------- |
| `selectionMode` | `'single' \| 'multiple'`         | `'single'` | Determines if one or many times can be picked. |
| `variant`       | `'popup' \| 'inline' \| 'input'` | `'popup'`  | Controls the display mode of the clock.        |
| `value`         | `DateTime \| DateTime[]`         | -          | Controlled time value(s).                      |
| `onChange`      | `(val: TimeValue) => void`       | -          | Callback triggered on time update.             |
| `placeholder`   | `string`                         | `'HH:MM'`  | Text shown when no time is selected.           |

## 🕹️ Logic & Clock Features

- **Analog Interaction**: The `TimeClock` component uses pointer events to calculate angles relative
  to the center, mapping coordinates to 12-hour or 60-minute segments.
- **Auto-Switching**: In `single` selection mode, the clock automatically transitions from 'hours'
  to 'minutes' view after a valid hour is selected to streamline the user flow.
- **AM/PM Context**: A dedicated digital header allows users to toggle between AM and PM, which
  updates the internal `DateTime` object's hour value (0-23) accordingly.
- **Multi-Select Toggle**: In `multiple` mode, clicking an existing time on the clock face removes
  it (toggles), while clicking a new segment adds it to the value array.

## 🎨 Styling

Styles are defined in `time-clock.css`:

- **Clock Hand**: A visual hand points to the currently active segment, with a smooth rotation
  calculated via `Math.atan2`.
- **Digital Display**: The header features a large digital readout that acts as a switch between
  hour and minute edit modes.
- **Active States**: Selected segments are highlighted with `--bg-brand-solid`, while multi-selected
  segments use a subtle `--bg-brand-subtle` to differentiate from the primary selection.

```

### File: documentation\packages\ui\Accordion.md

```md
# UI Component: Accordion

A vertically stacked set of interactive headings that each reveal an associated section of content.
Built with Preact and Preact Signals for high-performance state management within the Deno Fresh
framework.

## 📂 Project Structure

```text
packages/ui/
├── src/
│   ├── components/
│   │   └── accordion/
│   │       ├── index.ts              # Entry point
│   │       ├── Accordion.tsx         # Root container & logic
│   │       ├── AccordionItem.tsx     # Item wrapper & context
│   │       ├── AccordionTrigger.tsx  # Header & toggle button
│   │       └── AccordionContent.tsx  # Collapsible panel
│   ├── hooks/
│   │   └── useAccordion.ts           # State & interaction logic
│   ├── styles/
│   │   └── components/
│   │       └── accordion.css         # Component styling
│   └── types/
│       └── components/
│           └── accordion.ts          # TypeScript interfaces
```

## 🚀 Usage

### Single Expansion (Default)

In `single` mode, only one item can be expanded at a time. Expanding another item automatically
collapses the current one.

```tsx
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@projective/ui';

export default function MyAccordion() {
	return (
		<Accordion type='single' collapsible defaultValue='item-1'>
			<AccordionItem value='item-1'>
				<AccordionTrigger subtitle='Platform vision and goals'>
					What is Projective?
				</AccordionTrigger>
				<AccordionContent>
					Projective is a collaborative freelancing platform designed for teams and businesses.
				</AccordionContent>
			</AccordionItem>

			<AccordionItem value='item-2'>
				<AccordionTrigger>How do I start a team?</AccordionTrigger>
				<AccordionContent>
					You can create a team from your freelancer dashboard and invite collaborators.
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
```

## ⚙️ API Reference

### Accordion (Root)

The main container that coordinates the state between items.

| Prop            | Type                                  | Default      | Description                                          |
| :-------------- | :------------------------------------ | :----------- | :--------------------------------------------------- |
| `type`          | `'single' \| 'multiple'`              | `'single'`   | Determines if one or many items can be open.         |
| `variant`       | `'outlined' \| 'filled' \| 'ghost'`   | `'outlined'` | Visual style of the accordion.                       |
| `density`       | `'compact' \| 'normal' \| 'spacious'` | `'normal'`   | Controls vertical padding.                           |
| `collapsible`   | `boolean`                             | `false`      | In `single` mode, allows the open item to be closed. |
| `value`         | `string \| string[]`                  | -            | Controlled expansion state.                          |
| `defaultValue`  | `string \| string[]`                  | -            | Initial expansion state for uncontrolled mode.       |
| `onValueChange` | `(val: string \| string[]) => void`   | -            | Callback triggered on item toggle.                   |

### AccordionTrigger

The interactive header element.

| Prop        | Type                | Description                                                        |
| :---------- | :------------------ | :----------------------------------------------------------------- |
| `subtitle`  | `ComponentChildren` | Optional text displayed below the main title.                      |
| `startIcon` | `ComponentChildren` | Icon displayed at the beginning of the header.                     |
| `icon`      | `ComponentChildren` | Overrides the default chevron icon.                                |
| `actions`   | `ComponentChildren` | Interactive elements (e.g., buttons) that don't trigger expansion. |

## ⌨️ Accessibility

The Accordion component implements WAI-ARIA patterns for accessible disclosure widgets:

- **Keyboard Navigation**: Use `ArrowDown` and `ArrowUp` to move focus between triggers. `Home` and
  `End` jump to the first and last triggers respectively.
- **Aria Attributes**: Automatically manages `aria-expanded` and `aria-controls` for screen readers.
- **Roles**: Content panels use `role="region"` for better landmarks.

## 🎨 Styling

Styles are defined in `accordion.css` and use CSS variables for theme-aware customization:

- `--accordion-radius`: Border radius of the container.
- `--accordion-border-color`: Color used for outlines and separators.
- `--accordion-padding-y`: Vertical spacing based on `density`.

```

### File: documentation\packages\ui\Splitter.md

```md
# UI Component: Splitter

A flexible, resizable layout component that allows users to adjust the size of multiple panes. It
supports both horizontal and vertical orientations, keyboard navigation, touch interactions, and
pane collapsing.

## 📂 Project Structure

```text
packages/ui/
├── src/
│   ├── components/
│   │   └── splitter/
│   │       ├── index.ts              # Entry point
│   │       ├── Splitter.tsx          # Main container logic
│   │       ├── SplitterPane.tsx      # Individual pane wrapper
│   │       └── SplitterGutter.tsx    # Resizable handle/gutter
│   ├── hooks/
│   │   └── useSplitter.ts            # Resize and collapse logic
│   ├── styles/
│   │   └── components/
│   │       └── splitter.css          # Layout and handle styling
│   └── types/
│       └── components/
│           └── splitter.ts           # TypeScript interfaces
```

## 🚀 Usage

### Horizontal Splitter (Default)

The Splitter defaults to a horizontal layout. Panes can be constrained using `minSize` and `maxSize`
(percentages).

```tsx
import { Splitter, SplitterPane } from '@projective/ui';

export default function Layout() {
	return (
		<div style={{ height: '400px' }}>
			<Splitter direction='horizontal' initialSizes={[30, 70]}>
				<SplitterPane minSize={20}>
					<div className='p-4'>Sidebar Content</div>
				</SplitterPane>
				<SplitterPane>
					<div className='p-4'>Main Content Area</div>
				</SplitterPane>
			</Splitter>
		</div>
	);
}
```

### Collapsible Panes

Enable `collapsible` on a pane to allow it to be collapsed to 0% width/height. This can be triggered
by double-clicking the gutter or using the `Enter` key.

```tsx
<Splitter direction='horizontal'>
	<SplitterPane collapsible defaultCollapsed minSize={15}>
		<aside>Navigation</aside>
	</SplitterPane>
	<SplitterPane>
		<main>Dashboard</main>
	</SplitterPane>
</Splitter>;
```

## ⚙️ API Reference

### Splitter (Root)

Coordinates the layout and resizing of its child panes.

| Prop           | Type                         | Default        | Description                                                      |
| :------------- | :--------------------------- | :------------- | :--------------------------------------------------------------- |
| `direction`    | `'horizontal' \| 'vertical'` | `'horizontal'` | The orientation of the split.                                    |
| `initialSizes` | `number[]`                   | -              | Array of percentage values for initial pane widths/heights.      |
| `minPaneSize`  | `number`                     | `10`           | Global minimum percentage size for any pane.                     |
| `breakpoint`   | `number`                     | `0`            | Container width (px) below which the splitter stacks vertically. |
| `onResizeEnd`  | `(sizes: number[]) => void`  | -              | Callback triggered when the user stops resizing.                 |

### SplitterPane

A wrapper for individual sections within the splitter.

| Prop               | Type      | Description                                      |
| :----------------- | :-------- | :----------------------------------------------- |
| `minSize`          | `number`  | Minimum percentage size for this specific pane.  |
| `maxSize`          | `number`  | Maximum percentage size for this specific pane.  |
| `collapsible`      | `boolean` | Allows the pane to be collapsed to 0% size.      |
| `defaultCollapsed` | `boolean` | If true, the pane starts in its collapsed state. |

## 🕹️ Interaction & Accessibility

The Splitter is designed for high-precision control across all input methods:

- **Keyboard**: Focus the gutter and use `ArrowKeys` to resize (2% steps). Use `Shift + ArrowKeys`
  for larger adjustments (10% steps). Press `Enter` or `Space` to toggle collapse on supported
  panes.
- **Touch Support**: Includes an invisible "hitbox" around gutters to make them easier to grab on
  mobile devices.
- **Roles**: Gutters use `role="separator"` and manage `aria-orientation` and `aria-controls` for
  assistive technology.

## 🎨 Styling

Styles are defined in `splitter.css`:

- **Gutter Feedback**: The gutter changes color (`var(--primary-500)`) on hover, focus, or active
  drag to provide visual feedback.
- **Responsive Stack**: When the `breakpoint` is reached, the splitter removes the interactive
  gutters and converts to a simple vertical divider.
- **Resizing Cursor**: The `body` cursor is globally managed during drag operations to maintain the
  correct resize icon even if the mouse leaves the gutter.

```

### File: documentation\packages\ui\Stepper.md

```md
# UI Component: Stepper

A versatile component for navigating through a multi-step process. It supports horizontal and
vertical orientations, linear or non-linear progression, and visual feedback for active, completed,
or erroneous states.

## 📂 Project Structure

```text
packages/ui/
├── src/
│   ├── components/
│   │   └── stepper/
│   │       ├── index.ts              # Entry point
│   │       ├── Stepper.tsx           # Provider and root container
│   │       ├── StepperHeader.tsx     # Step indicator container
│   │       ├── Step.tsx              # Individual step indicator
│   │       ├── StepperContent.tsx    # Panel container
│   │       ├── StepperPanel.tsx      # Individual step content panel
│   │       └── StepperFooter.tsx     # Navigation buttons
│   ├── hooks/
│   │   └── useStepper.ts             # Progression and validation logic
│   ├── styles/
│   │   └── components/
│   │       └── stepper.css           # Component layout and transitions
│   └── types/
│       └── components/
│           └── stepper.ts            # TypeScript interfaces
```

## 🚀 Usage

### Basic Linear Stepper

The stepper defaults to a linear progression, meaning users must complete Step 1 before moving to
Step 2.

```tsx
import {
	Step,
	Stepper,
	StepperContent,
	StepperFooter,
	StepperHeader,
	StepperPanel,
} from '@projective/ui';

export default function SignupFlow() {
	return (
		<Stepper linear defaultActiveStep={0} responsive>
			<StepperHeader>
				<Step label='Account' description='Set up credentials' />
				<Step label='Profile' description='About you' />
				<Step label='Finish' />
			</StepperHeader>

			<StepperContent>
				<StepperPanel>Credential Form...</StepperPanel>
				<StepperPanel>Profile Details...</StepperPanel>
				<StepperPanel>Review & Submit...</StepperPanel>
			</StepperContent>

			<StepperFooter />
		</Stepper>
	);
}
```

### Async Validation

Use the `beforeStepChange` prop to validate the current step (e.g., API calls) before allowing the
user to proceed.

```tsx
<Stepper
	beforeStepChange={async (next, current) => {
		if (current === 0) {
			const ok = await validateAccount();
			return ok; // Return false to block progression
		}
		return true;
	}}
>
	{/* Steps... */}
</Stepper>;
```

## ⚙️ API Reference

### Stepper (Root)

Manages the shared state and configuration for the entire flow.

| Prop               | Type                                    | Default        | Description                                              |
| :----------------- | :-------------------------------------- | :------------- | :------------------------------------------------------- |
| `orientation`      | `'horizontal' \| 'vertical'`            | `'horizontal'` | Layout direction of the stepper.                         |
| `variant`          | `'circle' \| 'dot'`                     | `'circle'`     | Visual style of the indicators.                          |
| `linear`           | `boolean`                               | `true`         | Enforces sequential step completion.                     |
| `responsive`       | `number \| boolean`                     | -              | Width (px) to switch to vertical layout. `true` = 600px. |
| `beforeStepChange` | `(next, current) => boolean \| Promise` | -              | Sync or Async guard for navigation.                      |

### Step

The individual indicator within the `StepperHeader`.

| Prop          | Type                | Description                                       |
| :------------ | :------------------ | :------------------------------------------------ |
| `label`       | `string`            | Primary text for the step.                        |
| `description` | `string`            | Optional supporting text.                         |
| `optional`    | `boolean`           | Adds an "(Optional)" tag to the label.            |
| `icon`        | `ComponentChildren` | Custom icon to override the default number/check. |

## 🕹️ Interaction & Accessibility

- **State Management**: Uses Preact Signals (`activeStep`, `isLoading`, `stepErrors`) to ensure UI
  updates are reactive and efficient.
- **Responsive Stacking**: When `responsive` is enabled, the stepper utilizes a `ResizeObserver` to
  automatically flip between horizontal and vertical layouts based on container width.
- **Loading States**: The `StepperFooter` buttons automatically disable and show a spinner when
  `beforeStepChange` returns a pending promise.

## 🎨 Styling

Styles are defined in `stepper.css`:

- **Transitions**: Panels use a subtle fade-in and slide-up animation when activated
  (`stepperFadeIn`).
- **Connectors**: The lines between steps transition their background color from
  `var(--field-border)` to `var(--primary-500)` upon completion.

```

### File: documentation\packages\ui\Toast.md

```md
# UI Component: Stepper

A versatile component for navigating through a multi-step process. It supports horizontal and
vertical orientations, linear or non-linear progression, and visual feedback for active, completed,
or erroneous states.

## 📂 Project Structure

```text
packages/ui/
├── src/
│   ├── components/
│   │   └── stepper/
│   │       ├── index.ts              # Entry point
│   │       ├── Stepper.tsx           # Provider and root container
│   │       ├── StepperHeader.tsx     # Step indicator container
│   │       ├── Step.tsx              # Individual step indicator
│   │       ├── StepperContent.tsx    # Panel container
│   │       ├── StepperPanel.tsx      # Individual step content panel
│   │       └── StepperFooter.tsx     # Navigation buttons
│   ├── hooks/
│   │   └── useStepper.ts             # Progression and validation logic
│   ├── styles/
│   │   └── components/
│   │       └── stepper.css           # Component layout and transitions
│   └── types/
│       └── components/
│           └── stepper.ts            # TypeScript interfaces
```

## 🚀 Usage

### Basic Linear Stepper

The stepper defaults to a linear progression, meaning users must complete Step 1 before moving to
Step 2.

```tsx
import {
	Step,
	Stepper,
	StepperContent,
	StepperFooter,
	StepperHeader,
	StepperPanel,
} from '@projective/ui';

export default function SignupFlow() {
	return (
		<Stepper linear defaultActiveStep={0} responsive>
			<StepperHeader>
				<Step label='Account' description='Set up credentials' />
				<Step label='Profile' description='About you' />
				<Step label='Finish' />
			</StepperHeader>

			<StepperContent>
				<StepperPanel>Credential Form...</StepperPanel>
				<StepperPanel>Profile Details...</StepperPanel>
				<StepperPanel>Review & Submit...</StepperPanel>
			</StepperContent>

			<StepperFooter />
		</Stepper>
	);
}
```

### Async Validation

Use the `beforeStepChange` prop to validate the current step (e.g., API calls) before allowing the
user to proceed.

```tsx
<Stepper
	beforeStepChange={async (next, current) => {
		if (current === 0) {
			const ok = await validateAccount();
			return ok; // Return false to block progression
		}
		return true;
	}}
>
	{/* Steps... */}
</Stepper>;
```

## ⚙️ API Reference

### Stepper (Root)

Manages the shared state and configuration for the entire flow.

| Prop               | Type                                    | Default        | Description                                              |
| :----------------- | :-------------------------------------- | :------------- | :------------------------------------------------------- |
| `orientation`      | `'horizontal' \| 'vertical'`            | `'horizontal'` | Layout direction of the stepper.                         |
| `variant`          | `'circle' \| 'dot'`                     | `'circle'`     | Visual style of the indicators.                          |
| `linear`           | `boolean`                               | `true`         | Enforces sequential step completion.                     |
| `responsive`       | `number \| boolean`                     | -              | Width (px) to switch to vertical layout. `true` = 600px. |
| `beforeStepChange` | `(next, current) => boolean \| Promise` | -              | Sync or Async guard for navigation.                      |

### Step

The individual indicator within the `StepperHeader`.

| Prop          | Type                | Description                                       |
| :------------ | :------------------ | :------------------------------------------------ |
| `label`       | `string`            | Primary text for the step.                        |
| `description` | `string`            | Optional supporting text.                         |
| `optional`    | `boolean`           | Adds an "(Optional)" tag to the label.            |
| `icon`        | `ComponentChildren` | Custom icon to override the default number/check. |

## 🕹️ Interaction & Accessibility

- **State Management**: Uses Preact Signals (`activeStep`, `isLoading`, `stepErrors`) to ensure UI
  updates are reactive and efficient.
- **Responsive Stacking**: When `responsive` is enabled, the stepper utilizes a `ResizeObserver` to
  automatically flip between horizontal and vertical layouts based on container width.
- **Loading States**: The `StepperFooter` buttons automatically disable and show a spinner when
  `beforeStepChange` returns a pending promise.

## 🎨 Styling

Styles are defined in `stepper.css`:

- **Transitions**: Panels use a subtle fade-in and slide-up animation when activated
  (`stepperFadeIn`).
- **Connectors**: The lines between steps transition their background color from
  `var(--field-border)` to `var(--primary-500)` upon completion.

```

### File: documentation\sitemap\Auth.md

```md
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

```

### File: documentation\sitemap\dashboard\Business.md

```md
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

| Route Path                 | File Path                  | Description                                                                                                        |
| :------------------------- | :------------------------- | :----------------------------------------------------------------------------------------------------------------- |
| `/business`                | `index.tsx`                | Directory of all business entities owned or managed by the user.                                                   |
| `/business/new`            | `new/index.tsx`            | Registration flow for a new business entity, including legal name and branding setup.                              |
| `/business/[bid]`          | `[bid]/index.tsx`          | **Business Hub**: High-level view of projects, total spend, and active collaborators associated with the business. |
| `/business/[bid]/settings` | `[bid]/settings/index.tsx` | Management of business metadata, billing preferences, and department setup (Phase 3).                              |

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

```

### File: documentation\sitemap\dashboard\Communications.md

```md
# (dashboard) Module: Communications

The Communications module is the real-time interaction hub of the platform, facilitating direct
collaboration through messaging, file sharing, and activity tracking. It is deeply integrated with
the project lifecycle, allowing for stage-specific discussions that maintain a permanent audit trail
of project decisions.

---

## 🛤️ Frontend Routes

**Folder Path:** `/apps/web/routes/(dashboard)/messages/`

The messaging UI is optimized for both global high-level conversations and focused, context-specific
stage chats.

| Route Path                       | File Path                        | Description                                                                          |
| :------------------------------- | :------------------------------- | :----------------------------------------------------------------------------------- |
| `/messages`                      | `index.tsx`                      | Global Inbox: List of all active threads (Direct, Team, and Project-based).          |
| `/messages/[chatid]`             | `[chatid]/chat.tsx`              | **Chat Workspace**: The primary interface for sending messages and viewing history.  |
| `/messages/[chatid]/info`        | `[chatid]/info.tsx`              | Metadata view: Thread participants, pinned items, and notification settings.         |
| `/messages/[chatid]/attachments` | `[chatid]/attachments/index.tsx` | Dedicated gallery of all files, images, and links shared within the specific thread. |

### 🛠️ Core Components

- **ChatList**: A high-performance, virtualized container that handles "reverse-infinite" scrolling
  and scroll anchoring for incoming messages.
- **FileDrop**: Integrated into the message input to handle multi-file uploads with real-time
  processing status.

---

## ⚡ API Endpoints

**Base Path:** `/api/v1/dashboard/comms/`

These endpoints utilize `RealtimeDataSource` logic to ensure low-latency updates across clients.

| Endpoint             | Method  | Permission | Description                                                           |
| :------------------- | :------ | :--------- | :-------------------------------------------------------------------- |
| `messages/`          | `GET`   | (Auth)     | Fetches the recent thread list for the current `active_profile_id`.   |
| `messages/[id]`      | `GET`   | (Auth)     | Retrieves paginated message history for a specific thread.            |
| `messages/[id]`      | `POST`  | (Auth)     | Sends a new message or starts a new thread.                           |
| `messages/[id]/read` | `PATCH` | (Auth)     | Updates the "last read" timestamp for the current user in the thread. |

---

## 🕹️ Logic & Real-time Integration

### Contextual Threading

The platform supports multiple types of conversation contexts:

- **Direct Messages (DM)**: One-on-one private threads between two profiles.
- **Team Threads**: Group conversations limited to the roster of an `active_team_id`.
- **Stage Threads**: Automated threads created for every project stage. Access is governed by
  `StagePermission.ViewPrivateNotes` or general stage assignment.

### File Handling

When a file is dropped into a chat, it is processed via the `FileProcessor` system before being
committed to the message thread.

```ts
// Example message payload with processed metadata
{
  "thread_id": "uuid",
  "text": "Please check the new logo version.",
  "attachments": [{
    "id": "file_uuid",
    "type": "Image",
    "processingMeta": { "optimized": true, "width": 1024 }
  }]
}
```

---

## 🎨 Layout & Interaction

The communication view uses a nested layout (`_layout.tsx`) that allows the message thread to remain
active while the user navigates between `chat.tsx`, `info.tsx`, and `attachments/index.tsx`. This
ensures that the WebSocket connection (if active) is not interrupted during navigation within the
same `[chatid]`.

```

### File: documentation\sitemap\dashboard\Projects.md

```md
# (dashboard) Module: Projects

The Projects module is the primary workspace where Users (Businesses, Freelancers, and Teams)
collaborate on deliverables. It manages everything from the high-level project timeline down to
specific stage actions like funding escrow and submitting work.

---

## 🛤️ Frontend Routes

**Folder Path:** `/apps/web/routes/(dashboard)/projects/`

The routing structure follows a hierarchical pattern: **Project List → Project Hub → Stage
Workspace**.

### 1. Project Management

| Route Path      | File Path       | Description                                                                  |
| :-------------- | :-------------- | :--------------------------------------------------------------------------- |
| `/projects`     | `index.tsx`     | Searchable list of all projects the user is involved in. Uses `DataDisplay`. |
| `/projects/new` | `new/index.tsx` | Multi-step creation flow for new project drafts.                             |

### 2. Project Hub (`[projectid]/`)

These routes focus on the project as a single entity.

| Route Path                 | File Path      | Description                                                      |
| :------------------------- | :------------- | :--------------------------------------------------------------- |
| `/projects/[pid]`          | `index.tsx`    | Project overview, high-level status, and milestone summary.      |
| `/projects/[pid]/timeline` | `timeline.tsx` | Gantt or list-based view of all stages and dependencies.         |
| `/projects/[pid]/team`     | `team.tsx`     | Roster of involved members and their specific roles/permissions. |
| `/projects/[pid]/finance`  | `finance.tsx`  | Budget tracking, total spend, and escrow status for the project. |
| `/projects/[pid]/settings` | `settings.tsx` | Project configuration, metadata updates, and archiving.          |

### 3. Stage Workspace (`[projectid]/[stageid]/`)

The most granular level where work happens. This route utilizes `stageTabs` to dynamically render
navigation based on the `StageType`.

| Tab (Sub-route) | Target Component    | Contextual Requirement                              |
| :-------------- | :------------------ | :-------------------------------------------------- |
| `chat`          | `ChatList`          | Real-time communication for the specific stage.     |
| `files`         | `FileDrop`          | Repository for stage-specific resources and assets. |
| `submissions`   | `FileBased` View    | Handling deliverables and approval flows.           |
| `sessions`      | `SessionBased` View | Booking and management of 1-on-1 or group time.     |

---

## ⚡ API Endpoints

**Base Path:** `/api/v1/dashboard/projects/`

| Endpoint       | Method  | Permission       | Description                                                |
| :------------- | :------ | :--------------- | :--------------------------------------------------------- |
| `/`            | `GET`   | (Auth)           | Fetches paginated projects for the active persona.         |
| `/`            | `POST`  | (Auth)           | Creates a new project record in the `Draft` state.         |
| `/[id]`        | `GET`   | (Auth)           | Full project details including summarized stage counts.    |
| `/[id]/stages` | `GET`   | (Auth)           | List of stages associated with the project.                |
| `/[id]/stages` | `POST`  | `CreateStage`    | Adds a new stage to the project timeline.                  |
| `/[id]/status` | `PATCH` | `ManageSettings` | Transitions project state (e.g., `Active` to `Completed`). |

---

## 🔒 Security & Logic

### Permission Enforcement

Access to these routes and endpoints is strictly gated by the user's role in the
`security.session_context` and their specific project-level permissions.

- **Business Persona**: Typically holds `ManageMembers` and `FundEscrow` permissions.
- **Freelancer Persona**: Typically holds `SubmitWork` and `EditDetails` for assigned stages.

### Auditability

All critical transitions (e.g., creating a stage or moving a project to `OnHold`) are logged in
`security.audit_logs` to maintain a dispute-resolution trail.

```json
{
	"action": "stage.created",
	"entity_table": "stages",
	"actor_profile_id": "active_uuid",
	"metadata": {
		"project_id": "pid_uuid",
		"stage_type": "file_based"
	}
}
```

```

### File: documentation\sitemap\dashboard\Teams.md

```md
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

```

