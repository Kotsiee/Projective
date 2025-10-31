# User Stories – Collaborative Freelancing Platform

## Overview

The platform enables **businesses**, **freelancers**, and **freelancer teams** to collaborate on structured projects with clear budgets and milestones.  
It combines the simplicity of Fiverr, the project depth of Upwork, and the collaboration of small consultancies.

---

## 👤 User Roles

1. **Business Client** – posts projects, hires freelancers or teams, approves work, and manages budgets.
2. **Freelancer** – offers services, applies for projects, and can join multiple teams.
3. **Freelancer Team** – a group of freelancers acting as a mini-agency with shared portfolios and collective pricing.
4. **Multi-Account User (Hybrid)** – a single registered person who can:
   - Own **one freelancer profile** (personal or part of a team).
   - Own and manage **multiple business profiles** (companies, brands, or projects).
   - **Switch accounts** from a single login session without re-authenticating.

---

## 🧱 Core Platform Features

- Discover and filter **individual freelancers**.
- View detailed **freelancer portfolios** and past projects.
- **Create and manage teams** (by freelancers themselves).
- **Hire individuals or full teams** for project stages.
- **Post projects** or choose from **guided project templates**.
- **Set and manage budgets** per project stage or revision type.
- Built-in **messaging and file sharing** for collaboration.
- **Freelancers can sell previous work** (digital templates, products).

---

## 🏗️ Epic 1 – Discovery & Profiles

### As a Business Client:

- I want to **browse and filter freelancers** by skills, experience, rating, and location.
- I want to **view freelancer portfolios** to see examples of past work before hiring.
- I want to **search for teams** that specialize in certain project types.

### As a Freelancer:

- I want to **create a public portfolio** to showcase my best work.
- I want to **list my services and stage-based pricing** clearly.
- I want to **tag my profile with specializations** (e.g., “UI Design”, “MVP Implementation”).

### As a Freelancer Team:

- I want to **build a shared team profile** that highlights collective experience.
- I want to **add or remove members** dynamically as projects evolve.
- I want to **share reviews and ratings** collectively as a team brand.

---

## 🧩 Epic 2 – Project Creation & Hiring

### As a Business Client:

- I want to **post new projects** with clear descriptions, budgets, and deadlines.
- I want to **use project templates** that automatically define common stages (e.g., “Design”, “Testing”).
- I want to **mix and match freelancers or teams per stage** of a project.
- I want to **view cost breakdowns** for each stage before committing.
- I want to **hire multiple freelancers** for larger jobs.
- I want to **hire full teams** for complex, multi-stage projects.

### As a Freelancer or Team:

- I want to **apply to posted projects** that match my skills.
- I want to **see which stages of a project are open for bids or collaboration.**
- I want to **set budgets per stage**, including optional revision costs.
- I want to **propose stage pricing** dynamically (e.g., higher for “Major Revisions”, lower for “Tweaks”).

---

## 💰 Epic 3 – Budgets & Stage Pricing

### As a Business Client:

- I want to **view total project cost** broken down by stage.
- I want to **approve or modify budgets** before finalizing a contract.
- I want to **see optional revision costs** (“Minor Tweaks”, “Major Revisions”).

### As a Freelancer or Team:

- I want to **set fixed budgets per stage** (e.g., Design £40, Implementation £260).
- I want to **offer certain stages for free** to attract clients (e.g., “Consultation – Free”).
- I want to **charge monthly maintenance fees** for ongoing work.

### Example – Team Pricing:

| Stage                        | Description            | Budget     |
| ---------------------------- | ---------------------- | ---------- |
| Market Research & Consulting | Discovery phase        | Free       |
| Design                       | UI/UX layout           | £40        |
| MVP Implementation           | Prototype build        | £260       |
| Full Implementation          | Production-ready build | £430       |
| Testing                      | QA, bug fixes          | £70        |
| Minor Tweaks                 | Post-launch fixes      | £10        |
| Major Revisions              | Reworks                | Up to £300 |
| Maintenance                  | Monthly retainer       | £50/month  |
| Marketing                    | Launch campaigns       | Up to £500 |

---

## 🧑‍💻 Epic 3A – Team Membership

### As a Freelancer:

- I want to **join multiple teams** so I can collaborate on different projects simultaneously.
- I want to **see which teams I belong to** and easily switch between them in my dashboard.
- I want to **set my visibility** (public or invite-only membership).
- I want to **choose whether a project invitation goes to me personally or via one of my teams**.
- I want to **leave a team at any time**, unless I have an active project stage assigned to me.

