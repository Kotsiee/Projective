# Security Overview

## Authentication & Authorization

- JWT-based access tokens (15m expiry).
- Opaque refresh tokens (rotating, Argon2id-hashed).
- Supabase RLS per project, user, team.
- Project ownership & membership validation at query level.

## API Security

- Rate limiting with Deno KV (60 req/min/user).
- CORS allowlist via env var.
- Content-Security-Policy & Referrer-Policy in middleware.
- CAPTCHA (Turnstile) for anon POST endpoints.
- HTTPS enforced; cookies marked Secure + HttpOnly.

## Data Security

- All Supabase buckets private by default.
- Signed URLs (60s TTL) for file access.
- Encryption at rest (Supabase-managed).
- Sanitized file uploads (MIME + size checks).

## Performance & Scalability

- Edge caching for static routes (Fresh Islands).
- Lazy hydration (Preact islands).
- Deno Deploy’s auto-scaling edge functions.
- Supabase horizontally scalable with PG bloat control.
- Optional Rust WASM compute for heavy workloads.
