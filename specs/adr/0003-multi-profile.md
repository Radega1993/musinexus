# ADR 0003: Multi-profile Model

## Status
Accepted

## Context
A single user may manage multiple social entities:
- Artist
- Group
- Institution
- Label

Actions in the product are performed "as a Profile".

## Decision
- User = authentication identity
- Profile = social entity
- ProfileMember = membership + role
- User has activeProfileId (MVP convenience)

## Consequences
- Clear separation between account and public identity
- Supports teams/labels managing profiles
- Slightly more complexity but avoids refactor later