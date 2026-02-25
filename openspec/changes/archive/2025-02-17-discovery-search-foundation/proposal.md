## Why

Users need to find profiles (artists, etc.) and follow them so the feed becomes useful; without search and discovery the app stays functional but not truly usable. This change adds a search-and-discovery MVP: profile search, follow/unfollow, and public profile page so users can search, view profiles, follow, and fill their feed.

## What Changes

- **DB**: No migration; Follow model already exists.
- **API**:
  - **GET /api/search/profiles?q=** — Search profiles by handle or displayName; returns list with id, handle, displayName, avatarUrl, isFollowing (for current profile when authenticated).
  - **POST /api/profiles/{id}/follow** — Follow a profile (authenticated, active profile); idempotent.
  - **DELETE /api/profiles/{id}/follow** — Unfollow a profile (authenticated, active profile).
  - **GET /api/profiles/{handle}** — Public profile view extended to include followerCount, followingCount, isFollowing (when authenticated), and posts (or reference to posts).
- **UI**:
  - **/search** — Search page: input and results list (profiles).
  - **/{handle}** — Profile page: avatar, displayName, follow button, posts grid or list.
  - **PostCard** — Author click navigates to that profile’s page (/{handle}).

## Capabilities

### New Capabilities

- **profile-search**: GET /api/search/profiles?q=; search by handle/displayName; response includes profiles with isFollowing when authenticated.
- **profile-follow**: POST and DELETE /api/profiles/{id}/follow (follow/unfollow by active profile); behavior and error handling.

### Modified Capabilities

- **profiles**: Extend GET /api/profiles/{handle} to include followerCount, followingCount, isFollowing (when authenticated), and posts (or posts summary) for the public profile view.

## Impact

- **Code**: New route GET /api/search/profiles; new routes POST/DELETE /api/profiles/[id]/follow; extend GET /api/profiles/[handle] (and possibly a shared profile-response helper). New pages /search and /[handle] (profile); PostCard author link to /{handle}.
- **APIs**: New and extended endpoints as above.
- **Dependencies**: Builds on Profile, Follow, Post; no new external systems.
- **Systems**: No new infrastructure; existing PostgreSQL.
