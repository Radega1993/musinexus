## Context

- **Stack**: Next.js App Router, Prisma, PostgreSQL. Post and Profile exist; feed and PostCard are implemented. No Like, Comment, or Save models yet.
- **Current state**: No interaction APIs or UI; posts are read-only from an engagement perspective.
- **Constraints**: Interactions are scoped by **profile** (the actor is the session's active profile). Counts must be cheap enough for list/feed (denormalized count or indexed count).

## Goals / Non-Goals

**Goals:**

- **Like**: One like per profile per post; POST to add (idempotent if already liked), DELETE to remove. Expose like count and “liked by current profile” in post responses (feed, single post).
- **Save**: One save per profile per post; POST to add, DELETE to remove. Expose save count and “saved by current profile” where relevant (e.g. single post or “saved” list later).
- **Comment**: Author = profile (authorProfileId); body (text); POST create (active profile), GET list paginated (cursor + limit). Include comment count on post when useful.
- **API**: POST/DELETE `/api/posts/{id}/like`, POST/DELETE `/api/posts/{id}/save`, GET and POST `/api/posts/{id}/comments`. Validation (post exists, active profile for mutations).
- **UI**: Like and save buttons on PostCard with counts; simple comments drawer or modal (list + submit form). No nested replies or rich comment UI in this change.

**Non-Goals:**

- **Repost**: out of scope for this change; defer to a future `repost-foundation` change if needed. Edit/delete comment. Notifications. “Saved” feed or dedicated saved list in this slice.

## Decisions

1. **Like and Save as unique (postId, profileId)**  
   One row per profile per post for Like and for Save. Unique constraint on (postId, profileId) so POST is idempotent and DELETE is straightforward. Actor = profile (session’s active profile); no “user” on the row to keep model consistent with “post as profile.”

2. **Comment author = profile**  
   Comment has authorProfileId (required) → Profile. Created with session’s active profile; 400 if no active profile. Same pattern as Post authorship.

3. **Like: POST = add, DELETE = remove**  
   POST /api/posts/{id}/like adds a like (201 or 204 if already liked); DELETE removes. No “toggle” in the API to keep semantics clear; client can toggle by calling POST or DELETE based on current state.

4. **Counts and “liked”/“saved” in responses**  
   Include `likeCount`, `saveCount`, `commentCount` in all post responses (feed, single post, profile posts). Include `likedByMe`, `savedByMe` only when the client is authenticated and has an active profile. Implementation for feed: (1) one query for posts with Prisma `_count` for likes/saves/comments; (2) one query for the current profile's likes on those post ids; (3) one query for the current profile's saves on those post ids. No N+1.

5. **Comments pagination**  
   GET /api/posts/{id}/comments: cursor-based (e.g. by createdAt + id), limit (default 20, max 50), response includes `nextCursor`. Order: oldest first for “thread” feel, or newest first; MVP choice: **newest first** so recent activity is visible at top.

6. **Comment body validation**  
   Non-empty string, max length (e.g. 2000 chars) to avoid abuse. 400 with problem detail if invalid.

## Risks / Trade-offs

- **[Risk] Counts on feed N+1 or heavy** — If we add likeCount/saveCount/likedByMe/savedByMe to every post in feed, we need efficient counts (e.g. Prisma `_count` or raw count) and a single “my likes/saves” lookup for the current profile. Mitigation: use `_count` and a batched “ids I liked/saved” for the page.
- **[Risk] Comment spam** — Mitigation: rate limit in a later iteration; for MVP rely on body length and auth.
- **[Trade-off] No edit/delete comment** — Simplifies MVP; add later with ownership check.

## Migration Plan

- Add Like, Comment, Save to Prisma (no Repost); run migration. No change to existing tables. Deploy: run migration, deploy app. Rollback: revert deploy; optional migration to drop new tables later.

## Open Questions

- (Resolved) Repost: out of scope; feed: counts + flags when auth/active profile, implemented with 3 queries + _count.
