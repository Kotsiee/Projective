# Projective User Flows  
Version: Draft MVP Architecture  
Date: 25 Oct 2025  
Author: GPT-5 (Projective System Docs)

---

## Actors (Who’s doing what)

### Business / Creator
- A person or company that wants work done.
- They can own multiple business profiles.
- They create projects, approve work, fund payments, open disputes.

### Freelancer
- An individual who offers services.
- Can act solo, join multiple teams, and sell work.
- Can take on different types of work modes (Create, Run, Educate, etc.).

### Team
- A group of freelancers acting like a micro-agency.
- Can be hired as a unit for certain stages or entire projects.

### Platform / System
- Handles auth, RLS isolation, escrow, dispute moderation, file access, audit trail, IP policy references, etc.

### Moderator (Internal / Admin)
- Only steps in for escalated disputes, fraud, abuse, safety, or IP claims.

---

## 1. Onboarding → First Project Flow (End-to-end narrative)

High level:
1. User signs up.
2. User chooses what they are.
3. User sets up profile + payout/billing.
4. User either posts a project (as a creator/business) or looks for work (as a freelancer).
5. The first project is created and staffed.
6. Work is delivered, paid, reviewed, possibly disputed.

We'll break that into phases.

---

### 1.1 Account Creation & Role Setup

``` text
Start
↓
Signup/Login (Supabase Auth)
- email/password OR OAuth
- Turnstile check for bots
↓
Verify Email (token link)
↓
Choose Path:
  [ I'm here to HIRE / I need work done ] → becomes Creator
  [ I'm here to WORK / Offer services ] → becomes Freelancer
↓
System creates:
- `auth.users` row
- `security.session_context` row
- If Freelancer path: create `org.freelancer_profiles`
- If Creator path: create `org.business_profiles`
↓
Dashboard boot
```

Details:
- A single human user can actually become both later. This is done through the account switcher (they can own one freelancer profile and many business profiles).
- We store in `session_context` which profile is “active,” and that value is embedded in the JWT for RLS.

Security notes:
- Refresh tokens are hashed and rotated.
- Every request to the API uses the active profile for access filtering via RLS.

---

### 1.2 Profile Completion

For Freelancers:
- Add headline, skills, pricing style, availability.
- Attach portfolio samples (uploads go → `attachments` bucket → scanned in `quarantine` first).
- Optionally join or create a Team.

For Creators (business):
- Add business name, billing email, location.
- Add payment method for funding stages later (Stripe on file).
- (Later phase) Verify identity for high-value spend / anti-fraud.

For Teams:
- A freelancer can create a team, invite others, and define roles (designer, dev, QA, PM).
- Team shows up as a hireable “unit” for a stage.

---

### 1.3 Payment Setup (Creator side)

Why early?
- You can’t actually start a paid stage without funding escrow.

Flow:
- Creator adds payment details (card / business payment method).
- The platform prepares “wallets” and enables escrows.
- No money moves yet, but escrow will be pulled before work starts.

``` text
Creator Dashboard
↓
Settings / Wallet
↓
Add Payment Method
↓
Stripe Connect / billing link
↓
Ready to fund escrows
```

(Teams / freelancers later add payout accounts so they can receive funds after stage approval.)

---

## 2. Project Lifecycle Overview

Now we zoom into how a project is created, staffed, executed, delivered, paid, and possibly disputed.

We cover:
- Full project (multi-stage)
- Single-stage projects
- Stage types and how they behave
- Tabs within a stage
- Escrow and approvals
- Revisions and disputes
- IP handling

---

### 2.1 Creating a Project (Creator perspective)

There are two paths:
A. Custom project (“Describe what you need”)  
B. Template (“Landing Page Build”, “SEO Campaign”, “Pitch Deck Coaching”, “App MVP”)

