---
description: Explain code or a concept like a senior mentor (why, trade-offs, pitfalls)
argument-hint: <file[:lines] | concept>
allowed-tools: Read, Grep, Glob
---

Explain: $ARGUMENTS

Structure (keep it short, skip empty parts):
1. What it is, in 2-3 sentences.
2. Why it exists / why this approach here (tie to a section of `docs/en/*` if relevant).
3. How it works, step by step. Small snippet (<20 lines) only if it clarifies.
4. Trade-offs and common pitfalls.
5. One small exercise the developer can do by hand.

Do not modify files. Answer in the developer's language.
