# direct-messages Specification

## Purpose
TBD - created by archiving change messaging-foundation. Update Purpose after archive.
## Requirements
### Requirement: Authenticated profile can create or get a 1:1 conversation

The system SHALL expose POST /api/conversations requiring a valid session and the session's active profile. The request body SHALL include otherParticipantProfileId (the other profile in the 1:1). The system SHALL respond 403 if either profile has blocked the other (existing Block model). The system SHALL find an existing conversation that has exactly two members: the active profile and the other participant; if found, respond 200 with that conversation. If not found, the system SHALL create a new Conversation and two ConversationMembers (one for each profile) and respond 201 with the new conversation. The system SHALL respond 401 when not authenticated, 400 when the user has no active profile or when otherParticipantProfileId is missing or invalid, and 404 when the other participant profile does not exist. The system SHALL NOT allow creating a conversation with the same profile as the current user (self-DM); respond 400 in that case.

#### Scenario: POST returns existing 1:1 conversation

- **WHEN** an authenticated user with an active profile sends POST /api/conversations with otherParticipantProfileId for a profile with whom a 1:1 conversation already exists
- **THEN** the system returns 200 with the existing conversation data

#### Scenario: POST creates new 1:1 conversation

- **WHEN** an authenticated user with an active profile sends POST /api/conversations with otherParticipantProfileId for a profile with whom no 1:1 exists
- **THEN** the system creates a Conversation and two ConversationMembers and returns 201 with the new conversation data

#### Scenario: Create conversation requires authentication and active profile

- **WHEN** a client sends POST /api/conversations without a valid session or without an active profile
- **THEN** the system responds 401 or 400 with application/problem+json accordingly

#### Scenario: Create conversation rejects self-DM and invalid participant

- **WHEN** an authenticated user sends POST /api/conversations with otherParticipantProfileId equal to their own active profile, or with a non-existent profile id
- **THEN** the system responds 400 or 404 with application/problem+json

#### Scenario: Create conversation returns 403 when blocked

- **WHEN** an authenticated user sends POST /api/conversations with otherParticipantProfileId and either the other profile has blocked the current profile or the current profile has blocked the other
- **THEN** the system responds 403 Forbidden

### Requirement: Authenticated profile can list their conversations (inbox)

The system SHALL expose GET /api/conversations requiring a valid session and active profile. The system SHALL return only conversations where the current profile is a member. Each item SHALL include conversation id, the other participant's profile (for 1:1), and last message preview (snippet or id and createdAt). Results SHALL be ordered by last message activity (newest first). The system SHALL respond 401 when not authenticated and 400 when the user has no active profile. When the user has no conversations, the system SHALL return an empty array.

#### Scenario: GET conversations returns inbox list

- **WHEN** an authenticated user with an active profile sends GET /api/conversations
- **THEN** the system responds 200 with an array of conversations including other participant and last message preview, ordered by last activity

#### Scenario: Inbox requires authentication and active profile

- **WHEN** a client sends GET /api/conversations without a valid session or without an active profile
- **THEN** the system responds 401 or 400 accordingly

#### Scenario: Inbox returns empty when no conversations

- **WHEN** an authenticated user with an active profile has no conversations and sends GET /api/conversations
- **THEN** the system responds 200 with an empty array

### Requirement: Authenticated profile can list messages in a conversation they belong to

The system SHALL expose GET /api/conversations/{id}/messages. The system SHALL return messages only if the current profile is a member of the conversation. Results SHALL be paginated (cursor-based, limit default 20 max 50), ordered oldest first. The response SHALL include messages and MAY include nextCursor when there are more. Each message SHALL include id, body, authorProfileId (or author profile summary), createdAt. The system SHALL respond 401 when not authenticated, 403 when the profile is not a member of the conversation, and 404 when the conversation does not exist.

#### Scenario: GET messages returns paginated list

- **WHEN** an authenticated user who is a member of the conversation sends GET /api/conversations/{id}/messages with optional limit and cursor
- **THEN** the system responds 200 with messages ordered oldest first and optionally nextCursor

#### Scenario: GET messages requires membership

- **WHEN** an authenticated user who is not a member of the conversation sends GET /api/conversations/{id}/messages
- **THEN** the system responds 403

#### Scenario: GET messages returns 404 when conversation not found

- **WHEN** an authenticated user sends GET /api/conversations/{id}/messages for a non-existent conversation id
- **THEN** the system responds 404

### Requirement: Authenticated profile can send a message in a conversation they belong to

The system SHALL expose POST /api/conversations/{id}/messages requiring a valid session and active profile. The request body SHALL include body (non-empty string, max length e.g. 2000 characters). The system SHALL respond 403 if the other participant has blocked the current profile or the current profile has blocked the other (existing Block model). The system SHALL create a Message with authorProfileId equal to the active profile only if the active profile is a member of the conversation. The system SHALL respond 201 with the created message when successful. The system SHALL respond 401 when not authenticated, 400 when the user has no active profile or when body is invalid (empty or too long), 403 when the profile is not a member of the conversation or when blocked, and 404 when the conversation does not exist.

#### Scenario: POST message creates a message

- **WHEN** an authenticated user with an active profile who is a member of the conversation sends POST /api/conversations/{id}/messages with a valid body
- **THEN** the system creates a Message with authorProfileId equal to the active profile and responds 201 with the message data

#### Scenario: POST message rejects invalid body

- **WHEN** an authenticated user sends POST /api/conversations/{id}/messages with an empty body or body exceeding the maximum length
- **THEN** the system responds 400 with application/problem+json and does not create a message

#### Scenario: POST message requires membership

- **WHEN** an authenticated user who is not a member of the conversation sends POST /api/conversations/{id}/messages
- **THEN** the system responds 403

#### Scenario: POST message returns 404 when conversation not found

- **WHEN** an authenticated user sends POST /api/conversations/{id}/messages for a non-existent conversation id
- **THEN** the system responds 404

#### Scenario: POST message returns 403 when blocked

- **WHEN** an authenticated user who is a member of the conversation sends POST /api/conversations/{id}/messages but the other participant has blocked them or they have blocked the other
- **THEN** the system responds 403 Forbidden

### Requirement: Conversation, ConversationMember, and Message data are persisted

The system SHALL persist Conversation records (id, createdAt, lastMessageAt optional and indexed for inbox ordering). The system SHALL persist ConversationMember records with conversationId and profileId and SHALL enforce uniqueness per (conversationId, profileId). The system SHALL persist Message records with conversationId, authorProfileId, body, createdAt, and updatedAt. When a message is created, the system SHALL set the conversation’s lastMessageAt to the message’s createdAt. For 1:1, a conversation SHALL have exactly two members.

#### Scenario: Conversation has exactly two members for 1:1

- **WHEN** a new 1:1 conversation is created via POST /api/conversations
- **THEN** exactly one Conversation and two ConversationMember rows exist for that conversation

#### Scenario: Message is stored with author profile

- **WHEN** a message is created via POST /api/conversations/{id}/messages
- **THEN** a Message row exists with the given conversationId, body, authorProfileId equal to the session's active profile, and createdAt

#### Scenario: Conversation lastMessageAt is updated when message is created

- **WHEN** a message is created via POST /api/conversations/{id}/messages
- **THEN** the conversation’s lastMessageAt is set to that message’s createdAt (or now)