``` text
Creator Dashboard
↓
"New Project"
↓
Option A: Custom Project
  - Title, description, goals, timeline, budget comfort
  - Add first stage(s) manually
Option B: Use Template
  - Pick template category
  - System auto-loads suggested stages (Design, Build MVP, Test, etc.)
  - Each stage has a recommended Stage Type and suggested cost ranges
↓
Project Draft Created in DB:
- projects.projects (status = draft)
- projects.project_stages[] (status = open)
↓
Creator Reviews Stage List
  - Can remove stages
  - Can reorder them
  - Can change who they want to hire per stage:
    - Single freelancer
    - Multiple freelancers across stages
    - Whole team for multiple stages
↓
Save
```

During this step:
- No one is hired yet.
- Budget rules can be defined per stage:
  - fixed price
  - cap / hourly cap
  - free (like discovery/consult)

This maps to `projects.stage_budget_rules`.

---

### 2.2 Stage Types (How work is structured)

Stages are atomic units of work that can be assigned to either:
- A single freelancer
- A team
- (Eventually) multiple freelancers in parallel, but MVP tends toward 1 assignee per stage

Each stage has a “Stage Type,” which drives UI, approval rules, completion signals, and payment triggers.

#### 2.2.1 File Based
Typical freelancer types:
- Create (design, code, copywriting)
- Run / Execute (do the task and provide output)
- Test / Tweak (QA report, improved version)
What delivery looks like:
- Deliverable is a file, zip, doc, or link.
- Stage is marked “submitted” when files are uploaded as a Submission.
Tabs:
- Chat
- Attachments
- Details
- Submissions (required for File Based)

#### 2.2.2 Session Based
Typical freelancer types:
- Educate
- Advise
What delivery looks like:
- A booked call / session between creator and freelancer.
- Completion is logged after the session happens.
Tabs:
- Chat
- Attachments
- Details
- Calendar (session scheduling tab)

#### 2.2.3 Group Session Based
Typical freelancer types:
- Educate (group coaching / training class)
What delivery looks like:
- A live session with multiple attendees (e.g. 1 freelancer coach + 10 attendees from the creator’s team or audience).
- Completion is attendance + confirmation by the creator.
Tabs:
- Chat
- Attachments
- Details
- Calendar
- Attendees (list of registered participants, attendance log)

#### 2.2.4 Management Based
Typical freelancer types:
- Empower / Manage
(Example: project manager / producer / coordinator role.)
What delivery looks like:
- Ongoing coordination, reporting, decisions, directing other contributors.
- Completion may be time-bound (e.g. “2 weeks of PM coverage”).
Tabs:
- Chat
- Attachments
- Details
No special Submission tab because the “output” is the process itself, not one packaged file.

#### 2.2.5 Maintenance Based
Typical freelancer types:
- Execute
- Test / Tweak
(Example: “Keep the landing page updated weekly,” “Monthly bug fixes,” “Social calendar maintenance”.)
What delivery looks like:
- Ongoing recurring work for a period or retainer.
- Completion is either:
  - a recurring billing cycle (weekly/monthly), OR
  - explicit “maintenance complete” for this window.
Tabs:
- Chat
- Attachments
- Details
- Submissions (can be used to log periodic drops/updates)

---

### 2.3 Mapping Freelancer Types ↔ Stage Types

- Create → File Based  
  (Designer delivers Figma file, Developer delivers repo, Writer delivers copy doc.)
- Run / Execute → File Based or Maintenance Based  
  (VA uploads spreadsheets, marketing operator posts campaign reports weekly.)
- Educate → Session Based  
  (1:1 coaching call.)
- Educate (Group) → Group Session Based  
  (Training workshop for 20 employees.)
- Advise → Session Based  
  (Consulting, strategy call, technical guidance call.)
- Test / Tweak → File Based or Maintenance Based  
  (QA report, code review, performance audit, copy edit pass.)
- Empower / Manage → Management Based  
  (Project manager keeps everyone moving, communicates status, tracks blockers.)

This matters because:
- Different stage types imply different “what counts as done”.
- Different stage types change which tabs are shown in the UI.
- Different stage types can affect how escrow pays out.

---

### 2.4 Staffing a Stage (Hiring flow)

