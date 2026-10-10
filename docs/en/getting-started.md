# Getting Started (manual setup checklist) - Lexiscene

> Last updated: 2026-10-10 | Status: draft | Vietnamese: [../vi/getting-started.md](../vi/getting-started.md)

Claude Code created only docs and `.claude/` config. **You** set up the codebase by hand to learn. Commands below are references; read the official docs for each tool and adapt versions.

## 0. Prerequisites

- [ ] Git, Node.js LTS (via fnm or nvm), pnpm (`corepack enable`)
- [ ] Docker Desktop (or Docker Engine + Compose)
- [ ] VS Code (or any editor) with ESLint, Prettier, MongoDB extensions
- [ ] Claude Code installed; open it in the repo root so it reads `CLAUDE.md`

## 1. Repository

- [ ] `git init` and make the first commit with the scaffold (docs + `.claude/` + `CLAUDE.md`)
- [ ] Create a remote repo and push; protect `main`; work in branches

## 2. Monorepo skeleton

- [ ] Root `package.json` (private), `pnpm-workspace.yaml` with `apps/*` and `packages/*`
- [ ] `tsconfig.base.json` with `strict: true`
- [ ] Decide a task runner (plain pnpm scripts first; Turborepo/Nx only if you need caching)

## 3. API (apps/api)

- [ ] Generate with the official Nest CLI inside `apps/` (name `api`), remove the nested `.git` if created
- [ ] Add config module with zod-validated env (fail fast)
- [ ] Add Mongoose connection; add Swagger/OpenAPI; add `GET /health` and `/health/ready`
- [ ] Global validation pipe + problem+json exception filter (see [api-design](./api-design.md))

## 4. Web (apps/web)

- [ ] Create with `create-next-app` (TypeScript, App Router, Tailwind, ESLint) inside `apps/`
- [ ] Add `next-intl` with `app/[locale]` and `messages/vi.json`, `messages/en.json`
- [ ] Add one page that calls the API health endpoint

## 5. Shared package (packages/shared)

- [ ] TypeScript package, built or consumed via workspace path
- [ ] Add first zod schema + one text util (e.g. `normalizeText`) with a test

## 6. Local infrastructure

- [ ] `docker-compose.yml`: MongoDB as a **single-node replica set** (needed for transactions) and Redis
- [ ] `.env.example` committed; real `.env` ignored by git
- [ ] Verify the API connects to both

## 7. Quality gates

- [ ] ESLint + Prettier shared config; `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` scripts at root
- [ ] Husky + lint-staged + commitlint (Conventional Commits)
- [ ] GitHub Actions: install, lint, typecheck, test on PR

## 8. Wire up Claude Code

- [ ] Fill the **Commands** section in `CLAUDE.md` with your real scripts
- [ ] Try `/check`, then `/review` on your first PR
- [ ] Adjust `.claude/settings.json` allow/deny lists to match your tools

## Done when

- `pnpm dev` starts API, web (and worker later) together
- `GET /health/ready` is green with Mongo and Redis
- Web renders in `vi` and `en` and shows API health
- CI is green on a pull request
- First ADR ([0001](./adr/0001-monorepo-and-stack.md)) matches what you built, or you wrote a new ADR for deviations

## Tips for working with Claude Code as a mentor

- Ask "why" and "what are the trade-offs", not just "how".
- Paste errors with the command you ran; ask for the root cause explanation before the fix.
- Ask for code only when you want it: say "write it for me" explicitly.
- After each phase in the [roadmap](./roadmap.md), ask for a review of the whole module against the docs.
