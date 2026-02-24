## Why

MusiNexus needs a working auth and multi-profile foundation so that users can sign up, sign in, and act as one of their profiles (artist, group, label, or institution). The data model and API contracts already exist (Prisma schema, OpenAPI specs); this change implements the first slice of auth and profile behavior so the rest of the product can build on it.

## What Changes

- Implement authentication: registration (email/password), login, and session handling via NextAuth with Prisma adapter (Credentials + Google as per ADR-0001).
- Implement multi-profile foundation: after login, a user can create and manage profiles; one profile is selectable as “active” for the session (User.activeProfileId).
- Expose and consume the existing Auth and Profiles API surfaces (specs/openapi/auth.yaml, specs/openapi/profiles.yaml) so that the app and future clients use a single contract.
- No schema or API contract changes in this change; implementation only.

## Capabilities

### New Capabilities

- `auth`: User registration (email/password), login, logout, session persistence, and optional Google OAuth. Covers NextAuth configuration, Prisma adapter, and route handlers aligned with the Auth OpenAPI spec.
- `profiles`: Profile CRUD, membership (ProfileMember), and active-profile selection. Covers API routes and session behavior for “acting as” a profile, aligned with the Profiles OpenAPI spec.

### Modified Capabilities

- None. This change implements existing contracts (OpenAPI + Prisma schema); no requirement-level changes to those specs.

## Impact

- **Code**: New or updated NextAuth config and API route handlers under `src/app/api/` (auth and profiles). Possible shared lib for Prisma client and session helpers.
- **APIs**: Auth endpoints (e.g. register, session) and profile endpoints (list, create, get, update, set active) as defined in `specs/openapi/auth.yaml` and `specs/openapi/profiles.yaml`.
- **Dependencies**: NextAuth, @auth/prisma-adapter, Prisma client (already in package.json).
- **Systems**: PostgreSQL (existing), session store via Prisma; no new infrastructure.
