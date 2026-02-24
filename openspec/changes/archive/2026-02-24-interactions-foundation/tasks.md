## 1. Data layer

- [x] 1.1 Add Like, Comment, and Save models to Prisma schema (unique postId+profileId for Like and Save; Comment with postId, authorProfileId, body, createdAt)
- [x] 1.2 Run Prisma migration for new tables

## 2. Like API

- [x] 2.1 Implement POST /api/posts/[id]/like (auth, active profile, 404 if post missing, idempotent 201/204)
- [x] 2.2 Implement DELETE /api/posts/[id]/like (auth, 404 if post missing)

## 3. Save API

- [x] 3.1 Implement POST /api/posts/[id]/save (auth, active profile, 404 if post missing, idempotent)
- [x] 3.2 Implement DELETE /api/posts/[id]/save (auth, 404 if post missing)

## 4. Comments API

- [x] 4.1 Implement GET /api/posts/[id]/comments (paginated, cursor, newest first, limit default 20 max 50, nextCursor)
- [x] 4.2 Implement POST /api/posts/[id]/comments (body validation non-empty and max 2000 chars, active profile, 400/404, authorProfileId = active profile)

## 5. Post responses with interaction data

- [x] 5.1 Add likeCount, saveCount, commentCount to all post responses; add likedByMe, savedByMe only when authenticated with active profile. Feed: 1 query posts with _count, 1 query actor likes for page post ids, 1 query actor saves for page post ids.

## 6. UI

- [x] 6.1 PostCard: like and save buttons with counts; wire to like/save APIs
- [x] 6.2 Comments drawer or modal: list comments (GET) and submit form (POST) for the post
