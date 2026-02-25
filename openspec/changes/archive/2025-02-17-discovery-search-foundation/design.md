## Context

- **Stack**: Next.js App Router, Prisma, PostgreSQL. Profile, Follow, and Post exist. GET /api/profiles/{handle} exists for public profile; feed uses active profile and Follow for author list. No profile search or follow/unfollow API yet; no public profile page or search page.
- **Current state**: Users can create profiles and posts, but cannot search for profiles, follow them, or view a dedicated profile page; feed is limited to who they already follow.
- **Constraints**: Follow is already (followerProfileId, followingProfileId); actor for follow/unfollow is the session’s **active profile**. Public profile view must stay safe (no private data).

## Goals / Non-Goals

**Goals:**

- **Search**: GET /api/search/profiles?q= returns profiles matching handle or displayName (e.g. contains, case-insensitive); response includes id, handle, displayName, avatarUrl, isFollowing (when authenticated with active profile). Simple limit/pagination for MVP.
- **Follow/unfollow**: POST /api/profiles/{id}/follow and DELETE /api/profiles/{id}/follow using profile id (not handle); require auth and active profile; idempotent (already following → 204); 404 if profile not found, 400 if no active profile.
- **Public profile API**: Extend GET /api/profiles/{handle} to include followerCount, followingCount, isFollowing (when authenticated), and posts (list or summary) so the profile page can render.
- **UI**: /search (input + results), /[handle] profile page (avatar, displayName, follow button, posts), PostCard author links to /{handle}.

**Non-Goals:**

- Full-text search engine (e.g. Elasticsearch). Search by bio or instruments. “Suggested profiles” or discovery algorithm. Pagination depth on search (simple limit is enough for MVP).

## Decisions

1. **Search by handle and displayName**  
   Use Prisma `OR` with `contains` (or `mode: 'insensitive'` where supported) on handle and displayName. Minimum query length (e.g. 2 chars) to avoid huge result sets. Limit (e.g. 20) and optional cursor or offset for MVP. Exclude private profiles from search results (or apply same policy as public profile).

2. **Follow API by profile id**  
   Use `/api/profiles/[id]/follow` with profile **id** (cuid) so the route is stable and we avoid resolving handle→id in the client. Frontend gets profile id from GET /api/profiles/{handle} or from search results. 404 when profile id does not exist; 403 if trying to follow self (when id === activeProfileId).

3. **isFollowing in search and profile response**  
   When the client is authenticated and has an active profile, run a single batched query (e.g. Follow.findMany where followerProfileId = activeProfileId and followingProfileId in [result ids]) and attach isFollowing to each profile. When unauthenticated or no active profile, omit isFollowing or set false.

4. **GET /api/profiles/{handle} extension**  
   Add followerCount and followingCount via Prisma `_count` on Profile’s followers/following relations. Add isFollowing when authenticated (look up Follow for activeProfileId → handle’s profileId). Add posts: reuse existing GET /api/profiles/[handle]/posts or embed a bounded list (e.g. latest N posts with same shape as feed) to keep one round-trip for the profile page. Prefer embedding posts in the same response for MVP to avoid extra request from the profile page.

5. **Profile page route**  
   Use Next.js dynamic segment **/[handle]** (e.g. `src/app/[handle]/page.tsx`) so URLs are `/johndoe` for the profile with handle `johndoe`. Ensure this does not conflict with existing static routes (/, /feed, /search, /messages, etc.); Next.js matches static first, so /search and /[handle] coexist with search at /search and profile at /{handle}.

6. **PostCard author link**  
   PostCard receives author (handle, displayName, avatarUrl); add a Link or button wrapping the author area to `/${author.handle}` so click navigates to the profile page.

## Risks / Trade-offs

- **[Risk] Search performance** — LIKE/contains on large profile table can be slow; add index on handle (already unique) and **@@index([displayName])** on Profile to avoid full table scans. Limit results for MVP.
- **[Trade-off] Profile route vs reserved paths** — Using /[handle] means any unknown path is treated as a profile; return 404 when handle not found. Reserve /search, /feed, /messages, /create-post, etc. via static routes so they take precedence.

## Migration Plan

- No DB migration. Deploy new and updated API routes and new pages; optional feature flag not required for MVP.

7. **Follow response body (optional UX)**  
   POST and DELETE /api/profiles/{id}/follow MAY return a JSON body so the frontend can update UI without refetch: POST → `{ "isFollowing": true }`, DELETE → `{ "isFollowing": false }`. Same status codes (201/204, 204) as before.

8. **Index on displayName (optional, recommended)**  
   Add `@@index([displayName])` to the Prisma Profile model so search by displayName does not do full table scans at scale. Requires a small DB migration.

## Open Questions

- None blocking.