### As a Team Lead:

- I want to **invite existing freelancers** to join my team.
- I want to **see all members across multiple active projects**.
- I want to **assign roles** (e.g., Developer, Designer, Tester) within the team.
- I want to **review and rate freelancers** after project completion.

### As a Business Client:

- I want to **see the full composition of any team** I hire (roles, members, reputation).
- I want to **know if a freelancer I hire is already part of another team** for transparency.

---

## 🧠 Epic 4 – Guided Project Templates

### As a Business Client:

- I want to **select a project template** (e.g., “Build a SaaS MVP”, “Design a Landing Page”).
- I want the platform to **recommend suitable freelancers or teams** for each stage.
- I want to **customize the template** by replacing or removing stages.
- I want to **preview total cost and timeline** before confirming.

### As a Freelancer:

- I want to **attach my services to specific template stages**.
- I want to **see when businesses select my stage** in a template.
- I want to **get notified when a template project matches my profile.**

---

## 🤝 Epic 5 – Collaboration & Communication

### As a Business Client:

- I want to **chat with freelancers and teams** directly inside project rooms.
- I want to **upload reference files and documentation**.
- I want to **receive milestone updates** as stages are completed.

### As a Freelancer/Team:

- I want to **collaborate with others on the same project** (shared workspace).
- I want to **track progress** with task boards or checklists.
- I want to **share deliverables securely** through Supabase Storage.

---

## 💼 Epic 6 – Review, Payments & Revisions (Phase 2+)

### As a Business Client:

- I want to **approve deliverables per stage** before payment is released.
- I want to **request revisions** if I’m not satisfied.
- I want to **rate freelancers and teams** after project completion.

### As a Freelancer:

- I want to **receive payments securely** (via Stripe Connect).
- I want to **track my earnings and withdrawal history.**
- I want to **see client feedback** for continuous improvement.

---

## 🛍️ Epic 7 – Marketplace for Previous Work (Future Expansion)

### As a Freelancer:

- I want to **sell past designs, templates, or products** directly on my profile.
- I want to **define licenses or exclusivity** (e.g., “Full Rights”, “Template Use Only”).
- I want to **track downloads and sales analytics**.

### As a Business Client:

- I want to **browse and buy ready-made assets** (website templates, designs, code).
- I want to **preview and customize digital assets** before purchase.

**Examples:**

- A designer sells a T-shirt design and optionally prints the product.
- A developer sells an unused website domain or UI template.

---

## 🔐 Epic 8 – Account & Security

### As Any User:

- I want to **log in securely** using Supabase Auth (email/password or OAuth).
- I want to **receive session tokens that expire safely** (JWT + hashed refresh).
- I want to **recover my account** if I forget credentials.
- I want to **verify my identity** before taking payments or forming teams.

---

## 📊 Epic 9 – Analytics & Insights (Later Phase)

- Businesses can view **budget breakdowns** and project performance.
- Freelancers can view **earnings analytics** and stage efficiency.
- Teams can track **member contributions** and client satisfaction.

---

## 🔮 Epic 10 – Long-Term Vision

- **AI-assisted team recommendations** (“Best team for your budget”).
- **Automated milestone forecasting** (timeline prediction based on prior data).
- **Cross-platform integrations** (Notion, Slack, GitHub).
- **API access** for enterprise clients.

---

## 🔄 Epic 11 – Multi-Account Switching

### As a User:

- I want to **associate multiple business accounts** under my profile.
- I want to **switch between my business accounts and my freelancer profile** from a single dashboard.
- I want to **see which account is currently active** when viewing projects or payments.
- I want to **maintain separate wallets and analytics** for each business account.
- I want to **use the same email/login credentials** for all associated accounts.

### As a Business Owner:

- I want to **delegate access** to collaborators (e.g., team members or assistants).
- I want to **assign roles** (Owner, Manager, Viewer) per business account.

### As a Freelancer:

- I want to **operate my freelancer account independently** of any business accounts.
- I want my freelancer identity (ratings, portfolio) to remain consistent even if I switch to a business context.

---

## 🔐 Account & Security (Updated)

- Each **user ID** can own one `freelancer_profile` and multiple `business_profiles`.
- Switching context updates `active_profile_id` in session JWT.
- **RLS policies** ensure all database operations are filtered by the currently active account.
- All **API endpoints** respect `active_profile_type` (`freelancer` or `business`) for access control.
- **Audit logs** record all account switches for transparency.
