## Context

- **Stack**: Next.js App Router, Prisma, PostgreSQL, S3-compatible storage (ADR-0001: DigitalOcean Spaces). `@aws-sdk/client-s3` is already in the project. No media or MediaAsset model exists yet.
- **Current state**: No `/api/media/*` routes; no MediaAsset table. Posts and profile avatars will reference media by asset id or URL once this foundation is in place.
- **Constraints**: Client uploads directly to storage (presigned URL); app server never streams file bytes. Metadata in Postgres only.

## Goals / Non-Goals

**Goals:**

- **POST /api/media/presign**: Authenticated endpoint; accepts filename, contentType, **size (required)**, scope; validates type/size **per scope**; creates MediaAsset (status PENDING); returns presigned PUT URL, key, assetId, and **expiresAt** (ISO). Client uploads to the URL then calls **PATCH /api/media/{id}/confirm** to mark READY.
- **MediaAsset model**: Persist id, key, bucket, mimeType, size (nullable until confirm), userId, profileId (nullable), scope, status (PENDING → READY), createdAt, updatedAt. Indexes: userId, profileId, status (for cleanup). Relations to User and optional Profile.
- **S3/Spaces integration**: Single shared S3 client (env: endpoint, region, bucket, credentials). Generate presigned URLs with `PutObject`, short TTL (e.g. 15 min). Key namespace to avoid collisions and allow listing by prefix if needed.
- **Validation**: At presign time, **explicit allow-list per scope** and max size per scope. **Size is required** in the request so the server can enforce limits. Return 400 with problem detail when invalid.

**Non-Goals:**

- Direct upload through the app server (no multipart to Next.js). No transcoding, thumbnailing, or virus scan in this change. No CDN or custom domain in front of Spaces for MVP. No public “list my uploads” API in this slice if not required by presign flow (can add later).

## Decisions

1. **Presigned method: PUT (not POST)**  
   Use S3 `PutObject` presigned URL so the client does a single PUT with the file body. Alternative: multipart upload (POST) for very large files — deferred; we can add later with a separate endpoint or larger size limit.

2. **Object key shape**  
   Use a deterministic prefix to avoid collisions and support future listing: `media/{userId}/{assetId}/{sanitizedFilename}`. `assetId` is the MediaAsset cuid so each presign creates one asset and one object. Sanitize filename (strip path, limit length, allow only safe chars) to avoid injection and long keys.

3. **MediaAsset ownership and scope**  
   Store `userId` (required) and `profileId` (nullable). Scope enum: `POST_ATTACHMENT`, `PROFILE_AVATAR` (GENERIC disabled or same as post for MVP). **MVP: profileId = User.activeProfileId for all publishable uploads** (posts and avatar). For PROFILE_AVATAR: profileId required and MUST equal the user's activeProfileId (or valid membership). For POST_ATTACHMENT: profileId = activeProfileId so the post is "as" that profile. This simplifies permissions later.

4. **Status lifecycle and confirm endpoint**  
   Create MediaAsset with status `PENDING` at presign. **Include PATCH /api/media/{id}/confirm** in this change: client calls it after upload. Server verifies ownership (userId), performs **HEAD** on the object in S3; if object exists, set status READY and **size from Content-Length** (do not rely on custom metadata; DigitalOcean Spaces returns ContentLength). **Idempotent**: if asset is already READY, return 204. If object does not exist in storage, return **409 Conflict** (not 400). 403 if not owner, 404 if asset not found.

5. **S3 client and env**  
   Use `@aws-sdk/client-s3` with custom endpoint for Spaces (`AWS_ENDPOINT_URL_S3` or equivalent). Credentials from env (access key, secret). Single shared client module (e.g. `src/lib/s3.ts`) used by the presign route. Bucket and region from env.

6. **Validation rules (explicit allow-list by scope)**  
   **Size is required** in the presign request so the server can enforce limits (best-effort; client may upload different size, but we reject at presign if declared size over limit). Allow-list is **explicit and per scope**:
   - **PROFILE_AVATAR**: `image/jpeg`, `image/png`, `image/webp` only; max **2 MB**.
   - **POST_ATTACHMENT**: same images + `video/mp4`, `audio/mpeg`; max **50 MB**.
   - **GENERIC**: for MVP either same as POST_ATTACHMENT or disabled to avoid a catch-all.
   Reject anything else with 400 and application/problem+json.

7. **Idempotency / duplicate keys**  
   Each presign creates a new MediaAsset and a unique key (assetId in path). No reuse of the same key for multiple uploads; if the client fails and retries, they get a new presign and a new asset. Optional: allow “replace” by asset id (same key, new version) in a later iteration.

## Risks / Trade-offs

- **[Risk] Presigned URL abuse** — Anyone with a URL could upload until expiry. Mitigation: short TTL (15 min); URLs not logged in client-side code in a way that’s easily scraped; rate limit presign by user in a later iteration.
- **[Risk] Orphan PENDING assets** — Users presign but never upload, leaving DB rows and (if they uploaded) objects. Mitigation: optional cleanup job (delete PENDING assets older than 24 h and corresponding objects); or leave for later.
- **[Risk] Key enumeration** — Key contains userId and assetId. Mitigation: assetId is unguessable (cuid); bucket not listable by anonymous; acceptable for MVP.

## Migration Plan

- Add MediaAsset model and run Prisma migration. No change to existing tables. Deploy: run migration, set S3/Spaces env vars, deploy app. Rollback: remove route and leave table (no data migration); optionally drop MediaAsset table in a later migration if we abandon the feature.

## Open Questions

- **GENERIC scope**: Allow in MVP (same rules as POST_ATTACHMENT) or leave disabled.
- **One avatar per profile**: Enforce "replace" previous avatar when uploading new PROFILE_AVATAR (same profileId) in this change or follow-up.
