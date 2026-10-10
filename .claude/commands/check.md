---
description: Run lint, typecheck and tests, then summarize failures by root cause
argument-hint: [workspace filter, e.g. api | web | worker]
allowed-tools: Read, Grep, Glob, Bash(pnpm lint:*), Bash(pnpm typecheck:*), Bash(pnpm test:*), Bash(git status:*), Bash(git diff:*)
---

Scope: $ARGUMENTS (empty = whole repo).

1. Read the "Commands" section of `CLAUDE.md` and root `package.json` scripts. If scripts are still TODO or missing, say so and stop.
2. Run lint, typecheck, test (in that order). Do not run install or build.
3. Group failures by root cause, not by file. For each: where, why it fails, suggested fix (no edits).
4. Report: pass/fail per step, then at most 5 grouped findings, then the single next action.
