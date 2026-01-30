# User Stories: Projective Platform

This directory contains the source of truth for all platform features. Our stories are "Technical
User Stories," meaning they bridge business intent with our Deno/Supabase architecture.

## Personas Reference

| Persona             | Description                                      |
| :------------------ | :----------------------------------------------- |
| **Business Client** | The entity funding projects and managing brands. |
| **Freelancer**      | The individual service provider.                 |
| **Freelancer Team** | A "Micro-Agency" collective with shared wallets. |
| **Admin**           | Platform moderator/operator.                     |

## Workflow

1. Create a story using `template.md`.
2. Assign a `US-XXX` ID.
3. Review against `documentation/database/` schemas for RLS compliance.
4. Move to `Ready` when technical implementation steps are defined.
