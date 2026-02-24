## ADDED Requirements

### Requirement: Authenticated user can create a post as their active profile

The system SHALL expose POST /api/posts requiring a valid session. The request body MUST include **body** (text) and **mediaAssetIds** (array of MediaAsset ids). The system SHALL create the post with the session's active profile as author (authorProfileId). The system SHALL respond 201 with the created post representation when successful, 401 when not authenticated, and 400 with application/problem+json when the user has no active profile or when the payload is invalid.

#### Scenario: Successful post creation

- **WHEN** an authenticated user with an active profile sends POST /api/posts with valid body and mediaAssetIds (all valid and owned)
- **THEN** the system creates a Post with authorProfileId equal to the session's active profile and creates PostMedia records for each mediaAssetId in order, and responds 201 with the post data

#### Scenario: Post creation requires authentication

- **WHEN** a client sends POST /api/posts without a valid session
- **THEN** the system responds 401

#### Scenario: Post creation rejected when no active profile

- **WHEN** an authenticated user with no active profile set sends POST /api/posts
- **THEN** the system responds 400 with application/problem+json and does not create a post

#### Scenario: Post creation rejected when mediaAssetIds empty or missing

- **WHEN** an authenticated user sends POST /api/posts with mediaAssetIds missing or an empty array
- **THEN** the system responds 400 with application/problem+json and does not create a post

### Requirement: Post creation request MUST support and validate mediaAssetIds

The system MUST accept **mediaAssetIds** in the POST /api/posts request body (array of strings). For each mediaAssetId the system SHALL verify: the MediaAsset exists, its status is READY, and it is owned by the session user or by the session's active profile. The system SHALL reject the entire request with 400 and application/problem+json if any mediaAssetId fails validation (missing, not READY, or not owned). Order of mediaAssetIds in the array SHALL define display order of attachments (e.g. via PostMedia order).

#### Scenario: All mediaAssetIds valid and owned

- **WHEN** an authenticated user sends POST /api/posts with mediaAssetIds that all exist, are READY, and are owned by the user or active profile
- **THEN** the system creates the post and PostMedia records and responds 201

#### Scenario: mediaAssetIds validation fails when asset does not exist

- **WHEN** an authenticated user sends POST /api/posts with a mediaAssetId that does not exist
- **THEN** the system responds 400 with application/problem+json and does not create a post

#### Scenario: mediaAssetIds validation fails when asset is not READY

- **WHEN** an authenticated user sends POST /api/posts with a mediaAssetId whose MediaAsset status is not READY
- **THEN** the system responds 400 with application/problem+json and does not create a post

#### Scenario: mediaAssetIds validation fails when asset is not owned

- **WHEN** an authenticated user sends POST /api/posts with a mediaAssetId that belongs to another user and is not linked to the active profile
- **THEN** the system responds 400 with application/problem+json and does not create a post

### Requirement: Feed returns chronological public posts with pagination

The system SHALL expose GET /api/feed that returns a list of posts in chronological order (newest first). The system SHALL include only posts whose author profile has isPrivate = false. The system SHALL support pagination via limit and cursor (e.g. limit, cursor query parameters) and SHALL return a bounded page size (e.g. default 20, max 50). The response SHALL include post data and MAY include a nextCursor when more results exist.

#### Scenario: Feed returns posts successfully

- **WHEN** a client sends GET /api/feed (optionally with limit and cursor)
- **THEN** the system responds 200 with an array of posts from public profiles, newest first, and respects limit/cursor

#### Scenario: Feed respects visibility

- **WHEN** a client requests GET /api/feed
- **THEN** the system does not include posts from profiles with isPrivate = true

### Requirement: Profile posts listing returns posts by handle with pagination

The system SHALL expose GET /api/profiles/{handle}/posts that returns posts authored by the profile with the given handle. The system SHALL include only posts when the author profile is public (isPrivate = false). The system SHALL support pagination (limit and cursor). The system SHALL respond 404 when no profile exists for the given handle.

#### Scenario: Profile posts returned successfully

- **WHEN** a client sends GET /api/profiles/{handle}/posts for an existing public profile
- **THEN** the system responds 200 with an array of posts by that profile, chronological, paginated

#### Scenario: Profile not found

- **WHEN** a client sends GET /api/profiles/{handle}/posts for a handle that does not exist
- **THEN** the system responds 404

### Requirement: Post and PostMedia data are persisted

The system SHALL persist a Post record with at least id, authorProfileId, body, and createdAt. The system SHALL persist PostMedia records linking each post to its MediaAssets (postId, mediaAssetId, and optional order). Posts SHALL be queryable by author profile and by creation time for feed and listing.

#### Scenario: Post and attachments stored on creation

- **WHEN** a post is created via POST /api/posts with body and mediaAssetIds
- **THEN** a Post row exists with the given body and authorProfileId, and PostMedia rows exist for each mediaAssetId in the specified order
