## 1. Data layer

- [x] 1.1 Add Conversation (id, createdAt, lastMessageAt DateTime? @index), ConversationMember (unique conversationId+profileId), and Message (conversationId, authorProfileId, body, createdAt, updatedAt) to Prisma schema
- [x] 1.2 Run Prisma migration for new tables

## 2. Conversations API

- [x] 2.1 Implement POST /api/conversations (body: otherParticipantProfileId; auth, active profile; 403 if blocked; find existing 1:1 or create Conversation + two ConversationMembers; 200/201, 400 self-DM or invalid, 404 profile not found)
- [x] 2.2 Implement GET /api/conversations (inbox: conversations where current profile is member; order by lastMessageAt desc; include other participant and last message preview)

## 3. Messages API

- [x] 3.1 Implement GET /api/conversations/[id]/messages (paginated, cursor, oldest first, limit default 20 max 50; membership check, 403/404)
- [x] 3.2 Implement POST /api/conversations/[id]/messages (body validation non-empty and max 2000 chars; active profile; 403 if blocked; membership check; update Conversation.lastMessageAt on create; 201/400/403/404)

## 4. UI

- [x] 4.1 Add /messages page: inbox list (GET /api/conversations), polling when tab focused, link to /messages/[id]
- [x] 4.2 Add /messages/[id] page: conversation messages (GET messages), send form (POST message), polling for new messages
