## Why

Posts need basic engagement so users can react (like), discuss (comments), and keep content for later (save). The posts foundation is in place; this change adds the minimal interaction layer (MVP) so the feed feels alive and users can express preference and participate.

## What Changes

- **DB**: New models **Like** (post + profile, unique per post/profile), **Comment** (post, author profile, body, createdAt), **Save** (post + profile, unique per post/profile). Optional **Repost** deferred or included in MVP scope.
- **API**:
  - **POST /api/posts/{id}/like** — toggle or add like; **DELETE /api/posts/{id}/like** — remove like; response or list endpoints include like count and whether current profile liked.
  - **POST /api/posts/{id}/save** — add save; **DELETE /api/posts/{id}/save** — remove save; counts and “saved” state for current profile.
  - **GET /api/posts/{id}/comments** — list comments (paginated); **POST /api/posts/{id}/comments** — create comment (body); validation and ownership (active profile).
- **UI**: Like and save buttons on PostCard with counts; simple comments drawer or modal (list + post form). Minimal styling; no rich comment UI in this slice.

## Capabilities

### New Capabilities

- **post-interactions**: Like, comment, and save on posts; APIs for like (POST/DELETE), save (POST/DELETE), comments (GET, POST); validation and counts; ownership by active profile where applicable.

### Modified Capabilities

- (None. Posts capability remains unchanged at requirement level; interactions are additive.)

## Impact

- **Code**: New Prisma models (Like, Comment, Save); API routes under `src/app/api/posts/[id]/` (like, save, comments); validation and count helpers; PostCard updates (like/save buttons, counts, comments drawer/modal).
- **APIs**: New endpoints as above; list/feed responses may include like/save counts and “liked”/“saved” flags for current profile.
- **Dependencies**: None new; builds on Post and Profile.
- **Systems**: PostgreSQL (new tables); no new external systems.
