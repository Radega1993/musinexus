## ADDED Requirements

### Requirement: Client can search profiles by handle or displayName

The system SHALL expose GET /api/search/profiles with query parameter q. The system SHALL return profiles whose handle or displayName contains the query string (case-insensitive). The system SHALL exclude private profiles from results. Each profile in the response SHALL include id, handle, displayName, avatarUrl. When the client is authenticated and has an active profile, each profile SHALL include isFollowing (boolean indicating whether the active profile follows that profile). When the client is not authenticated or has no active profile, isFollowing MAY be omitted or SHALL be false. The system MAY enforce a minimum length for q (e.g. 2 characters) and SHALL return an empty list or 400 when q is missing or invalid. The system MAY support limit and pagination; response SHALL be JSON with profiles array.

#### Scenario: Search returns matching profiles

- **WHEN** a client sends GET /api/search/profiles?q=john for a non-empty query
- **THEN** the system responds 200 with a profiles array containing profiles whose handle or displayName match, each with id, handle, displayName, avatarUrl, and isFollowing when applicable

#### Scenario: Search with active profile includes isFollowing

- **WHEN** an authenticated user with an active profile sends GET /api/search/profiles?q=art
- **THEN** the system responds 200 with profiles array and each profile includes isFollowing true or false according to whether the active profile follows that profile

#### Scenario: Search unauthenticated omits or sets isFollowing false

- **WHEN** a client without a valid session sends GET /api/search/profiles?q=art
- **THEN** the system responds 200 with profiles array; isFollowing is absent or false for each profile

#### Scenario: Search returns empty for no match or short query

- **WHEN** a client sends GET /api/search/profiles?q=xy and no profile matches, or q is below minimum length
- **THEN** the system responds 200 with an empty profiles array or 400 for invalid q
