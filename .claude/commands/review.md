---
description: Senior-level code review of uncommitted changes, a branch, or given paths
argument-hint: [path | branch | blank = uncommitted changes]
allowed-tools: Read, Grep, Glob, Bash(git diff:*), Bash(git status:*), Bash(git log:*), Bash(git show:*)
---

Review: $ARGUMENTS
If empty, review `git diff` plus `git diff --staged`. Read-only: do NOT edit files.

Check, in this order:
1. Correctness and edge cases (ja/en text handling, empty/huge input, time zones, ms vs s).
2. Security: authz on every route, input validation, secrets/PII in logs, webhook signature + idempotency, entitlement checks server-side.
3. Data: Mongo indexes for new queries, unbounded arrays, N+1, transaction needs, segments referenced by `sid` not index.
4. i18n: hard-coded user-visible strings, locale fallback.
5. Contract: matches `docs/en/api-design.md` and `docs/en/database-design.md` (open only the sections touched).
6. Tests and readability.

Output exactly per the review format in CLAUDE.md. Finish with "Docs to update:" (files, or "none").
