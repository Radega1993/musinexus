## 1. Schema and migration

- [x] 1.1 Add Post model to Prisma schema: id (cuid), authorProfileId (required, relation to Profile), body (String?, optional caption), createdAt, updatedAt; add PostMedia model: postId, mediaAssetId, order (Int?); relations Post ↔ Profile, Post ↔ MediaAsset via PostMedia; indexes on Post (authorProfileId, createdAt) for feed and listing
- [x] 1.2 Run Prisma migration for Post and PostMedia

## 2. Create post API

- [x] 2.1 Add validation helper for mediaAssetIds: require min 1; for each id verify MediaAsset exists, status READY, and asset.profileId === activeProfileId (400 if profileId null or mismatch); return 400 problem detail if any check fails
- [x] 2.2 Implement POST /api/posts: require session; require active profile (400 if missing); parse body (body optional, mediaAssetIds required min 1); validate mediaAssetIds; create Post and PostMedia records (order from array index); return 201 with post data including media (id, mimeType, key, publicUrl); 401 if unauthenticated; 400 with application/problem+json for invalid payload or validation failure

## 3. Feed API

- [x] 3.1 Implement GET /api/feed: require active profile (400 or empty if none); return posts from active profile plus posts from profiles that active profile follows; chronological (newest first); support limit (default 20, max 50) and cursor; response includes posts with author profile summary and media (id, mimeType, key, publicUrl) and nextCursor when more results exist

## 4. Profile posts API

- [x] 4.1 Implement GET /api/profiles/{handle}/posts: resolve profile by handle; return 404 if not found; return posts by that profile (public only), chronological, with limit and cursor; include author and media (id, mimeType, key, publicUrl) in response

## 5. Minimal UI

- [x] 5.1 Create PostCard component: accepts post data (id, body/caption, createdAt, author handle/displayName/avatarUrl, media with publicUrl); render caption and attached media using publicUrl
- [x] 5.2 Add /feed page: fetch GET /api/feed with pagination (requires active profile); render list of PostCards
- [x] 5.3 Add /create-post page: form with optional caption (body) and mediaAssetIds (min 1, from prior upload flow); submit via POST /api/posts; redirect or show success
