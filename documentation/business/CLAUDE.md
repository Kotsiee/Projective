# Local Context: documentation/business/

`brain.md` and `brain2.md` in this folder are the absolute source of truth for the entire
platform — not just for "business" topics. Every other file here (`finance-model.md`,
`features.md`, `vision.md`, `investor-summary.md`, `market-analysis.md`) is subordinate.

## Before Adding or Editing a File Here

- Check whether the content belongs in `brain.md` (durable product/business logic) instead of a
  satellite file. If it's a rule the whole platform should follow, it belongs in `brain.md`, not
  in a new doc that only some future agent might read.
- If you're adding a concrete number (a fee %, a split ratio, a time window) that `brain.md`
  intentionally leaves abstract, add it to `finance-model.md` and cross-reference the relevant
  `brain.md` section — don't invent a new standalone file for it.
- **Known unresolved conflict:** `finance-model.md` states a 5% platform service fee;
  `investor-summary.md` states 10%. Neither is confirmed against `brain.md` (which states no
  concrete figure). Do not silently pick one when writing new content that depends on this number —
  surface the conflict instead.

- **Any business rule change must land here in the same change.** If you add, remove, or modify a
  business rule — ticket/stage lifecycle behavior, escrow triggers, payout logic, permissions,
  anything a client or freelancer would notice — update `brain.md` (or the relevant satellite doc,
  e.g. `finance-model.md` for concrete numbers) before considering the work done. A business rule
  that exists only in code, a chat message, or a commit description is not documented. This applies
  whether the rule change was requested directly or discovered as a side effect of other work.

See [../CLAUDE.md](../CLAUDE.md) for the full documentation-wide guardrails.
