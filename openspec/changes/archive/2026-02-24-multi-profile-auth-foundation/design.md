## Context

- **Stack**: Next.js 16 App Router (monolith), PostgreSQL, Prisma 7, NextAuth (ADR-0001). Multi-profile model is decided: User = identity, Profile = social entity, ProfileMember = membership (ADR-0003).
- **Current state**: Prisma schema exists (User, Profile, ProfileMember, Follow, Block, Mute) with `User.activeProfileId`. OpenAPI specs define Auth (`/api/auth/register`, login via NextAuth) and Profiles (`/api/me/profiles`, create, get, update, set active). No auth or profile API routes exist yet.
- **Constraints**: Use existing schema and OpenAPI contracts; no new infra; session must work with server components and API routes.

## Goals / Non-Goals

**Goals:**

- Implement NextAuth with Prisma adapter: Credentials (email/password) and Google OAuth, session persisted in DB.
- Implement custom register route (`POST /api/auth/register`) that creates User + hashed password and returns `userId`; login remains NextAuth signIn.
- Implement profile API per spec: list/create/get/update for current user's profiles, plus set active profile; all require authenticated session.
- Store active profile in User.activeProfileId (DB); session only carries userId. Backend resolves "current profile" via User when needed (one simple query; can cache later).
- Single Prisma client usage (adapter + route handlers) compatible with Prisma 7 (config in `prisma.config.ts`, client with adapter if required).

**Non-Goals:**

- Password reset, email verification, or MFA.
- Profile discovery, search, or public profile pages.
- Social graph actions (follow/block/mute) implementation.
- Changing OpenAPI or Prisma schema.

## Decisions

1. **Session strategy: database sessions, active profile in DB**
   - Use NextAuth's database session (Prisma adapter). Session carries only user identity (userId). **Active profile is stored in User.activeProfileId (DB), not in the session.** POST /api/me/active-profile updates User.activeProfileId. When the backend needs "current profile", it reads User.activeProfileId (one query; can cache later). This keeps MVP simple and avoids session callbacks/update/staleness.

2. **Register vs NextAuth Credentials**
   - **Decision**: Custom `POST /api/auth/register` that creates `User` with hashed password (e.g. bcrypt or built-in), then client can call `signIn("credentials", { email, password })` so login flow stays in NextAuth. No "magic link" or separate login route; sign-in is NextAuth's signIn.
   - **Rationale**: OpenAPI specifies a register endpoint; NextAuth Credentials provider handles login; keeps one source of truth for "logged-in user" (session table).

3. **Password hashing**
   - Use a dedicated library (e.g. `bcryptjs` or Node's `crypto.scrypt`) in the register handler. Store only the hash in `User.passwordHash`. Do not store plaintext; do not use a weak algorithm.
   - **Choice**: Prefer `bcryptjs` (or `argon2` if we add it) for register; align with common NextAuth examples.

4. **API route layout** (aligned with OpenAPI)
   - Auth: `src/app/api/auth/register/route.ts` (POST). NextAuth: `src/app/api/auth/[...nextauth]/route.ts` (covers signin, callback, session, etc.).
   - Profiles: GET list → `src/app/api/me/profiles/route.ts` (GET only). POST create → `src/app/api/profiles/route.ts` (POST only). GET by handle → `src/app/api/profiles/[handle]/route.ts`. PATCH update → `src/app/api/profiles/id/[profileId]/route.ts`. Set active → `src/app/api/me/active-profile/route.ts` (POST). No POST on /api/me/profiles.

5. **Active profile in DB (User.activeProfileId)**
   - On "set active profile" (POST /api/me/active-profile), verify the user is a member of that profile (ProfileMember), then update **User.activeProfileId** in the database. Session does not store activeProfileId; only user.id is in session. When the app needs the active profile, it reads User.activeProfileId (e.g. in API or server components); one simple query, cache later if needed.

6. **Prisma client usage**
   - Single shared Prisma client instance (e.g. `src/lib/prisma.ts` or similar) used by NextAuth adapter and all API routes. Use Prisma 7's recommended pattern (adapter or config) so that Migrate and runtime both work; avoid creating a new client per request.

7. **Authorization in profile routes**
   - List profiles: return only profiles where the current user has a ProfileMember row. Create: add ProfileMember with role OWNER. Get/Update: allow only if current user is a member of that profile (any role). Set active: allow only if member. Use session `user.id` for all checks.

## Risks / Trade-offs

- **[Risk] Prisma 7 adapter** — NextAuth's Prisma adapter may expect a classic client. Mitigation: follow Prisma 7 migration guide (adapter for runtime); test migrate + generate + login/register early.
- **[Risk] Extra query for active profile** — Reading User.activeProfileId when needed adds one query per request that needs it. Mitigation: acceptable for MVP; add short-lived cache later if needed.

## Migration Plan

- Run existing Prisma migrations so DB has User, Profile, ProfileMember, Session, Account (NextAuth tables from adapter). No schema change in this change.
- Deploy order: (1) deploy app with new routes and NextAuth config, (2) ensure env (e.g. `NEXTAUTH_SECRET`, `DATABASE_URL`, Google OAuth if used) is set. No rollback of schema; feature flag not required for MVP.

## Open Questions

- **Google OAuth**: Whether to enable in this slice or immediately after (env and provider config). Decision: implement provider config; enable only if client ID/secret are set.
- **Handle uniqueness**: OpenAPI and schema require profile `handle` unique. On create, return 409 if handle exists; no need for slugification in this change.
