# US-005: Stage-Based Escrow Funding

**Epic:** Finance & Escrow **Persona:** Business Client **Status:** Ready

---

## 1. Narrative

> **As a** Business Client\
> **I want to** fund the escrow for a specific project stage\
> **So that** I can signal to the freelancer or team that capital is secured, allowing work to
> commence with "Programmatic Trust."

---

## 2. Acceptance Criteria (AC)

- [ ] **AC 1: Funding Trigger:** Business Clients can initiate a "Fund Stage" action only for stages
      in the `assigned` status.
- [ ] **AC 2: Wallet Verification:** The system checks the `finance.business_wallets` for sufficient
      balance before attempting a Stripe pull.
- [ ] **AC 3: Escrow Isolation:** Successfully funded amounts are moved to the `finance.escrow_pool`
      and associated with the specific `stage_id`.
- [ ] **AC 4: Status Transition:** Upon successful funding, the stage status transitions from
      `assigned` to `active` (or `ready_to_start`).
- [ ] **AC 5: Notification:** The assigned Freelancer or Team Admin receives a real-time
      notification that the stage is funded and work can begin.
- [ ] **AC 6: Ledger Integrity:** A `ledger_entry` is created in the `finance` schema recording the
      transaction metadata, including the 5% platform service fee calculation.

---

## 3. Technical Implementation Strategy

### 🏗️ Monorepo Distribution

- **`packages/types`**:
  - Define `EscrowTransactionSchema` (Zod) to validate funding amounts and currency.
- **`packages/data`**:
  - Implement `WalletDataSource` to manage ledger entries and balance lookups in the `finance`
    schema.
- **`@server/services`**:
  - `FinanceService.fundStage()`: Orchestrates the move from the Business Wallet to the Escrow Pool.
  - `StripeService.createPaymentIntent()`: Handles the actual fiat pull via Stripe Connect.
- **`apps/web`**:
  - Route: `/projects/[pid]/finance` (Financial overview).
  - Island: `EscrowAction.island.tsx` (The funding button and status indicator).

### 🔐 Security & RLS

- **Schema**: `finance`, `projects`.
- **Policy**: Only the `client_business_id` owner can trigger the funding action.
- **Fiduciary Safety**: Use `SECURITY DEFINER` functions for balance transfers to prevent
  client-side manipulation of ledger values.
- **Audit**: Action `stage.escrow_funded` logged in `security.audit_logs`.

### 🎨 UI & BEM Components

- **Block**: `.escrow-status-card`
- **UI Package**: Uses `@projective/ui/Toast` to confirm successful funding.
- **Fields**:
  - `MoneyField` (custom mask) to display the required funding amount in local currency.

---

## 4. CREATE Framework Alignment

- **Category**: **Run** (Execution starts here).
- **Trigger**: `payment_intent.succeeded` event from Stripe webhook.

---

## 5. Notes & Constraints

- **Stale Funding:** If funding fails or is delayed, the stage status must remain `assigned` to
  prevent work from starting without protection.
- **Fee Transparency:** The UI must clearly show the breakdown of the stage budget vs. the platform
  service fee before the client confirms.
