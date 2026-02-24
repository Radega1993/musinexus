## ADDED Requirements

### Requirement: Authenticated profile can add or remove a like on a post

The system SHALL expose POST /api/posts/{id}/like and DELETE /api/posts/{id}/like requiring a valid session. The system SHALL use the session's active profile as the actor. POST SHALL add a like for that profile on the post (idempotent: if already liked, respond 204). DELETE SHALL remove the like. The system SHALL respond 401 when not authenticated, 400 when the user has no active profile, and 404 when the post does not exist. The system SHALL enforce at most one like per profile per post (unique postId, profileId).

#### Scenario: POST like adds a like

- **WHEN** an authenticated user with an active profile sends POST /api/posts/{id}/like for an existing post they have not liked
- **THEN** the system creates a Like record for that post and profile and responds 201 or 204

#### Scenario: POST like is idempotent when already liked

- **WHEN** an authenticated user with an active profile sends POST /api/posts/{id}/like for a post they have already liked
- **THEN** the system does not create a duplicate like and responds 204

#### Scenario: DELETE like removes the like

- **WHEN** an authenticated user with an active profile sends DELETE /api/posts/{id}/like for a post they have liked
- **THEN** the system removes the Like record and responds 204

#### Scenario: Like requires authentication

- **WHEN** a client sends POST or DELETE /api/posts/{id}/like without a valid session
- **THEN** the system responds 401

#### Scenario: Like requires active profile

- **WHEN** an authenticated user with no active profile sends POST /api/posts/{id}/like
- **THEN** the system responds 400 with application/problem+json

#### Scenario: Like returns 404 when post not found

- **WHEN** an authenticated user sends POST or DELETE /api/posts/{id}/like for a non-existent post id
- **THEN** the system responds 404

### Requirement: Authenticated profile can add or remove a save on a post

The system SHALL expose POST /api/posts/{id}/save and DELETE /api/posts/{id}/save requiring a valid session. The system SHALL use the session's active profile as the actor. POST SHALL add a save for that profile on the post (idempotent if already saved). DELETE SHALL remove the save. The system SHALL respond 401 when not authenticated, 400 when the user has no active profile, and 404 when the post does not exist. The system SHALL enforce at most one save per profile per post (unique postId, profileId).

#### Scenario: POST save adds a save

- **WHEN** an authenticated user with an active profile sends POST /api/posts/{id}/save for an existing post they have not saved
- **THEN** the system creates a Save record and responds 201 or 204

#### Scenario: DELETE save removes the save

- **WHEN** an authenticated user with an active profile sends DELETE /api/posts/{id}/save for a post they have saved
- **THEN** the system removes the Save record and responds 204

#### Scenario: Save requires authentication and active profile

- **WHEN** a client sends POST /api/posts/{id}/save without a valid session or without an active profile
- **THEN** the system responds 401 or 400 accordingly

#### Scenario: Save returns 404 when post not found

- **WHEN** an authenticated user sends POST or DELETE /api/posts/{id}/save for a non-existent post id
- **THEN** the system responds 404

### Requirement: Comments can be listed and created for a post

The system SHALL expose GET /api/posts/{id}/comments and POST /api/posts/{id}/comments. GET SHALL return a paginated list of comments for the post (newest first), with limit and cursor; response SHALL include comments and MAY include nextCursor. POST SHALL create a comment with body and authorProfileId set to the session's active profile; the system SHALL validate body (non-empty, max length e.g. 2000 characters) and SHALL respond 400 with application/problem+json when invalid or when the user has no active profile. The system SHALL respond 404 when the post does not exist. GET MAY be unauthenticated for public posts; POST requires authentication.

#### Scenario: GET comments returns paginated list

- **WHEN** a client sends GET /api/posts/{id}/comments with optional limit and cursor for an existing post
- **THEN** the system responds 200 with an array of comments (newest first) and optionally nextCursor

#### Scenario: POST comment creates a comment

- **WHEN** an authenticated user with an active profile sends POST /api/posts/{id}/comments with a valid body for an existing post
- **THEN** the system creates a Comment with authorProfileId equal to the active profile and responds 201 with the comment data

#### Scenario: POST comment rejected when body invalid

- **WHEN** an authenticated user sends POST /api/posts/{id}/comments with an empty body or body exceeding the maximum length
- **THEN** the system responds 400 with application/problem+json and does not create a comment

#### Scenario: POST comment requires active profile

- **WHEN** an authenticated user with no active profile sends POST /api/posts/{id}/comments
- **THEN** the system responds 400 with application/problem+json

#### Scenario: Comments return 404 when post not found

- **WHEN** a client sends GET or POST /api/posts/{id}/comments for a non-existent post id
- **THEN** the system responds 404

### Requirement: Like, Comment, and Save data are persisted

The system SHALL persist Like records with postId and profileId (unique per pair). The system SHALL persist Save records with postId and profileId (unique per pair). The system SHALL persist Comment records with postId, authorProfileId, body, and createdAt. Comments SHALL be queryable by post with stable ordering for pagination.

#### Scenario: Like and Save are unique per post and profile

- **WHEN** a like or save is created for a given post and profile
- **THEN** at most one Like and at most one Save exist for that (postId, profileId) pair

#### Scenario: Comment is stored with author profile

- **WHEN** a comment is created via POST /api/posts/{id}/comments
- **THEN** a Comment row exists with the given postId, body, authorProfileId equal to the session's active profile, and createdAt

### Requirement: Post responses may include interaction counts and flags

The system MAY include in post list or single-post responses the fields likeCount, saveCount, commentCount (numbers) and likedByMe, savedByMe (booleans for the current profile when authenticated). When included, counts SHALL reflect current data and flags SHALL reflect the session's active profile. This requirement is optional for MVP (may be implemented in this change or a follow-up).

#### Scenario: Post response includes counts when implemented

- **WHEN** a client requests a post or list of posts and the implementation includes interaction data
- **THEN** the response includes likeCount, saveCount, and commentCount for each post

#### Scenario: Post response includes likedByMe and savedByMe when implemented

- **WHEN** an authenticated user with an active profile requests a post or list of posts and the implementation includes interaction flags
- **THEN** the response includes likedByMe and savedByMe for each post according to whether that profile has liked or saved the post
