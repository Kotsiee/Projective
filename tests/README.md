# tests/

Deno-native test suite for the completed user stories. No external runner — `Deno.test` +
`@std/assert`.

| File                        | Story           | Covers                                                                                                                   |
| --------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `onboarding.test.ts`        | US-001          | `handle_new_user`: `security.session_context` init (AC4), `security.audit_logs` write + grant rule (AC6)                 |
| `escrow_money_loop.test.ts` | US-005 / US-007 | `fund_stage` (hold, cap check, active transition), `approve_stage` (5% fee, team splits), `cancel_stage_fair_exit` tiers |
| `notifications.test.ts`     | US-005 / US-007 | `comms.fn_notify` writer contract feeding the SSE stream                                                                 |
| `support/mock_db.ts`        | —               | In-memory, transactional re-implementation of the SQL contracts                                                          |
| `support/live_db.ts`        | —               | Opt-in bridge to the real Postgres inside a rolled-back transaction                                                      |

## Run

```bash
deno task test          # or: deno test --allow-all
```

The default run uses only the in-memory `MockDb` — no database required, always green.

## Live-DB layer (optional)

Set `PJV_TEST_DB=1` (local Supabase must be running) to also assert the deployed schema matches the
contracts. Every live case runs inside `BEGIN … ROLLBACK`, so nothing is ever committed.

```bash
PJV_TEST_DB=1 deno test --allow-all
```
