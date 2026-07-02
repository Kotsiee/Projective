# Local Context: documentation/

## The Hierarchy (Non-Negotiable)

1. **`business/brain.md`** and **`business/brain2.md`** are the absolute, overriding source of
   truth for all business logic, database schemas, project workflows, and architectural rules.
2. **`codebase_context.md`** (repo root) is the technical reference for UI component APIs, styling
   variables, and Deno/Fresh system directives — not this folder.
3. Every other file under `documentation/` is supplementary. It exists to either (a) provide
   concrete detail the brain files intentionally leave abstract, or (b) cover material the brain
   files don't address at all (investor narrative, market data, per-route API tables, user
   stories, per-domain database schema).

## Rules for Editing This Folder

- **Never restate brain content.** If you're about to write a paragraph that duplicates something
  already in `brain.md`/`brain2.md`, link to it instead. This folder was cleaned up specifically to
  remove that kind of drift-prone duplication — don't reintroduce it.
- **Never restate codebase_context.md content.** UI component prop tables, hook signatures, and
  styling variable references belong there, not here. (`documentation/packages/fields/` was deleted
  for exactly this reason — it fully duplicated source already in `codebase_context.md`.)
- **If brain.md/brain2.md conflict with a file in this folder, brain wins.** Don't quietly resolve
  the conflict by editing the brain files to match old docs — flag it and ask, or clearly annotate
  the conflict in the subordinate doc (see `business/finance-model.md`'s conflict note for the
  pattern to follow).
- **Empty stub files are intentional placeholders, not accidents** (see `database/README.md`'s
  coverage table). Don't delete a stub just because it's empty — populate it or leave it.
- **Islands Architecture constraint applies to any code examples you write here too**: never show
  an Island importing the Supabase client directly, and never suggest fetching data inside an
  Island — see `business/brain2.md` §2 for the full rule.

## Folder Map

See [README.md](README.md) for the current directory structure and what lives where.
