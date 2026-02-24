## Why

Posts and profile content will need images, video, and audio. ADR-0001 already decides media in S3-compatible storage (DigitalOcean Spaces) with metadata in Postgres. This change implements the upload path: presigned URLs so the client can upload directly to storage, and MediaAsset records in the DB so the app can reference and validate media before using it in posts. Doing this now unblocks posts implementation.

## What Changes

- Add **POST /api/media/presign**: authenticated endpoint that returns a presigned upload URL (and key, expiresAt) for a single file; request body specifies filename, content type, **size (required)**, and scope. Server creates a MediaAsset record and returns URL + assetId for the client to upload then call **PATCH /api/media/{id}/confirm**.
- Add **PATCH /api/media/{id}/confirm**: idempotent; verifies object exists (HEAD), sets READY and size from Content-Length; 409 if object missing.
- Introduce **MediaAsset** model in Prisma: stores key, bucket, mimeType, size (optional until after upload), owner (user or profile), scope, and status (e.g. pending → ready after upload/processing). Enables listing and validating media before attaching to posts.
- **S3-compatible client integration**: use existing or add @aws-sdk/client-s3 (or equivalent) configured for DigitalOcean Spaces; generate presigned PUT/POST URLs with short TTL; no direct file upload through the app server.
- **Upload validation**: explicit allow-list per scope (PROFILE_AVATAR: jpeg/png/webp, 2 MB; POST_ATTACHMENT: those + mp4/mpeg, 50 MB). Size required in presign request. GENERIC scope disabled or same as post for MVP.

## Capabilities

### New Capabilities

- `media-upload`: Presigned upload flow (POST /api/media/presign), MediaAsset lifecycle (create on presign, update when upload/processing completes if needed), S3/Spaces client and presign generation, and upload validation (content type, size limits). Covers API contract, storage contract, and metadata storage.

### Modified Capabilities

- None. This change adds new behavior only; existing auth and profile specs are unchanged.

## Impact

- **Code**: New API routes under `src/app/api/media/` (presign, confirm), MediaAsset model and migrations, shared S3/Spaces client, validation (per-scope allow-list, size required), key builder. Confirm marks asset READY using HEAD Content-Length.
- **APIs**: POST /api/media/presign, PATCH /api/media/{id}/confirm; OpenAPI in specs/openapi/media.yaml.
- **Dependencies**: @aws-sdk/client-s3 (or equivalent) if not already present; no new infra beyond existing Spaces bucket and Postgres.
- **Systems**: DigitalOcean Spaces (or compatible S3), PostgreSQL for MediaAsset; app server only issues URLs and writes metadata.
