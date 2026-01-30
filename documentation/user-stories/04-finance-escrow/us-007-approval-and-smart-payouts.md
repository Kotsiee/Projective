# US-007: Approval, Smart Payouts, and Fair Exit Logic

**Epic:** Finance & Escrow **Persona:** Business Client | Freelancer | Team Member **Status:** Ready

---

## 1. Narrative

> **As a** Business Client\
> **I want to** approve a stage submission or trigger a fair cancellation\
> **So that** funds are distributed accurately to the freelancer or team members according to
> pre-defined smart splits and platform logic.

---

## 2. Acceptance Criteria (AC)

- [ ] **AC 1: Final Approval:** Upon client approval, the system triggers the
      `finance.stage_escrow_release` logic.
- [ ] **AC 2: Platform Fee Deduction:** A 5% platform fee is automatically routed to the Projective
      Fee Account.
- [ ] **AC 3: Team Smart Splits:** If the assignee is a Team, funds are split between the Team Vault
      and individual Member Wallets based on the "Per-Stage Smart Split".
- [ ] **AC 4: The Fair Exit (Cancellation):** If a stage is cancelled, the system calculates the
      payout (0%, 50%, or 100%) based on elapsed time vs. deadline (25/50/75 logic).
- [ ] **AC 5: Ghosting Protection:** If the client fails to approve/dispute within 14 days of a
      submission, the system triggers "Auto-Approve".
- [ ] **AC 6: Safety Window:** Released funds enter a `pending` state for 7 days before becoming
      `available` for withdrawal.

---

## 3. Technical Implementation Strategy

### 🏗️ Monorepo Distribution

- **`packages/types`**:
  - Define `PayoutSplitSchema` (Zod) to validate distribution ratios.
- **`packages/data`**:
  - Implement `PayoutDataSource` to handle multi-row ledger insertions.
- **`@server/services`**:
  - `PayoutService.calculateSplits()`: Logic for applying team percentages and the 5% platform fee.
  - `PayoutService.processRelease()`: Executes the database transaction to move funds from
    `escrow_pool` to `wallets`.
- **`apps/web`**:
  - Island: `ApprovalActions.island.tsx` (Approve/Dispute/Cancel buttons).

### 🔐 Security & RLS

- **Schema**: `finance`, `projects`.
- **Policy**: `finance.wallets` are strictly read-only for users; updates must occur via
  `SECURITY DEFINER` functions triggered by system events.
- **Audit**: Action `escrow.released` or `stage.cancelled_with_split` logged in
  `security.audit_logs`.

### 🎨 UI & BEM Components

- **Block**: `.payout-summary`
- **UI Package**: Uses `@projective/ui/Toast` to alert talent of incoming funds.

---

## 4. CREATE Framework Alignment

- **Category**: **Test** / **Empower** (Closing the loop).
- **Trigger**: Client `Approve` click or `Auto-Approve` timer expiry.

---

## 5. Notes & Constraints

- **Stripe Connect:** Actual fiat withdrawal to a bank account is a separate asynchronous step via
  the Stripe dashboard/API.
- **Dispute Locking:** If a dispute is opened, the `PayoutService` must lock the funds in the
  `Dispute Lockbox` and halt all split logic.
