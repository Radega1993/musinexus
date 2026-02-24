## Context

- **Stack**: Next.js App Router, Prisma, PostgreSQL. Profile, MediaAsset, and Follow models exist. Media upload flow (presign + confirm) is implemented; assets are owned by user and optionally tied to a profile.
- **Current state**: No Post or PostMedia models; no feed or post-creation APIs or UI.
- **Constraints**: Posts are authored by a **profile** (the user's active profile at creation time). Attachments are existing MediaAssets only (no inline upload in this change). Feed and listing are read-heavy; keep queries simple for MVP.

## Goals / Non-Goals

**Goals:**

- **Post model**: Author = Profile (authorProfileId); body optional (caption, Instagram-like); createdAt. Relation to MediaAssets via PostMedia join; creation requires **mediaAssetIds** (min 1) and validates ownership by profileId only (READY).
- **PostMedia**: Join table Post ↔ MediaAsset with optional order for display.
- **POST /api/posts**: Authenticated; body optional; **mediaAssetIds** required (min 1); create as session's active profile; validate each mediaAssetId (exists, READY, **asset.profileId === activeProfileId**; 400 if profileId null or mismatch).
- **GET /api/feed**: Posts from session's active profile plus posts from profiles that active profile follows; chronological; paginated. (Global timeline → GET /api/explore later.)
- **GET /api/profiles/{handle}/posts**: Posts by profile handle; paginated; public only (or respect isPrivate later).
- **Minimal UI**: /feed, /create-post, PostCard; no rich editor or inline media upload in this slice.

**Non-Goals:**

- Hashtag model and tagging in this change (optional in proposal; can add in follow-up).
- Comments, likes, or reactions. Edit/delete post. Search or filters. Notifications.

## Decisions

1. **Author model**  
   Post has `authorProfileId` (required) → Profile. The “user” is implied by the profile’s memberships; we don’t store userId on Post to avoid redundancy and keep “post as profile” clear. Creation uses session’s activeProfileId; if missing, return 400.

2. **PostMedia and mediaAssetIds**  
   Join table: PostMedia(postId, mediaAssetId, order?). Uniqueness: (postId, mediaAssetId) to avoid duplicates. On create: accept array of mediaAssetIds; for each id, verify MediaAsset exists, status READY, and (asset.userId === session.user.id || asset.profileId === activeProfileId). Reject entire request if any check fails (400 with problem detail). Order: optional integer for display order; if omitted, use array index.

3. **Feed source for MVP**  
   **Option A (simplest):** GET /api/feed returns global chronological (all posts, public profiles only), newest first. **Option B:** Feed = posts from profiles the current user’s active profile follows. For MVP we choose **Option A** (global timeline); filter by isPrivate so only public profiles’ posts appear. Add “following feed” later if needed.

4. **Pagination**  
   Cursor-based (e.g. createdAt + id) for stable ordering and scalability, or offset/limit for simplicity. MVP: **limit + cursor** (e.g. cursor = last post id or last createdAt); response includes nextCursor if more. Default limit 20, max 50.

5. **Visibility**  
   For feed and GET /api/profiles/{handle}/posts: only include posts whose author profile has isPrivate = false. No per-post visibility in MVP.

6. **UI data shape and publicUrl**  
   GET responses (feed, profile posts, create response) SHALL include for each post: id, body (caption), createdAt, author (handle, displayName, avatarUrl), and **media** as array of `{ id, mimeType, key, publicUrl }` so PostCard can render without extra round-trips. publicUrl: use public bucket URL (endpoint + bucket + key) in MVP, or later GET /api/media/{id}/url for signed GET if bucket is private.

## Risks / Trade-offs

- **[Risk] Feed performance at scale** — Full table scan by createdAt. Mitigation: index on (authorProfileId, createdAt) and on createdAt for feed; limit page size; add “following” filter later with a more targeted query.
- **[Risk] mediaAssetIds from another user** — Client could send asset ids they don’t own. Mitigation: strict validation on POST /api/posts: every mediaAssetId must exist, be READY, and have **asset.profileId === activeProfileId** (reject if null or mismatch).
- **[Trade-off] No edit/delete** — Simplifies MVP; add in follow-up with ownership checks.

## Migration Plan

- Add Post and PostMedia (and optionally Hashtag) to Prisma; run migration. No change to existing tables. Deploy: run migration, deploy app. Rollback: revert deploy; optionally add migration to drop new tables if needed.

## Open Questions

- Hashtag: include in this change (model + relation + optional tag input) or defer?
- Feed: MVP = following feed (activeProfile + followed); global = GET /api/explore later.
- publicUrl: public bucket in MVP vs signed GET endpoint if bucket private.
