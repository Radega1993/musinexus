# ADR 0001: MVP Architecture

## Status
Accepted

## Context
We need to ship an MVP fast with:
- Next.js App Router
- API in Route Handlers
- Multi-profile (artist/group/label/institution)
- Docker-based local + VPS deployment

## Decision
- Next.js App Router as monolith: UI + API Route Handlers
- Postgres as primary DB
- Prisma as ORM/migrations
- NextAuth for authentication (Credentials + Google)
- Media stored in S3-compatible (DigitalOcean Spaces), metadata in Postgres

## Consequences
- Faster iteration, fewer repos/services
- Clear path to extract workers/services later if needed