## ADDED Requirements

### Requirement: Authenticated active profile can follow another profile

The system SHALL expose POST /api/profiles/{id}/follow requiring a valid session and an active profile. The system SHALL create a Follow record with followerProfileId equal to the session's active profile and followingProfileId equal to the profile id in the path. The system SHALL respond 201 or 204 when the follow is created; if the active profile already follows that profile, the system SHALL respond 204 (idempotent). The system SHALL respond 401 when not authenticated, 400 when the user has no active profile, 403 when the profile id is the same as the active profile (cannot follow self), and 404 when the profile id does not exist.

#### Scenario: POST follow creates a follow

- **WHEN** an authenticated user with an active profile sends POST /api/profiles/{id}/follow for an existing profile they do not follow and id is not their own profile
- **THEN** the system creates a Follow record and responds 201 or 204

#### Scenario: POST follow is idempotent when already following

- **WHEN** an authenticated user with an active profile sends POST /api/profiles/{id}/follow for a profile they already follow
- **THEN** the system does not create a duplicate and responds 204

#### Scenario: POST follow requires authentication and active profile

- **WHEN** a client sends POST /api/profiles/{id}/follow without a valid session or without an active profile
- **THEN** the system responds 401 or 400 with application/problem+json accordingly

#### Scenario: POST follow rejected for self and not found

- **WHEN** an authenticated user sends POST /api/profiles/{id}/follow with id equal to their active profile id, or with a non-existent profile id
- **THEN** the system responds 403 or 404 accordingly

### Requirement: Authenticated active profile can unfollow another profile

The system SHALL expose DELETE /api/profiles/{id}/follow requiring a valid session and an active profile. The system SHALL remove the Follow record for the active profile as follower and the profile id as following. The system SHALL respond 204 when the follow was removed or did not exist (idempotent). The system SHALL respond 401 when not authenticated, 400 when the user has no active profile, and 404 when the profile id does not exist.

#### Scenario: DELETE follow removes the follow

- **WHEN** an authenticated user with an active profile sends DELETE /api/profiles/{id}/follow for a profile they follow
- **THEN** the system removes the Follow record and responds 204

#### Scenario: DELETE follow is idempotent when not following

- **WHEN** an authenticated user with an active profile sends DELETE /api/profiles/{id}/follow for a profile they do not follow
- **THEN** the system responds 204 without error

#### Scenario: DELETE follow returns 404 when profile not found

- **WHEN** an authenticated user sends DELETE /api/profiles/{id}/follow for a non-existent profile id
- **THEN** the system responds 404
