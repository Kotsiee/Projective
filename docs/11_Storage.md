# 🗄️ Projective Storage Architecture

Supabase Storage layout for Projective — covering user file libraries, chat attachments, project assets, marketplace items, and future plugin integrations.

All buckets are **private** by default.  
Access is always managed via the database (RLS) and **short-lived signed URLs (TTL 60 s)**.

---

## 📁 Bucket Overview

| Bucket         | Purpose                                             | Visibility                           | Lifecycle                  |
| -------------- | --------------------------------------------------- | ------------------------------------ | -------------------------- |
| `avatars`      | User/team/business avatars                          | Private (optional public read later) | Keep; replace on upload    |
| `attachments`  | User personal file library (draft → uploaded)       | Private                              | Drafts expire after 7 days |
| `chat`         | Optional denormalized copies for project & DM chats | Private                              | Mirrors message lifetime   |
| `project`      | Project-scoped exports/artifacts                    | Private                              | Keep or purge by project   |
| `marketplace`  | Publicly listed assets & paid versions              | Mixed (previews vs originals)        | Keep versions              |
| `previews`     | Thumbnails / PDF & video previews                   | Private                              | Delete after 30 days       |
| `quarantine`   | Virus/MIME scan staging                             | Private                              | Delete after 24 h          |
| `integrations` | External provider import/export data                | Private                              | Keep 90 days               |
| `tmp`          | Ephemeral exports/transcodes                        | Private                              | Delete after 1 h           |

---

## 🧍 Avatars (`avatars`)

**Purpose:** Profile pictures and logos.  
**Paths**

- avatars/users/{user_id}/{uuid}.{ext}
- avatars/teams/{team_id}/{uuid}.{ext}
- avatars/businesses/{business_id}/{uuid}.{ext}

**RLS**

- Write: owner or admin.
- Read: via signed URL (or make public later).

---

## 📎 Attachments (`attachments`)

**Purpose:** Core personal file library — powers pre-upload rename & re-use across chats.  
Backed by `org.attachments` table. :contentReference[oaicite:1]{index=1}

**Paths**

- attachments/{owner_profile_id}/drafts/{attachment_id}/{original_filename}
- attachments/{owner_profile_id}/files/{attachment_id}/{sanitized_filename}

**Flow**

1. **Initiate:** create DB row (`status=draft`) → signed upload URL to `drafts/…`.
2. **Rename:** update `display_name` before finalize.
3. **Finalize:** verify file, scan → move to `files/…`, set `status=uploaded`.

**RLS**

- `SELECT/UPDATE/DELETE`: owner only.
- Others access only through `message_attachments` / `channel_files` joins.

**Lifecycle**

- Delete drafts > 7 days old.
- Keep uploaded files until deleted.

---

## 💬 Chat Files (`chat`) _(optional)_

**Purpose:** Direct per-channel galleries (may be omitted; DB joins work fine). :contentReference[oaicite:2]{index=2}

**Paths**

- chat/projects/{project_id}/channels/{channel_id}/{attachment_id}/{filename}
- chat/dms/{thread_id}/{attachment_id}/{filename}

**Policy**

- Participants can read/write within their channels or DM threads.

**TTL**

- 60 s signed URLs; keep while messages exist.

---

## 🧱 Project Assets (`project`)

**Purpose:** Store compiled deliverables or exports not owned by individuals.

**Paths**

- project/{project_id}/exports/{yyyy-mm}/{uuid}.pdf
- project/{project_id}/artifacts/{stage_id}/{uuid}.{ext}

**RLS**

- Project owners and participants can read.
- Writes by system jobs.

---

## 🛍️ Marketplace (`marketplace`)

**Purpose:** Marketplace asset versions and buyer-only downloads. :contentReference[oaicite:3]{index=3}

**Paths**

- marketplace/assets/{asset_id}/versions/{version_id}/{filename}
- marketplace/assets/{asset_id}/previews/{uuid}.{ext}
- marketplace/purchases/{purchase_id}/license/{license_id}.pdf

