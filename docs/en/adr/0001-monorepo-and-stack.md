# ADR 0001: Monorepo and technology stack

> Date: 2026-10-10 | Status: accepted | Vietnamese: [../../vi/adr/0001-monorepo-and-stack.md](../../vi/adr/0001-monorepo-and-stack.md)

## Context

Lexiscene needs a web app, a REST API, a background worker (transcription pipeline, scoring), and shared logic (schemas, text normalization used by pipeline, dictation and shadowing). One developer, learning-oriented, TypeScript preferred.

## Decision

- **pnpm workspaces monorepo**: `apps/api`, `apps/worker`, `apps/web`, `packages/shared`.
- **NestJS** for API and worker (modular, DI, good for learning backend architecture).
- **MongoDB + Mongoose** (replica set) for flexible, document-shaped content (transcripts, localized maps).
- **Redis + BullMQ** for queues, cache, rate limiting.
- **Next.js (App Router) + next-intl** for the web app.
- **zod schemas in `packages/shared`** as the single source for validation and types; OpenAPI generated from the API to produce the web client.
- Docs in English and Vietnamese (EN is source of truth); AI-tooling files in English.

## Options considered

| Option | Why not (now) |
|---|---|
| Separate repos per app | Shared code and atomic changes become harder |
| PostgreSQL | Strong choice, but transcript/i18n documents fit Mongo well and Mongo is the project's chosen stack |
| Express/Fastify only | Less structure; NestJS teaches architecture patterns that scale |
| Turborepo/Nx from day one | Extra tooling before it is needed; add later if build times hurt |

## Consequences

- Single dependency graph; shared types prevent API/web drift.
- Mongo transactions need a replica set even locally.
- Embedded transcript segments require a segment cap and stable `sid`s.
- Team must keep EN and VI docs in sync (`/docs-sync`).
