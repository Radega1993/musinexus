## 1. Profile search API

- [x] 1.0 Add @@index([displayName]) to Prisma Profile model and run migration (optional, recommended for search performance)
- [x] 1.1 Add GET /api/search/profiles route with q param; validate min length (e.g. 2), return 400 or empty; Prisma findMany with OR contains (handle, displayName) case-insensitive, limit (e.g. 20)
- [x] 1.2 When authenticated with active profile, batch-query Follow for result ids and attach isFollowing to each profile in response; response shape: id, handle, displayName, avatarUrl, isFollowing

## 2. Follow / unfollow API

- [x] 2.1 Add POST /api/profiles/[id]/follow: require auth and active profile (401/400); 403 if id === activeProfileId; 404 if profile not found; create Follow idempotently, return 201 or 204; optional body `{ "isFollowing": true }` to avoid frontend refetch
- [x] 2.2 Add DELETE /api/profiles/[id]/follow: require auth and active profile (401/400); 404 if profile not found; delete Follow idempotently, return 204; optional body `{ "isFollowing": false }` to avoid frontend refetch

## 3. Extend GET profile by handle

- [x] 3.1 Extend GET /api/profiles/[handle] with followerCount and followingCount via Prisma _count on followers/following relations
- [x] 3.2 Add isFollowing to response when authenticated (look up Follow for activeProfileId → profile id)
- [x] 3.3 Embed posts in same response (e.g. latest N with same shape as feed) for profile page

## 4. Search page UI

- [x] 4.1 Add /search page with search input and debounced or submit-triggered GET /api/search/profiles?q=
- [x] 4.2 Render results list (avatar, handle, displayName, link to profile); show empty state when no results or short query

## 5. Profile page UI

- [x] 5.1 Add /[handle] dynamic route; fetch GET /api/profiles/{handle}; show 404 when handle not found
- [x] 5.2 Render profile header (avatar, displayName, followerCount, followingCount) and follow/unfollow button (when authenticated, hide for own profile)
- [x] 5.3 Render profile posts (grid or list) using embedded posts from API

## 6. PostCard author link

- [x] 6.1 In PostCard, add Link (or clickable area) from author (handle, displayName, avatar) to /{handle}
