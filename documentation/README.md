# Projective Documentation

Projective is a modern freelancing ecosystem where businesses can hire individuals, multiple
freelancers, or entire teams to collaborate on structured projects. Our core philosophy centers on a
collaboration-first approach, transparency through clear stage-based pricing, and low barriers to
entry via project templates.

## 📂 Directory Structure

This documentation is organized into domain-specific folders to maintain clarity as the platform
scales.

### [Business](./business/README.md)

Contains documents intended for investors and stakeholders to understand the market positioning and
high-level strategy.

- **[Vision.md](./business/vision.md)**: Detailed philosophy and problem-solution alignment.
- **Features.md**: Functional breakdown for businesses, freelancers, and teams.
- **Tech_Stack.md**: High-level technical overview of the edge-first architecture.
- **Roadmap.md**: Phased development plan from MVP to Enterprise.

### [User Stories](./user-stories/README.md)

Narrative flows and functional requirements derived from user needs.

- **User_Creation.md**: Onboarding, role setup, and payment initialization.
- **Project_Creation.md**: Flows for custom projects and template-based hiring.
- **Project_Management.md**: Collaboration, submission loops, and approval logic.

### [Database](./database/README.md)

Technical specifications for the data layer and security enforcement.

- **Schemas.md**: Overview of the relational model and domain boundaries.
- **[Domain]/Tables.md**: Table definitions for Org, Projects, Finance, etc.
- **[Domain]/Policies.md**: Row-Level Security (RLS) rules ensuring data isolation.

### [Server](./server/README.md)

Architecture details for the Deno Fresh runtime and edge deployment.

- **Middleware.md**: Logic for JWT verification, rate limiting, and security headers.
- **WASM.md**: Rust modules compiled to WebAssembly for performance-critical tasks.

---

## 🛠 Technical Overview

The platform is built on an edge-first stack designed for high performance and low operational cost.

- **Frontend**: Deno Fresh with Preact Islands for partial hydration.
- **Database & Auth**: Supabase (PostgreSQL) with strict Row-Level Security.
- **Compute**: Rust WASM modules for image optimization and file processing.

```text
// Example logic: Account Switching
User (U1) -> [FreelancerProfile (F1), BusinessProfile (B1), BusinessProfile (B2)]
Session Context: { user_id: U1, active_profile_id: B2, active_profile_type: "business" }
```

## 🔐 Security Principles

- **Isolation**: All data is filtered via RLS based on the `active_profile_id` in the JWT.
- **Auth**: Short-lived JWT access tokens and rotated, Argon2id-hashed refresh tokens.
- **Files**: All storage buckets are private by default, utilizing signed URLs for access.
