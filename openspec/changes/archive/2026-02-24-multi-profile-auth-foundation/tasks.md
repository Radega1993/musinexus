## 1. Prisma and shared client

- [x] 1.1 Add NextAuth adapter models (Session, Account, VerificationToken) to Prisma schema if missing and run migration
- [x] 1.2 Create shared Prisma client module (e.g. src/lib/prisma.ts) for use by NextAuth adapter and API routes (Prisma 7–compatible)
- [x] 1.3 Add bcryptjs (or chosen password hashing lib) and types if needed

## 2. NextAuth configuration

- [x] 2.1 Create NextAuth route handler at src/app/api/auth/[...nextauth]/route.ts
- [x] 2.2 Configure NextAuth with Prisma adapter, database session strategy, and Credentials provider (email/password)
- [x] 2.3 Configure session to expose only user.id (no activeProfileId in session)
- [x] 2.4 Add Google OAuth provider in config (enabled only when env vars are set)

## 3. Auth API

- [x] 3.1 Implement POST /api/auth/register: validate body (email, password min 8), hash password, create User, return 201 with { userId }; 409 if email exists; 400 with application/problem+json for invalid payload

## 4. Profile API — list and create

- [x] 4.1 Implement GET /api/me/profiles: require session, return 200 with { profiles } for profiles where user is ProfileMember; 401 if unauthenticated
- [x] 4.2 Implement POST /api/profiles: require session, validate body (type, handle min 3, displayName min 2), create Profile + ProfileMember (OWNER); return 201 with Profile; 409 if handle exists; 401 if unauthenticated

## 5. Profile API — get and update

- [x] 5.1 Implement GET /api/profiles/[handle]: return 200 with Profile for existing public profile; 404 if not found or inaccessible (e.g. private)
- [x] 5.2 Implement PATCH /api/profiles/id/[profileId]: require session; allow only if user is ProfileMember with OWNER or ADMIN; accept partial UpdateProfileRequest; return 200 with Profile or 403/401

## 6. Active profile

- [x] 6.1 Implement POST /api/me/active-profile: require session; body { profileId }; verify user is ProfileMember of that profile; update User.activeProfileId in DB; return 204 on success; 403 if not member; 401 if unauthenticated
- [x] 6.2 When backend needs active profile, read User.activeProfileId (one query; add caching later if needed)

## 7. Verification and docs

- [x] 7.1 Add or update .env.example with NEXTAUTH_URL, NEXTAUTH_SECRET, DATABASE_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET (optional)
- [X] 7.2 Manually verify register, sign-in, sign-out, list profiles, create profile, get profile, update profile, set active profile per OpenAPI/specs
