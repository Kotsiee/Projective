# (dashboard) Module: Communications

The Communications module is the real-time interaction hub of the platform, facilitating direct
collaboration through messaging, file sharing, and activity tracking. It is deeply integrated with
the project lifecycle, allowing for stage-specific discussions that maintain a permanent audit trail
of project decisions.

---

## 🛤️ Frontend Routes

**Folder Path:** `/apps/web/routes/(dashboard)/messages/`

The messaging UI is optimized for both global high-level conversations and focused, context-specific
stage chats.

| Route Path                       | File Path                        | Description                                                                          |
| :------------------------------- | :------------------------------- | :----------------------------------------------------------------------------------- |
| `/messages`                      | `index.tsx`                      | Global Inbox: List of all active threads (Direct, Team, and Project-based).          |
| `/messages/[chatid]`             | `[chatid]/chat.tsx`              | **Chat Workspace**: The primary interface for sending messages and viewing history.  |
| `/messages/[chatid]/info`        | `[chatid]/info.tsx`              | Metadata view: Thread participants, pinned items, and notification settings.         |
| `/messages/[chatid]/attachments` | `[chatid]/attachments/index.tsx` | Dedicated gallery of all files, images, and links shared within the specific thread. |

### 🛠️ Core Components

- **ChatList**: A high-performance, virtualized container that handles "reverse-infinite" scrolling
  and scroll anchoring for incoming messages.
- **FileDrop**: Integrated into the message input to handle multi-file uploads with real-time
  processing status.

---

## ⚡ API Endpoints

**Base Path:** `/api/v1/dashboard/comms/`

These endpoints utilize `RealtimeDataSource` logic to ensure low-latency updates across clients.

| Endpoint             | Method  | Permission | Description                                                           |
| :------------------- | :------ | :--------- | :-------------------------------------------------------------------- |
| `messages/`          | `GET`   | (Auth)     | Fetches the recent thread list for the current `active_profile_id`.   |
| `messages/[id]`      | `GET`   | (Auth)     | Retrieves paginated message history for a specific thread.            |
| `messages/[id]`      | `POST`  | (Auth)     | Sends a new message or starts a new thread.                           |
| `messages/[id]/read` | `PATCH` | (Auth)     | Updates the "last read" timestamp for the current user in the thread. |

---

## 🕹️ Logic & Real-time Integration

### Contextual Threading

The platform supports multiple types of conversation contexts:

- **Direct Messages (DM)**: One-on-one private threads between two profiles.
- **Team Threads**: Group conversations limited to the roster of an `active_team_id`.
- **Stage Threads**: Automated threads created for every project stage. Access is governed by
  `StagePermission.ViewPrivateNotes` or general stage assignment.

### File Handling

When a file is dropped into a chat, it is processed via the `FileProcessor` system before being
committed to the message thread.

```ts
// Example message payload with processed metadata
{
  "thread_id": "uuid",
  "text": "Please check the new logo version.",
  "attachments": [{
    "id": "file_uuid",
    "type": "Image",
    "processingMeta": { "optimized": true, "width": 1024 }
  }]
}
```

---

## 🎨 Layout & Interaction

The communication view uses a nested layout (`_layout.tsx`) that allows the message thread to remain
active while the user navigates between `chat.tsx`, `info.tsx`, and `attachments/index.tsx`. This
ensures that the WebSocket connection (if active) is not interrupted during navigation within the
same `[chatid]`.
