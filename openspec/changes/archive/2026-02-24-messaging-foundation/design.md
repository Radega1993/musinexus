## Context

- **Stack**: Next.js App Router, Prisma, PostgreSQL. Profile and session/active profile exist; no Conversation or Message models yet.
- **Current state**: No DMs; users cannot message each other.
- **Constraints**: Messages are authored as the **active profile**. MVP is 1:1 only; group chats and realtime are out of scope.

## Goals / Non-Goals

**Goals:**

- **Conversations**: 1:1 only; create via POST or return existing when the same two profiles are the only members.
- **Inbox**: GET /api/conversations lists conversations for the current profile, with last-message preview and ordering by last activity.
- **Messages**: GET (paginated) and POST within a conversation; author = active profile; membership enforced.
- **UI**: /messages (inbox list with polling), /messages/[id] (chat with list + send form, polling). No WebSocket or push.

**Non-Goals:**

- Group conversations. Realtime (WebSocket/SSE). Email or push notifications. Edit/delete message. Read receipts or typing indicators.

## Decisions

1. **Conversation and ConversationMember**  
   Conversation is a container (id, createdAt). Denormalize **lastMessageAt** (DateTime?, indexed) on Conversation; when a message is created, set lastMessageAt = now() so inbox can order by lastMessageAt without subqueries. ConversationMember links Conversation to Profile with a unique (conversationId, profileId). For 1:1, “find or create” means: find a conversation that has exactly two members and those members are the current profile and the other participant; if none, create Conversation + two ConversationMembers.

2. **POST /api/conversations body**  
   Accept a single **otherParticipantProfileId** (or **participantProfileId**) for 1:1. Require auth and active profile. Look up existing 1:1 with that pair; if found return 200 with that conversation; else create conversation + two members and return 201.

3. **Message model**  
   Message has conversationId, authorProfileId (required → Profile), body (text), createdAt, updatedAt. Author is always the session’s active profile when sending; validate that the current profile is a member of the conversation before allowing POST. Optionally **clientMessageId** (string, unique per conversationId+clientMessageId) for idempotent retries on bad network; MVP can omit and add later.

4. **Inbox ordering and preview**  
   GET /api/conversations returns conversations where the current profile is a member. Order by **lastMessageAt** desc (denormalized on Conversation). Include in each item: conversation id, other participant’s profile (for 1:1), last message snippet or id and createdAt for preview. Optionally unread count deferred to later.

5. **Messages pagination**  
   GET /api/conversations/{id}/messages: cursor-based pagination, limit (default 20, max 50). Order **oldest first** so the list reads top-to-bottom as a thread; use cursor on (createdAt, id) for “load more” (older or newer depending on UX). Response includes messages and nextCursor when there are more.

6. **Message body validation**  
   Non-empty string, max length (e.g. 2000 chars). 400 with application/problem+json when invalid.

7. **UI polling**  
   Inbox and conversation page poll on an interval (e.g. 5–10 s) while the tab is focused; no realtime. Keep implementation simple (setInterval + fetch).

8. **Block (Block model) as send rule**  
   Before allowing POST /api/conversations (with otherParticipantProfileId) or POST /api/conversations/{id}/messages, the system SHALL check the existing Block model: if the other participant has blocked the current profile, or the current profile has blocked the other participant, respond 403 Forbidden. This reuses the existing social Block; no new tables.

## Risks / Trade-offs

- **[Mitigated] Inbox ordering** — Denormalizing lastMessageAt on Conversation makes GET /api/conversations trivial and avoids N+1 or subqueries.
- **[Trade-off] Polling only** — Simpler than WebSocket/SSE but higher latency and more requests; acceptable for MVP.
- **[Trade-off] No read receipts** — Simplifies MVP; add later if needed.

## Migration Plan

- Add Conversation, ConversationMember, Message to Prisma; run migration. No change to existing tables. Deploy: run migration, deploy app. Rollback: revert deploy; optional migration to drop new tables later.

## Open Questions

- (Resolved) lastMessageAt denormalized on Conversation for cheap inbox ordering. clientMessageId for idempotent retries: optional, defer to post-MVP if needed.
