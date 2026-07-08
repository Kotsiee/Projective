# Projective — Root Context & Rules

Projective is a stage-based freelancing marketplace built as a modular monolith (Deno + Fresh 2 +
Supabase/Postgres) in a package-per-domain workspace. The authoritative product spec is
`documentation/business/brain.md` and `brain2.md`; nested `CLAUDE.md` files (`apps/web/CLAUDE.md`,
`documentation/CLAUDE.md`, `documentation/business/CLAUDE.md`) carry local rules that still apply.

---

## RULE — Keep `project_management/` in Sync With the Code (Mandatory)

`project_management/` is the live status board for this platform. It **must never drift from the
actual state of the repository.**

**Whenever you add, modify, or delete code in this repo, in the same change you MUST update the
matching status in `project_management/`:**

- **[project_management/EPICS.md](project_management/EPICS.md)** — epic-level board.
- **[project_management/FEATURES.md](project_management/FEATURES.md)** — per-epic feature Kanbans.
- **[project_management/USER_STORIES.md](project_management/USER_STORIES.md)** — per-story
  acceptance-criterion boards.
- **[project_management/README.md](project_management/README.md)** — the Master Epic Board and the
  snapshot counts.

Concretely, this means:

- **Adding/finishing a feature** → move its card to the correct lane
  (`⬜ Todo → 🟡 In Progress → ✅ Done`) and, if it completes an acceptance criterion, move that AC
  to the **Met** lane in `USER_STORIES.md`.
- **Wiring a frontend mock to a real backend** → update the note and, where warranted, the lane
  (many items are `🟡 In Progress` _specifically because_ they render from frontend seed data).
- **Deleting or deprecating code** → remove the corresponding card, or move it to the
  `⛔ Blocked / Deprecated` lane. Do not leave a card describing code that no longer exists.
- **Adding a whole new capability** not yet on any board → add a card in the right epic (and a new
  epic/feature/story entry if needed), then update the snapshot counts in `README.md`.

Treat the PM update as part of "done." A code change that leaves `project_management/` describing
the old reality is an incomplete change.

### CRITICAL CONSTRAINT — No Changelogs, No History

This project is being built from scratch, so the PM files track **current state only**. When you
update them:

- **Edit the status in place. Replace the old state cleanly.** Move the card to its new lane; do not
  annotate the move.
- **Do NOT add** any "Changelog", "History", "Recent Changes", "Updated on", "Previously", or dated
  entry — anywhere in `project_management/`.
- **Do NOT strike through, comment out, or keep old statuses "for reference."** The old state is
  simply overwritten.
- The only tense these files use is the **present**: what _is_ true of the codebase right now.

If you ever find a history/changelog section in `project_management/`, delete it and fold the
current truth into the boards.

---

## Related Sync Rules (Already in Effect)

These pre-date this file and remain mandatory — do not let them conflict with the rule above:

- **Business-logic / workflow / financial-rule changes** must be reflected in
  `documentation/business/brain.md` (or the relevant satellite doc) in the same pass — see
  `documentation/business/CLAUDE.md`.
- **CSS variable changes** belong in `apps/web/styles/themes/variables/`, not in prose docs — see
  `apps/web/CLAUDE.md`.

Rule of thumb: **code = truth; `project_management/` = its live status; `documentation/` = its
durable spec.** A single change may need to touch all three, and should.

---

## Build & Test Commands

Run these from the repo root:

- `deno task test` — run the full test suite
  (`deno test --fail-fast --coverage=coverage -A --trace-leaks`).
- `deno test --allow-all tests/` — run just the `tests/` suite directly.
- `PJV_TEST_DB=1 deno test --allow-all tests/` — also run the opt-in live-DB layer (local Supabase
  must be up).
- `deno task check` — format, lint, typecheck, and name-validate before committing.
- `deno task coverage:html` — render the coverage report after a test run.

## Testing Conventions

- **Use Deno's native runner only** — `Deno.test` + `jsr:@std/assert`. Do NOT add Jest, Vitest, or
  any external runner.
- **Name test files `*.test.ts`** and place them under `tests/`; shared harnesses go in
  `tests/support/`.
- **Every completed user story gets a test.** Name cases by story + acceptance criterion (e.g.
  `US-007 AC2 · ...`) so coverage maps to `project_management/USER_STORIES.md`.
- **Integration runs must never commit.** Use `MockDb.begin()/rollback()` for the in-memory layer,
  and wrap live-DB cases in `BEGIN … ROLLBACK` via `tests/support/live_db.ts`.
- **Keep the default run green with no database.** Gate live-DB cases behind `PJV_TEST_DB=1` with
  `Deno.test({ ignore: !isLiveDbEnabled(), ... })`.
