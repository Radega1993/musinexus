## ADDED Requirements

### Requirement: Authenticated user can list their profiles

The system SHALL expose GET /api/me/profiles requiring a valid session. The system MUST return only profiles for which the current user has a ProfileMember record, and MUST respond 401 when no valid session is present.

#### Scenario: List returns member profiles

- **WHEN** an authenticated client sends GET /api/me/profiles
- **THEN** system responds 200 with JSON { profiles: [ ... ] } containing all profiles where the user is a member

#### Scenario: List requires authentication

- **WHEN** a client sends GET /api/me/profiles without a valid session cookie
- **THEN** system responds 401

### Requirement: Authenticated user can create a profile

The system SHALL expose POST /api/profiles requiring a valid session, with body type, handle, displayName (and optional bio, location, instruments). The system MUST create a Profile and a ProfileMember with role OWNER for the current user. Handle MUST be globally unique; the system SHALL respond 409 if the handle already exists.

#### Scenario: Create profile success

- **WHEN** an authenticated client sends POST /api/profiles with valid type, handle (min 3 chars), and displayName (min 2 chars)
- **THEN** system creates the Profile and ProfileMember (OWNER), and responds 201 with the full Profile object

#### Scenario: Create profile rejected when handle exists

- **WHEN** an authenticated client sends POST /api/profiles with a handle that is already in use
- **THEN** system responds 409 and does not create a profile

#### Scenario: Create profile requires authentication

- **WHEN** a client sends POST /api/profiles without a valid session
- **THEN** system responds 401

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

### Requirement: Member can update a profile

The system SHALL expose PATCH /api/profiles/id/{profileId} requiring a valid session. The system MUST allow update only if the current user is a ProfileMember of that profile with role OWNER or ADMIN. The system SHALL accept partial updates (displayName, bio, avatarUrl, location, links, instruments, isPrivate) and MUST respond 403 if the user is not an OWNER or ADMIN.

#### Scenario: Update profile success

- **WHEN** an authenticated user with OWNER or ADMIN role on the profile sends PATCH /api/profiles/id/{profileId} with valid body fields
- **THEN** system updates the profile and responds 200 with the updated Profile object

#### Scenario: Update profile forbidden for non-admin member

- **WHEN** an authenticated user with only EDITOR role on the profile sends PATCH /api/profiles/id/{profileId}
- **THEN** system responds 403

#### Scenario: Update profile requires authentication

- **WHEN** a client sends PATCH /api/profiles/id/{profileId} without a valid session
- **THEN** system responds 401

### Requirement: User can set active profile for the session

The system SHALL expose an endpoint (e.g. POST /api/me/active-profile requiring a valid session, with body { profileId }. The system MUST update User.activeProfileId only if the current user is a member of that profile. The system SHALL respond 403 if the user is not a member of the given profile, and MUST persist the active profile in the session for subsequent requests.

#### Scenario: Set active profile success

- **WHEN** an authenticated user who is a member of profile P sends the set-active request with profileId P
- **THEN** system updates User.activeProfileId to P and responds 204 (or success per API spec)

#### Scenario: Set active profile rejected when not member

- **WHEN** an authenticated user sends the set-active request with a profileId for which they are not a member
- **THEN** system responds 403 and does not change the session

#### Scenario: Set active profile requires authentication

- **WHEN** a client sends the set-active request without a valid session
- **THEN** system responds 401
