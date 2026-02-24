## ADDED Requirements

### Requirement: Authenticated user can obtain a presigned upload URL

The system SHALL expose POST /api/media/presign requiring a valid session. The system MUST accept a request body with filename, contentType, and optional scope. The system SHALL validate contentType against an allow-list and MUST validate optional size limit. The system SHALL create a MediaAsset record with status PENDING and MUST return 201 with a JSON body containing uploadUrl (presigned PUT URL), key, and assetId. The system SHALL respond 401 when the request is not authenticated and 400 with application/problem+json when the payload is invalid or validation fails.

#### Scenario: Successful presign request

- **WHEN** an authenticated client sends POST /api/media/presign with valid filename, allowed contentType, and optional scope within size limit
- **THEN** the system creates a MediaAsset with status PENDING and responds 201 with { uploadUrl, key, assetId }

#### Scenario: Presign requires authentication

- **WHEN** a client sends POST /api/media/presign without a valid session
- **THEN** the system responds 401

#### Scenario: Presign rejected for disallowed content type

- **WHEN** an authenticated client sends POST /api/media/presign with a contentType not in the allow-list
- **THEN** the system responds 400 with application/problem+json and does not create a MediaAsset

#### Scenario: Presign rejected when size limit exceeded

- **WHEN** an authenticated client sends POST /api/media/presign with a declared size exceeding the maximum allowed
- **THEN** the system responds 400 with application/problem+json and does not create a MediaAsset

### Requirement: Presigned URL is suitable for direct client upload

The system SHALL generate a presigned URL that allows a single PUT request to upload the object to S3-compatible storage. The URL MUST have a limited TTL (e.g. 15 minutes). The object key MUST be unique per MediaAsset and MUST follow a deterministic structure including the asset id.

#### Scenario: Client can upload using the returned URL

- **WHEN** the client receives uploadUrl and key from a successful presign response
- **THEN** the client can perform a PUT request to uploadUrl with the file body and the object is stored at the specified key

#### Scenario: Presigned URL expires

- **WHEN** the TTL has passed since the presign response
- **THEN** a PUT to the same uploadUrl is rejected by the storage provider

### Requirement: MediaAsset metadata is stored in the database

The system SHALL persist a MediaAsset record for each successful presign. The record MUST include at least: id, key, bucket, mimeType, userId, optional profileId, scope, status (PENDING or READY), and createdAt. The system MAY set size when known (e.g. after confirm). MediaAsset SHALL be associated with the authenticated user and optionally with a profile when scope is profile-related.

#### Scenario: MediaAsset created on presign

- **WHEN** presign succeeds
- **THEN** a MediaAsset row exists with status PENDING, the returned assetId, and the key and bucket used for the presigned URL

#### Scenario: MediaAsset ownership reflects session

- **WHEN** presign is called by an authenticated user (and optional profile scope)
- **THEN** the created MediaAsset has userId equal to the session user and profileId set when scope is profile-related

### Requirement: Upload validation uses an allow-list of content types and a max size

The system SHALL validate the presign request against an allow-list of MIME types (e.g. image/jpeg, image/png, image/webp, image/gif, video/mp4, audio/mpeg, audio/wav or equivalent). The system SHALL enforce a maximum allowed size per upload (e.g. 50 MB). The system MUST reject requests with a content type not in the allow-list or with size exceeding the limit by responding 400 with application/problem+json.

#### Scenario: Allowed content type and size accepted

- **WHEN** the request specifies a contentType in the allow-list and an optional size within the limit
- **THEN** validation passes and presign proceeds

#### Scenario: Disallowed content type rejected

- **WHEN** the request specifies a contentType not in the allow-list
- **THEN** the system responds 400 and does not create a MediaAsset or return a URL

### Requirement: Confirm step marks asset ready after upload

The system SHALL expose PATCH /api/media/{id}/confirm requiring a valid session. The system SHALL verify the requester owns the MediaAsset (by userId). The system SHALL verify the object exists in storage via HEAD and MUST set MediaAsset status to READY and set size from **Content-Length** (no custom metadata). **Idempotent**: if the asset is already READY, the system SHALL respond 204. The system SHALL respond 204 on success, 403 if the user does not own the asset, 404 if the asset does not exist, and **409 Conflict** if the object is not present in storage (not 400).

#### Scenario: Confirm succeeds when object exists

- **WHEN** an authenticated user who owns the MediaAsset calls confirm and the object exists at the asset's key in storage
- **THEN** the system sets the asset status to READY, sets size from HEAD Content-Length, and responds 204

#### Scenario: Confirm idempotent when already READY

- **WHEN** an authenticated user who owns the MediaAsset calls confirm and the asset status is already READY
- **THEN** the system responds 204 without changing the asset

#### Scenario: Confirm returns 409 when object missing

- **WHEN** an authenticated user who owns the MediaAsset calls confirm and the object does not exist at the asset's key in storage
- **THEN** the system responds 409 Conflict and does not change the asset

#### Scenario: Confirm forbidden for non-owner

- **WHEN** an authenticated user calls confirm for a MediaAsset they do not own
- **THEN** the system responds 403
