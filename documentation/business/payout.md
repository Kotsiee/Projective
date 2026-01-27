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
