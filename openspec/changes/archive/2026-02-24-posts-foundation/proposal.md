## Why

Profiles need to publish content and users need to see a chronological feed. Media upload is already in place (MediaAsset); this change adds posts as the unit of content, attached media, and the minimal APIs and UI to create posts and consume a feed.

## What Changes

- **Post model**: Author is the active profile; body (optional caption, Instagram-like); optional hashtags. Stored in Postgres with relation to Profile.
- **PostMedia (join)**: Links Post to MediaAsset; **mediaAssetIds** obligatory (minimum 1); creation MUST validate each asset has profileId = activeProfileId (no cross-profile reuse).
- **Optional Hashtag**: Model and relation if included in MVP scope.
- **API**:
  - **POST /api/posts**: Authenticated; create post as session’s active profile; body optional (caption); **mediaAssetIds** required (array, min 1); validate each asset exists, READY, and asset.profileId === activeProfileId (400 if profileId null or mismatch).
  - **GET /api/feed**: Posts from session's active profile plus posts from profiles that active profile follows; chronological; paginated. (Global → GET /api/explore later.)
  - **GET /api/profiles/{handle}/posts**: List posts by profile handle; paginated.
  - List/feed responses include **media** with **publicUrl** (id, mimeType, key, publicUrl) so UI can render without extra round-trips.
- **Minimal UI**:
  - **/feed**: Feed page (uses GET /api/feed).
  - **/create-post**: Post creation form (optional caption + mediaAssetIds, min 1); uses POST /api/posts.
  - **PostCard** component to render a single post (caption + attached media via publicUrl).

## Capabilities

### New Capabilities

- **posts**: Create posts as the active profile; optional body (caption); **mediaAssetIds** required (min 1), ownership by profileId only; following feed (activeProfile + followed profiles); profile-scoped listing; API responses include media with publicUrl; minimal feed and create-post UI and PostCard.

### Modified Capabilities

- (None. Auth and profiles remain unchanged at spec level.)

## Impact

- **Code**: New Prisma models (Post, PostMedia; optional Hashtag); API routes under `src/app/api/posts/` and feed/profile endpoints; pages /feed, /create-post; PostCard component.
- **APIs**: New endpoints POST /api/posts (body optional, mediaAssetIds min 1), GET /api/feed (following feed), GET /api/profiles/{handle}/posts; list/create responses include media with publicUrl.
- **Dependencies**: None new; builds on existing MediaAsset and Profile.
- **Systems**: PostgreSQL (new tables); no new external systems.