A stage can be filled in two main ways:

1. Creator browses and directly invites a freelancer or team.
2. Freelancers/teams apply to open stages of public or semi-public projects.

Hiring flow:
1. Creator selects a stage like “UI Design (File Based)”.
2. Creator views suggested freelancers / teams with matching skills.
3. Creator invites one (or more) to take that stage.
4. Invitee accepts.

When accepted:
- `projects.stage_assignments` is populated with who’s responsible.
- Stage status moves from `open` → `assigned` → `in_progress`.

If a team is hired, the team lead can internally assign sub-work. The platform does not need to micromanage internal distribution at MVP; we only track which team is accountable to deliver.

---

### 2.5 Funding & Escrow (Before work starts)

Before work officially starts, the Creator must fund that stage.

``` text
Stage "Design Landing Page" (File Based)
status: open
↓
Creator selects freelancer or team
↓
Platform calculates cost from stage_budget_rules
↓
Creator clicks "Fund Stage"
↓
Escrow created in finance.escrows
- status = funded
- amount_cents = agreed fee
↓
Stage moves to in_progress
Freelancer/team starts work
```

This prevents “do work first, maybe get paid later.”  
Funds sit in escrow, not yet released to the freelancer/team.

---

### 2.6 Collaboration During the Stage

Every stage has a “Stage Room” (like a mini workspace). Tabs:

- Chat  
  Real-time thread between the creator and the assigned freelancer/team (plus PM, plus anyone else allowed on that stage).
- Attachments  
  Shared files (stored in `attachments` bucket, mapped through `comms.message_attachments`, etc.).
- Details  
  Scope, acceptance criteria, deadlines, budget, revision terms.
- Submissions  
  (File Based / Maintenance Based only) Formal handover of deliverables. This is how payment approval is triggered.
- Calendar  
  (Session Based / Group Session Based only) Schedule, upcoming calls.
- Attendees  
  (Group Session Based only) Who’s attending the session(s), attendance history.

For Management Based stages:
- The PM / coordinator is expected to keep Chat, Details, and Attachments updated.  
- There is often no “final file,” just reporting and management outcomes.

---

### 2.7 Submission, Review, and Approval

For File Based and Maintenance Based stages:
1. Freelancer/team uploads final deliverable(s) to Submissions.
2. Stage status moves to `submitted`.
3. Creator reviews.

The creator now has 3 options:
- Approve  
- Request Revision  
- Dispute

#### Approve
- Stage status: `approved`.
- Escrow is released.
- Freelancer/team wallet is credited (transactions + payouts).

#### Request Revision
- Stage status: `revisions`.
- A `stage_revision_request` record is created:
  - type: minor | major
  - reason / requested changes
- The freelancer/team updates the work and resubmits.
- This can repeat, but eventually should converge to approval or dispute.

#### Dispute
- If the creator claims “this is not what we agreed,” “low quality,” “fraud,” etc., they can open a dispute tied to that stage’s escrow.
- finance.disputes is created:
  - opened_by_profile
  - reason
  - status = open
- Both parties can post statements / evidence into `finance.dispute_messages`.
- A moderator can escalate, rule, refund, partially release, etc.
- Stage is blocked from payout until dispute is resolved.

---

### 2.8 Session Based & Group Session Based completion

For these stage types, “submission” is not a file. It’s “did the session happen?”

- After the scheduled call/session:
  - Freelancer/team marks session delivered.
  - Creator confirms attendance and value received.
  - Creator can Approve, Request Revision (rare: e.g. “this session never happened / you didn’t show”), or Dispute.

For Group Session Based:
- Creator can confirm attendee list vs. what was promised.
- Freelancers/coaches get paid upon approval.

---

### 2.9 Management Based completion

Management Based stages (Empower / Manage type) are usually:
- “2 weeks project management”
- “Campaign coordination for October”
- “Launch oversight until go-live date”

They close when:
- The agreed period ends
- The creator is satisfied that the PM/manager fulfilled the agreed responsibilities

