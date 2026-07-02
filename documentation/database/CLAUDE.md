# Local Context: documentation/database/

## The Additive Rule (from brain2.md — repeated here because it's the rule most likely to be
violated by an agent working directly in this folder)

You may add new columns, indexes, tables, or constraints to support new features. You **must not**
delete tables, drop columns, or alter existing foreign-key relationships (especially around
Escrows, Wallets, and Stages) without explicit human permission — and that applies to the actual
Supabase migrations, not just this documentation. This folder should always reflect the real
schema; never document a schema change here that hasn't actually been migrated.

## The Zod SSOT Rule

`@projective/types` is the single source of truth for shapes. If you write or update a migration,
update the corresponding Zod schema/TypeScript interface *and* the matching file in this folder
(`[domain]/Tables.md`, `Policies.md`, or `Functions.md`) in the same change. Do not let the
database, the types package, and this documentation drift apart.

## Stub Files Are Placeholders

Most `Functions.md` files (all 11 domains) and several `Tables.md`/`Policies.md` files are
currently stamped `_Not yet documented._` — see [README.md](README.md)'s coverage table. This is
intentional scaffolding, not an oversight. Replace the stub content when the corresponding schema
exists; don't delete the file.

See [../CLAUDE.md](../CLAUDE.md) for the full documentation-wide guardrails.
