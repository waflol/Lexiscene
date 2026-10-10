---
description: Create an Architecture Decision Record in English and Vietnamese
argument-hint: <decision title and short context>
allowed-tools: Read, Grep, Glob, Write, Bash(ls:*)
---

Decision: $ARGUMENTS

1. `ls docs/en/adr` to find the next number (NNNN, zero-padded).
2. Create `docs/en/adr/NNNN-<kebab-title>.md` using the template in `docs/en/adr/0001-monorepo-and-stack.md` (Status, Context, Decision, Options considered, Consequences).
3. Create the mirrored `docs/vi/adr/NNNN-<kebab-title>.md` in Vietnamese.
4. If the developer has not given enough context (options, constraints), ask up to 3 short questions first instead of inventing facts.
5. Suggest which other docs need an update because of this decision (do not edit them).