Approval then triggers escrow release.

If the creator claims “you didn’t actually manage anything,” that can become a dispute.

---

### 2.10 Maintenance Based & Retainers

Maintenance Based stages can act like mini-retainers or recurring upkeep:
- “Ongoing bug fixes for 30 days”
- “Weekly content uploads”
- “Monthly social media upkeep”

Two patterns:
- As one stage within a larger project (single billing window)
- As recurring contract (post-launch maintenance, long-term relationship)

In the recurring case, this evolves into something like a `maintenance_contract`:
- amount per period
- renewal cadence (weekly/monthly)
- who’s responsible

Payment is sliced per billing window and approved like any other stage window. This can be auto-approved if no dispute is filed by cutoff.

---

## 3. Single-Stage Projects

Not every job needs a complex multi-stage project.

Example use cases:
- “Write me a blog post”
- “Run an audit call for my landing page”
- “Coach my team for 1 hour”
- “Fix this bug”
- “Manage my launch this weekend”

Flow is simpler:

``` text
Creator → New Project
↓
Add one Stage only
  e.g. "SEO audit call" (Session Based)
  or "Fix Stripe webhook bug" (File Based)
↓
Invite freelancer OR pick from suggestions
↓
Fund escrow
↓
Work happens
↓
Submission or Session Complete
↓
Approve → Release escrow
(Or Revision / Dispute)
↓
Project marked completed
```

In DB terms:
- projects.projects has one row
- projects.project_stages has exactly one row
- After approval and payout, project.status becomes `completed`

This is crucial for early adoption: very low friction, same trust mechanics.

---

## 4. Disputes and IP Ownership

### 4.1 Disputes

A dispute can be opened when:
- Work not delivered
- Work delivered but not matching scope
- Work quality is unacceptable
- Freelancer says creator is abusing revision requests
- Session did not occur as claimed
- Breach of terms / harassment / non-payment
- IP misuse

What happens when a dispute opens:
1. finance.disputes row is created (status = open).
2. Linked to escrow for that stage (so funds are locked).
3. Both parties can submit evidence/messages (finance.dispute_messages).
4. Moderator is notified.

Outcomes:
- Release full escrow to freelancer/team.
- Refund full escrow to creator.
- Split escrow (partial payout).
- Mark as resolved with notes.
- In extreme cases: suspend accounts, flag IP, restrict withdrawals.

The RLS model ensures only involved parties plus moderators can see the dispute data.

### 4.2 IP & Licensing

We need IP clarity because:
- You explicitly said you want freelancers and creators to both be able to reuse work unless they choose otherwise.
- You also said you'd like the platform to carry liability.

So at stage creation / agreement, we capture an “IP mode” for that stage:
- Exclusive Transfer — Creator fully owns the deliverable.
- Licensed Use — Creator can use it commercially, but freelancer retains rights to resell.
- Internal/Non-Commercial — Coaching / strategy / internal insights that aren’t to be resold.
- Public / Template — Work that was already a template or asset and can be resold (think marketplace item).

This IP mode should live in stage details (either within `projects.project_stages` or a related `stage_contract_terms` table in the future).

Why:
- In a dispute that claims “you’re reselling my brand assets,” the moderator checks that selected IP mode.
- Reviews/ratings can mention “Delivered exclusive rights as promised,” which protects both sides.

During dispute resolution over IP:
- Moderator can instruct takedown / forbid resale / require removal from marketplace.
- Moderator’s decision goes into `finance.disputes.resolution_notes`.

---

## 5. End State of a Project

Project is considered done when:
- All stages are approved and paid out, OR
- All remaining stages are cancelled/removed, and whatever is left is not owed.

End-of-project flow:

``` text
All stages either:
  - approved + paid
  - cancelled
  - resolved via dispute
↓
Creator leaves ratings for freelancers / teams
↓
Freelancers / teams rate the creator (mutual rating system)
↓
Project is archived as completed
↓
Its assets (final deliverables, transcripts, etc.) stay accessible in project files
↓
Wallets updated, payouts queued
```

