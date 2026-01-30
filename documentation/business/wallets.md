# Architecture: Wallet Systems & Financial Lifecycle

This document provides a comprehensive technical and logical overview of how Projective handles
capital, from the moment a client funds a project to the moment a freelancer withdraws to their
bank. Projective acts as a **fiduciary facilitator**, leveraging **Stripe Connect** to ensure legal
compliance, security, and "Programmatic Trust."

---

## 1. The Multi-Wallet Architecture

Projective does not use a single "monolithic" wallet. Instead, it utilizes a tiered ledger system
where every entity has a specific financial container.

### 1.1 Personal Wallets (Freelancer/Client)

The primary account for individuals.

- **Purpose**: Receives payouts from stages; holds funds for project payments.
- **Visibility**: Visible only to the profile owner.

### 1.2 Team Vaults (The "Shared Treasury")

A collective wallet associated with a Team profile.

- **Purpose**: Receives the "Treasury" portion of a stage split (e.g., a 10% overhead fee).
- **Governance**: Funds are managed by the Team Owner/Admins to pay for shared software, branding,
  or marketing.

### 1.3 Business Wallets (Corporate Budgeting)

Used by Business entities to manage large-scale project funding.

- **Purpose**: Allows a company to deposit a large sum (e.g., £50,000) and allocate it across 20
  different projects without repeated credit card swipes.

### 1.4 "Hidden" System Wallets (Projective Ledger)

Projective maintains internal ledger accounts that are invisible to users but critical for the
system:

- **The Escrow Pool**: A transient "holding area" where funds are locked during a stage.
- **The Fee Collection Account**: Where Projective's 5% service fee and marketplace commissions are
  routed.
- **The Dispute Lockbox**: A temporary state for funds being contested.

---

## 2. The Financial Lifecycle of a Project

The movement of money follows a strict state machine to prevent "Hit and Run" work and ensure
clients only pay for what they approve.

### Phase 1: Funding (The Escrow Trigger)

1. **Stage Activation**: A client approves a project stage.
2. **Payment Collection**: Projective (via Stripe) pulls funds from the Client's bank/card.
3. **State [LOCKED]**: Funds enter the **Escrow Pool**. They are no longer in the client's
   possession, but not yet in the freelancer's.

### Phase 2: Execution & "The Fair Exit"

While in the `LOCKED` state, the 25/50/75 logic is monitored.

- If the stage is cancelled at **40% duration**, the system automatically prepares a **£500/£500
  split** (on a £1,000 stage).
- The system calculates this by comparing `stage.started_at` with the current time against the
  `stage.deadline`.

### Phase 3: Approval & Payout

1. **Approval**: Client clicks "Approve."
2. **Internal Splitting**: The system checks the **Team Split** settings.
   - _Total Released_: £1,000.
   - _System Fee (5%)_: £50 -> Projective Fee Account.
   - _Team Vault (10%)_: £95 -> Team Vault.
   - _Freelancer A (85%)_: £855 -> Freelancer Personal Wallet.
3. **State [PENDING]**: Funds move to the recipient's wallet but are marked as **Pending** (7-day
   safety window).

### Phase 4: Availability & Withdrawal

1. **Safety Window Closes**: After 7 days without a dispute, funds move to **Available**.
2. **Withdrawal**: User initiates a "Payout." Stripe Connect moves the funds from the Projective
   platform balance to the user's verified bank account.

---

## 3. Financial Edge Cases & Failure Handling

### 3.1 The "Stale Project" (Ghosting)

If a freelancer submits work and the client "ghosts" (doesn't approve or dispute):

- **Logic**: After a 14-day "Auto-Approve" timer, the system triggers Phase 3 automatically.

### 3.2 The "Insufficient Funds" Trap

For Maintenance-based stages (recurring):

- **Logic**: The system attempts to "Pre-Auth" the next cycle's funds 3 days before the current one
  ends. If the client's wallet is empty, the stage is automatically **Paused**, and the freelancer
  is notified to stop work.

### 3.3 The Failed Withdrawal

If a freelancer's bank account is closed or flagged by Stripe:

- **Logic**: Funds are bounced back to the Projective **Personal Wallet** (Available state). The
  user is prompted to "Update Payment Method" via a dashboard alert.

---

## 4. Integration: How Stripe is Utilized

Projective uses **Stripe Connect (Custom/Express)** to act as the financial backbone.

- **Projective Side**: We manage the **Ledger** (who is owed what). We store the "Truth" in our
  Supabase `wallets` and `transactions` tables.
- **Stripe Side**: Handles the **Fiat Money**. They deal with KYC (Know Your Customer), AML
  (Anti-Money Laundering), and the actual banking rails.
- **Fiduciary Safety**: Money is never "Projective's money." It sits in a **Stripe Platform
  Account** where it is legally segregated from Projective’s operational business accounts.

---

## 5. Tax & Legal Clarity

Because Projective uses **Connect Accounts**, we are not "buying and reselling" services.

- **The Contract**: The contract is between the Client and the Freelancer (or Team).
- **The Ledger**: Our wallets reflect a "Right to Payment."
- **Reporting**: Stripe handles the issuance of 1099/Tax forms (depending on jurisdiction),
  significantly reducing Projective's administrative liability.

```json
{
	"ledger_entry": {
		"amount": 100000,
		"currency": "gbp",
		"metadata": {
			"type": "stage_escrow_release",
			"stage_id": "uuid",
			"split_ratio": {
				"vault": 0.10,
				"member_a": 0.90
			}
		}
	}
}
```

---

**Would you like me to now generate the User Stories for "Stage 1: The Onboarding Flow," covering
how users set up these wallets?**
