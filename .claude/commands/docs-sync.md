---
description: Sync Vietnamese docs with English docs (EN is source of truth)
argument-hint: [doc name, e.g. api-design | blank = all docs changed vs VI]
allowed-tools: Read, Grep, Glob, Edit, Write, Bash(git diff:*), Bash(git log:*)
---

Sync target: $ARGUMENTS

1. Compare `Last updated` and headings of `docs/en/<f>.md` vs `docs/vi/<f>.md` (all docs if no argument). Use `git log`/`git diff` to find what changed in EN.
2. Update only the stale parts of the VI file. Keep identical heading order and anchors, tables, and code blocks.
3. Keep code, endpoint paths, field names, library names and well-known technical terms in English; write the prose in natural Vietnamese.
4. Bump `Last updated` in the VI header to match EN.
5. Report: files synced, files already in sync, anything in EN that is ambiguous and needs the developer's decision.

Never change EN docs in this command.