**Access**

- Previews: readable by anyone via signed URL.
- Originals: only verified buyers via `/purchases/:id/download`.

---

## 🖼️ Previews (`previews`)

**Purpose:** Generated thumbnails and PDF/video snapshots.

**Paths**

- previews/attachments/{attachment_id}/thumb.{ext}
- previews/attachments/{attachment_id}/page-1.png
- previews/marketplace/{asset_id}/grid/{size}/{uuid}.jpg

**Lifecycle:** purge after 30 days (regenerate on demand).

---

## 🧪 Quarantine (`quarantine`)

**Purpose:** Temporary holding area for antivirus & MIME scanning.

**Paths**

- quarantine/{owner_profile_id}/{attachment_id}/{original_filename}

**Flow**

1. Upload → scan service.
2. Move to `attachments/.../files` if clean.
3. Delete otherwise.

**Lifecycle:** delete after 24 h.

---

## 🔌 Integrations (`integrations`)

**Purpose:** Store plugin-related imports/exports (GitHub, Trello, Notion, etc.).

**Paths**

- integrations/{provider}/{owner_type}-{owner_id}/imports/{yyyy-mm}/{uuid}.json
- integrations/{provider}/{owner_type}-{owner_id}/exports/{yyyy-mm}/{uuid}.json

**RLS:** only connection owner may read/write.

---

## ⚙️ Temporary Files (`tmp`)

**Purpose:** Ad-hoc zips, transcodes, analytics exports.

**Paths**

- tmp/{user_id}/{uuid}.{ext}

**Lifecycle:** auto-delete after 1 h.

---

## 🔐 Cross-Cutting Settings

### Signed URL TTL

Default **60 seconds**; increase selectively for large transfers. :contentReference[oaicite:4]{index=4}

### Metadata (object headers)

| Key                   | Purpose             |
| --------------------- | ------------------- |
| `attachment_id`       | Link back to DB row |
| `owner_profile_id`    | RLS lookup          |
| `sha256`              | Integrity           |
| `mime_type`           | Validation          |
| `uploaded_by_user_id` | Audit trail         |

### Lifecycle Rules

| Path                      | Action | Retention |
| ------------------------- | ------ | --------- |
| `attachments/**/drafts/*` | Delete | 7 days    |
| `tmp/**`                  | Delete | 1 h       |
| `quarantine/**`           | Delete | 24 h      |
| `previews/**`             | Delete | 30 days   |

### Antivirus

Uploads start in `quarantine` → scan → move to destination on success → mark DB row clean.

---

## 🧾 Example Storage Policies (pseudocode)

**attachments**

```sql
CREATE POLICY "attachments_read_own_or_shared"
ON storage.objects
FOR SELECT USING (
  bucket_id = 'attachments' AND (
    EXISTS (
      SELECT 1 FROM org.attachments a
      WHERE a.bucket = 'attachments'
        AND a.path = objects.name
        AND (
          a.owner_profile_id = auth.jwt()->>'active_profile_id'
          OR EXISTS (
            SELECT 1 FROM comms.message_attachments ma
            JOIN comms.channel_files cf ON cf.attachment_id = a.id
            WHERE ma.attachment_id = a.id
              AND project_or_dm_participant(auth.uid())
          )
        )
    )
  )
);

CREATE POLICY "chat_read_participants_only"
ON storage.objects
FOR SELECT USING (
  bucket_id = 'chat' AND user_is_channel_participant(objects.name)
);

CREATE POLICY "marketplace_read_purchased_or_preview"
ON storage.objects
FOR SELECT USING (
  bucket_id = 'marketplace' AND (
    path LIKE 'marketplace/assets/%/previews/%'
    OR EXISTS (
      SELECT 1 FROM marketplace.asset_purchases p
      WHERE path LIKE format('marketplace/assets/%s/%%', p.asset_id)
        AND p.buyer_profile_id = auth.jwt()->>'active_profile_id'
    )
  )
);
```
