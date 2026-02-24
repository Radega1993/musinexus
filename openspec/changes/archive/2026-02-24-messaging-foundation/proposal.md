## Why

Users need to send and receive direct messages; conversations and messages are authored as the active profile. This change delivers a minimal DMs MVP (inbox + conversation view with polling, no realtime). Email notifications are deferred.

## What Changes

- **DB**: New models **Conversation** (container for a thread), **ConversationMember** (profile in a conversation, e.g. 1:1 = two members), **Message** (body, author profile, createdAt). Conversations are 1:1 for MVP (create or reuse by participant pair).
- **API**:
  - **POST /api/conversations** — Create a new 1:1 conversation or return an existing one with the given participant(s).
  - **GET /api/conversations** — List conversations for the current profile (inbox); include last message or summary for preview.
  - **GET /api/conversations/{id}/messages** — List messages in a conversation (paginated).
  - **POST /api/conversations/{id}/messages** — Send a message (body, author = active profile); validation and membership check.
- **UI**: **/messages** — Inbox (list of conversations with polling). **/messages/[id]** — Single conversation (chat) with message list and send form; polling for new messages. No realtime (WebSocket/push) in this slice; email notifications deferred.

## Capabilities

### New Capabilities

- **direct-messages**: 1:1 conversations and messages; APIs for creating/finding conversations, listing inbox, listing and sending messages; authorship by active profile; inbox and conversation UI with polling.

### Modified Capabilities

- (None.)

## Impact

- **Code**: New Prisma models (Conversation, ConversationMember, Message); API routes under `src/app/api/conversations/` and `src/app/api/conversations/[id]/messages/`; pages `/messages` and `/messages/[id]`.
- **APIs**: New endpoints as above.
- **Dependencies**: Builds on Profile (and session/active profile); no new external systems.
- **Systems**: PostgreSQL (new tables); no new external services.
