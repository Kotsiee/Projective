# US-008: Business Administration & Financial Overview

**Epic:** Organizational Structures **Persona:** Business Client **Status:** Draft

---

## 1. Narrative

> **As a** Business Client\
> **I want to** manage my organization's profile and view a consolidated financial summary\
> **So that** I can maintain my brand identity and track my spending across multiple projects.

---

## 2. Acceptance Criteria (AC)

- [ ] **AC 1: The Business Dashboard:** Upon selecting a business context, the user is presented
      with a dashboard showing:
  - Active Projects count.
  - Actions Required (e.g., "Pending Approvals", "Funding Needed").
  - Current Wallet Balance (Available vs. In Escrow).
- [ ] **AC 2: Profile Management:** User can update the Business `legal_name`, `logo`, and
      `billing_email`.
- [ ] **AC 3: Financial Ledger:** User can view a read-only history of all transactions (deposits,
      escrow locks, releases, platform fees) filtered by date.
- [ ] **AC 4: Payment Methods:** User can attach or detach Stripe Payment Methods (Cards/ACH) via a
      Stripe Elements integration.
- [ ] **AC 5: Member Visibility:** (MVP) The Owner can see a list of users with access to this
      business (initially just themselves).

---

## 3. Technical Implementation Strategy

### 🏗️ Monorepo Distribution

- **`packages/types`**:
  - `BusinessUpdateSchema`: Zod schema for profile validation (preserving `slug` immutability).
- **`packages/data`**:
  - `LedgerDataSource.getHistory(businessId)`: Specialized query for `finance.ledger_entries`.
  - `OrgDataSource.updateProfile(businessId, data)`: Handles profile updates.
- **`@server/services`**:
  - `FinanceService.getBillingPortalUrl()`: Generates a link to the Stripe Customer Portal for
    managing payment methods securely.
- **`apps/web`**:
  - Route: `/business/[slug]/settings` (General Settings).
  - Route: `/business/[slug]/finance` (Ledger & Wallet).
  - Island: `BusinessProfileForm.island.tsx`.

### 🔐 Security & RLS

- **Schema**: `org`, `finance`.
- **Policy**:
  - `UPDATE` on `business_profiles`: Restricted to `owner_user_id`.
  - `SELECT` on `ledger_entries`: Restricted to `business_id` matching `session_context`.
- **Constraint**: The `slug` field should remain immutable after creation to preserve public profile
  URLs, or require a specialized migration service.

### 🎨 UI & BEM Components

- **Block**: `.business-dash`
- **UI Package**: Uses `@projective/ui/Table` for the ledger view.
- **Visuals**:
  - **Financial Cards**: Displaying "Total Spent", "Currently in Escrow", "Wallet Balance".

---

## 4. CREATE Framework Alignment

- **Category**: N/A (Administrative).
- **Trigger**: User navigates to Settings or Dashboard.

---

## 5. Notes & Constraints

- **Stripe Portal:** For security, we do not store raw card details. We utilize Stripe's hosted
  "Customer Portal" for adding/removing cards, or embed Stripe Elements. The Strategy here assumes a
  hybrid: Dashboard shows status, specialized actions delegate to Stripe.
- **Currency:** All views must respect the Business's default currency (initially locked to USD or
  GBP based on creation).
