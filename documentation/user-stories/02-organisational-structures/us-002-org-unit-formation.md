# US-002: Formation of Organizational Units (Business & Team)

**Epic:** Organizational Structures **Persona:** Business Client | Freelancer **Status:** Ready

---

## 1. Narrative

> **As a** user (Business or Freelancer)\
> **I want to** create a dedicated organizational unit (a Business profile for hiring or a Team
> profile for collaborating)\
> **So that** I can manage complex projects and shared finances under a unified brand rather than a
> personal identity.

---

## 2. Acceptance Criteria (AC)

- [ ] **AC 1: Business Profile Setup:** A Business persona can create a Business profile with a
      legal name, billing email, and branding assets.
- [x] **AC 2: Team Profile Setup:** A Freelancer persona can form a Team, generating a unique slug
      for a collective portfolio.
- [ ] **AC 3: Context Switch:** Upon successful creation, the `security.session_context` is updated
      to the newly created `active_profile_id` or `active_team_id`.
- [ ] **AC 4: Unique Branding:** Every Team and Business must have a unique name/slug within its
      category.
- [ ] **AC 5: Financial Initialization:** System initializes a `Team Vault` or `Business Wallet` for
      the entity within the `finance` schema.
- [ ] **AC 6: Audit Logging:** Log actions `business.created` or `team.created` in
      `security.audit_logs`.

---

## 3. Technical Implementation Strategy

### 🏗️ Monorepo Distribution

- **`packages/types`**:
  - Define `BusinessCreateSchema` and `TeamCreateSchema` using Zod.
- **`packages/data`**:
  - Extend `RestDataSource` to handle organizational creation.
- **`@server/services`**:
  - `OrgService.createBusiness()`: Creates the profile and initializes corporate billing.
  - `OrgService.createTeam()`: Creates the team, assigns the owner, and sets the default
    `payout_model`.
- **`apps/web`**:
  - Routes: `/business/new` and `/teams/new`.
  - UI: Uses `@projective/ui/Splitter` for layout-heavy management pages.

### 🔐 Security & RLS

- **Schema**: `org`, `finance`, `security`
- **Policy**: Only the `owner_user_id` has `ALL` permissions for the specific record.
- **Fiduciary Safety**: Ensure the `service_role` is used when initializing the `finance.wallets` to
  prevent unauthorized user manipulation.

### 🎨 UI & BEM Components

- **Block**: `.org-creation-card`
- **Fields**:
  - `SelectField` for choosing the initial `payout_model` (Co-op, Finder's Fee, etc.).
  - `FileDrop` for business logos/team avatars.

---

## 4. CREATE Framework Alignment

- **Category**: N/A (Organizational Infrastructure)
- **Trigger**: Submission of creation form.

---

## 5. Notes & Constraints

- **Multi-Business Support:** Users can own multiple business profiles (e.g., separate brands), but
  only one can be "active" in the session at a time.
- **Team Slug Sensitivity:** Team slugs are used in public URLs; must be sanitized for URL safety.
