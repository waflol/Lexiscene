# Development Roadmap - Lexiscene

> Last updated: 2026-10-10 | Status: draft | Vietnamese: [../vi/roadmap.md](../vi/roadmap.md)

Assumption: one developer learning while building, ~10-15 h/week. Durations are rough and shrink as skills grow. The developer writes the code; Claude Code reviews, explains, checks and keeps docs in sync.

## Working agreement (every task)

1. Small branch per task, Conventional Commits.
2. Write code and tests yourself; ask Claude Code `/explain` when stuck.
3. Before a PR: `/check`, then `/review`; fix blockers and majors.
4. Update `docs/en` (then `/docs-sync`) when behavior or design changed. New decision -> `/adr`.

## Phases

| Phase | Weeks | Focus |
|---|---|---|
| 0 | 1-2 | Foundation and tooling |
| 1 | 2 | Auth and profile |
| 2 | 3 | Videos and transcript player (seeded data) |
| 3 | 2-3 | Dictionary and word lookup |
| 4 | 2-3 | Vocabulary and SRS |
| 5 | 2 | Dictation (**MVP complete**) |
| 6 | 4 | Pipeline v1 and admin editor |
| 7 | 3 | Shadowing |
| 8 | 3 | Payments and entitlements |
| 9 | 3 | Hardening and beta launch |
| 10+ | - | More locales, pitch accent, PWA/mobile, Anki import |

### Phase 0 - Foundation (see [getting-started](./getting-started.md))
- Deliver: pnpm monorepo, NestJS and Next.js apps, `packages/shared`, Docker Compose (Mongo replica set + Redis), env validation, lint/format/commit hooks, CI, health endpoints, i18n skeleton (`vi`/`en`).
- Learn: monorepo tooling, NestJS modules/DI, Mongoose connection, Next.js App Router, GitHub Actions.
- Done when: `pnpm dev` runs everything; CI green; `/health/ready` checks Mongo + Redis; web shows a translated page.

### Phase 1 - Auth and profile
- Deliver: register/login/refresh/logout, Google OAuth, email verification and reset, profile with locales and target languages, guards, rate limiting.
- Learn: JWT vs sessions, refresh rotation, password hashing, NestJS guards, httpOnly cookies, CORS.
- Done when: FR-AUTH-01..04 pass; refresh reuse is detected; tests cover auth flows.

### Phase 2 - Videos and transcript player
- Deliver: `videos` and `transcripts` schemas, **seed script with hand-made transcripts** (de-risks UX before the pipeline), list/detail pages, YouTube IFrame player, synced transcript (highlight, seek, auto-scroll), display modes, loop and speed, keyboard shortcuts.
- Learn: IFrame Player API events and drift, Zustand, TanStack Query, Server vs Client Components, ruby/furigana rendering.
- Done when: FR-VID-01..05 pass; sync accuracy within ~200 ms; transcript endpoint cached with ETag.

### Phase 3 - Dictionary and lookup
- Deliver: import scripts for ja and en dictionaries (with license metadata), `dictionary_entries` indexes, lookup popup, Redis cache, attributions page, tokens in seeded transcripts linked to entries.
- Learn: ETL scripts, text indexes, caching strategies, JMdict structure, POS normalization.
- Done when: FR-LOOK-01,02,04 pass; popup < 150 ms cached; 95% content-word coverage on seed videos.

### Phase 4 - Vocabulary and SRS
- Deliver: save-with-context, default decks, FSRS scheduler, review UI (recognition cards), review logs, daily limits.
- Learn: spaced repetition algorithms, due-queue indexes, optimistic UI, time zones for "today".
- Done when: FR-VOC-01..04 pass; scheduler unit-tested against known vectors.

### Phase 5 - Dictation (MVP complete)
- Deliver: shared text utils (`normalize`, `diff`, `toKana`) with fixtures, session/attempt API, dictation UI with hints, diff view, scoring, add missed words to vocabulary.
- Learn: Unicode normalization, diff algorithms, ja vs en comparison rules, keyboard-first UX, IME input handling.
- Done when: FR-DIC-01..04 pass; MVP acceptance in requirements section 7 passes end to end.

### Phase 6 - Pipeline v1 and admin editor
- Deliver: worker app, BullMQ queues, source adapters (`upload` first), ASR adapter, segmentation, tokenizers, dictionary link, MT translation, auto-QA, admin transcript editor, job monitor.
- Learn: queues and idempotency, retries/backoff, object storage, ASR output handling, cost control.
- Done when: an uploaded audio becomes a reviewable transcript; rerun is idempotent; QA flags visible in editor.

### Phase 7 - Shadowing
- Deliver: MediaRecorder capture (Safari/Chrome codec handling), presigned upload, scoring job, compare UI, retention and delete.
- Learn: browser media APIs, presigned URLs, async job UX, privacy by design.
- Done when: FR-SHAD-01,02,03 pass on desktop and mobile browsers.

### Phase 8 - Payments and entitlements
- Deliver: plans, Stripe checkout and portal, verified webhooks, idempotent processing, `EntitlementsService`, feature gating, billing UI. VNPay/MoMo behind the same interface if decided.
- Learn: webhook security, idempotency keys, transactions, subscription lifecycle, test mode and CLI.
- Done when: FR-PAY-01..05 pass; replayed webhooks are harmless; access never granted from client claims.

### Phase 9 - Hardening and beta
- Deliver: security review (OWASP checklist), load test, accessibility audit, backups + restore drill, monitoring/alerts, legal pages, analytics, SEO, deployment (ADR), beta cohort.
- Done when: NFR table in requirements is met or exceptions are documented.

## Milestones

| Milestone | After | Meaning |
|---|---|---|
| M1 Walking skeleton | Phase 0 | Everything runs and deploys locally |
| M2 Watchable | Phase 2 | Seeded video + synced transcript |
| M3 MVP | Phase 5 | Full learning loop for early testers |
| M4 Content engine | Phase 6 | New videos without manual JSON |
| M5 Beta | Phase 9 | Paying users |

## Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Content licensing | Legal/takedown | License field + verification gate; own/partner/CC content; embed-only playback |
| Japanese tokenization quality | Wrong popups | Tokenizer interface, admin token edits, candidates list |
| ASR cost/quality | Budget, bad transcripts | Provider adapter, cost caps, human review, start with small catalog |
| Browser audio differences | Shadowing bugs | Early cross-browser tests in Phase 7, codec negotiation |
| Scope creep | Never ships | MVP at Phase 5; P1/P2 only after M3 |
| Payment mistakes | Money/trust | Webhook-only entitlements, idempotency, test mode, code review focus |
| Solo-developer bandwidth | Delays | Keep phases small; cut P1 items first |
