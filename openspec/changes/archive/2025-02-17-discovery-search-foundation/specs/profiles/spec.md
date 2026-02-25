## MODIFIED Requirements

### Requirement: Anyone can get a profile by handle (public)

The system SHALL expose GET /api/profiles/{handle}. The system MUST return the public profile for that handle when it exists and is not hidden by privacy rules. The response SHALL include the profile fields (id, handle, displayName, avatarUrl, etc. as defined by the API). The response SHALL include followerCount (number of Follow records where this profile is followingProfileId) and followingCount (number of Follow records where this profile is followerProfileId). When the client is authenticated and has an active profile, the response SHALL include isFollowing (boolean indicating whether the active profile follows this profile). The response SHALL include posts (array or summary of the profile's posts, e.g. latest N with same shape as used elsewhere). For private profiles, the system SHALL apply policy (e.g. 404 or restricted fields) as defined by the API contract.

#### Scenario: Get profile by handle returns public profile with counts and posts

- **WHEN** a client sends GET /api/profiles/{handle} for an existing public profile
- **THEN** system responds 200 with the Profile object including followerCount, followingCount, isFollowing (when authenticated), and posts

#### Scenario: Get profile by handle includes isFollowing when authenticated

- **WHEN** an authenticated user with an active profile sends GET /api/profiles/{handle} for an existing public profile
- **THEN** system responds 200 and the response includes isFollowing true or false

#### Scenario: Get profile by handle not found

- **WHEN** a client sends GET /api/profiles/{handle} for a non-existent or inaccessible handle
- **THEN** system responds 404
