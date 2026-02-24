## 1. Schema and migration

- [x] 1.1 Add MediaAsset model to Prisma schema: id (cuid), key, bucket, mimeType, size (nullable until confirm), userId, profileId (nullable), scope enum (POST_ATTACHMENT, PROFILE_AVATAR, GENERIC), status enum (PENDING, READY), createdAt, updatedAt; relations to User and optional Profile. Indexes: userId, profileId, status (for cleanup).
- [x] 1.2 Run Prisma migration for MediaAsset

## 2. S3/Spaces client

- [x] 2.1 Create shared S3 client module (e.g. src/lib/s3.ts) using @aws-sdk/client-s3 with custom endpoint and credentials from env (endpoint, region, bucket, access key, secret)
- [x] 2.2 Add helper to generate presigned PUT URL for a given key with TTL (e.g. 15 min) using PutObjectCommand

## 3. Validation and key building

- [x] 3.1 Define explicit allow-list **per scope**: PROFILE_AVATAR (image/jpeg, image/png, image/webp, max 2 MB); POST_ATTACHMENT (same + video/mp4, audio/mpeg, max 50 MB). Add validation helper that returns 400 problem detail when contentType not allowed for scope or size over scope limit. **Size is required** in presign request.
- [x] 3.2 Add key builder: media/{userId}/{assetId}/{sanitizedFilename} with filename sanitization (strip path, safe chars, length limit)

## 4. Presign API

- [x] 4.1 Implement POST /api/media/presign: require session; parse body (filename, contentType, **size required**, scope); validate type and size per scope; create MediaAsset (PENDING, profileId = activeProfileId for publishable scopes); generate presigned URL; return 201 with { uploadUrl, key, assetId, **expiresAt** (ISO) }; 401 if unauthenticated; 400 with application/problem+json for invalid or disallowed

## 5. Confirm API

- [x] 5.1 Implement PATCH /api/media/{id}/confirm: require session; verify requester owns MediaAsset (userId); if asset already READY return 204 (idempotent); else HEAD object in S3; if object exists, set MediaAsset status READY and size from **Content-Length**; return 204; 403 if not owner; 404 if asset not found; **409 Conflict** if object missing in storage (not 400)

## 6. Env, OpenAPI, and docs

- [x] 6.1 Add or update .env.example with S3/Spaces vars (e.g. AWS_S3_BUCKET, AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_ENDPOINT_URL_S3 or equivalent for Spaces)
- [x] 6.2 Ensure specs/openapi/media.yaml exists with POST /api/media/presign and PATCH /api/media/{id}/confirm (request/response and status codes per spec)
- [x] 6.3 Manually verify presign (auth, validation, upload via returned URL) and confirm flow per spec
