# ADR 0002: Database = PostgreSQL

## Status
Accepted

## Context
We need strong relationships:
- user -> profiles -> follows
- future: posts, likes, comments, DMs

## Decision
Use PostgreSQL with Prisma.

## Consequences
- Referential integrity and unique constraints
- Efficient queries for feed/search later