After completion:
- Ratings affect discoverability.
- Assets can optionally be turned into marketplace items (future phase):  
  e.g. “the landing page template we built for you could be sold as a generic template,” depending on IP mode.

---

## 6. Flow Library (Quick Reference)

Below are the core flows in short form.

### 6.1 User Onboarding Flow (Freelancer or Creator)

``` text
Sign Up / Login
↓
Email Verify
↓
Pick Role (Hire vs Work)
↓
System creates profile(s)
↓
Payment setup:
  - Creator: add funding method
  - Freelancer/Team: add payout info
↓
Land in dashboard with proper context
```

---

### 6.2 Project Creation Flow (Creator)

``` text
Dashboard → New Project
↓
Pick Template OR Custom
↓
Auto-generate stages (with Stage Type + suggested pricing)
↓
Tweak stages / scope / IP mode / budget rules
↓
Save Draft
```

---

### 6.3 Staffing & Funding Flow

``` text
For each Stage:
  Invite freelancer OR team
  ↓
  Assignee accepts
  ↓
  Creator funds escrow
  ↓
  Stage moves to in_progress
  ↓
  Collaboration begins in Stage Room
```

---

### 6.4 Delivery & Approval Flow

For File Based / Maintenance Based:
``` text
Freelancer submits deliverable
↓
Creator reviews
↓
Approve → escrow releases → payout
OR
Request Revision → stage_revision_request logged
OR
Open Dispute → funds locked, moderator notified
```

For Session Based / Group Session Based:
``` text
Session happens
↓
Creator confirms attendance/value
↓
Approve → escrow releases → payout
OR
Mark "didn't happen" → dispute
```

For Management Based:
``` text
Time window ends
↓
Creator marks satisfied or not
↓
Approve → payout
OR
Dispute quality of management
```

---

### 6.5 Dispute Flow

``` text
Creator OR Freelancer opens Dispute on a Stage
↓
finance.disputes row created
↓
Dispute Messages open (evidence, conversation)
↓
Moderator review
↓
Moderator resolves:
- release funds
- partial split
- refund
- restrict IP reuse if applicable
↓
Stage + Project updated accordingly
↓
Ratings still can proceed
```

---

### 6.6 Project Completion Flow

``` text
All stages finalized (approved/cancelled/resolved)
↓
Project marked completed
↓
Both sides rate each other
↓
Final assets remain accessible
↓
Wallets / payouts finalized
↓
Project archived
```

---

## 7. Why this matters for build order

From an engineering standpoint:
1. You cannot build “projects” in isolation — you need:
   - Onboarding (session_context in JWT)
   - Stage types (so UI knows which tabs to render)
   - Escrow (for trust)
2. You cannot build payouts without:
   - Submission → Approval → Release trigger
   - Dispute path
3. You cannot build retention / long-tail revenue without:
   - Maintenance Based stages / maintenance contracts
4. You cannot scale trust without:
   - Ratings
   - IP mode logging
   - Audit trails
   - Dispute messaging

All of that informs tables like:
- `projects.stage_revision_requests`
- `finance.disputes` + `finance.dispute_messages`
- `projects.maintenance_contracts`
- `finance.wallets`, `finance.escrows`, `finance.transactions`
- `finance.ratings`

And all of that ties back to access control via RLS using `active_profile_id` and `active_team_id`.

---

## 8. TL;DR Core Flows You Now Have Spec’d

- Onboarding (account creation → active profile)
- Payment setup (funding & payout)
- Project creation (custom or template)
- Stage typing (File, Session, Group Session, Management, Maintenance)
- Hiring & escrow funding
- Workroom collaboration per stage (Chat / Attachments / Details / etc.)
- Submission / approval / revision loop
- Disputes, including IP edge cases
- Ratings and closeout
- Single-stage “micro-projects”
- Long-running “maintenance / retainer” stages

This document should live in `docs/product/user-flows.md` in the repo, next to `UserStories.md` and `Sitemap.md`.
