# 2026-07-07 - Hermes/Codex task workflow

**Context:**
The project needs a clear AI collaboration flow so planning, implementation, review, fixes, and verification happen in a consistent order.

**Decision:**
Use Hermes for planning, review, and final verification. Use Codex for implementation and review fixes. Non-trivial tasks must follow:

```text
Task mới -> Hermes docs/ai/prompts/architect.md -> Implementation Plan -> Codex docs/ai/prompts/codex.md -> Implement -> Hermes docs/ai/prompts/review.md -> Review -> Codex Fix -> Hermes docs/ai/prompts/verify.md -> Done
```

**Reason:**
This keeps implementation focused while giving planning and verification explicit owners. It also reduces ad hoc changes and aligns with the project's preference for small, controlled diffs.

**Impact:**
`AGENTS.md` and `docs/ai/workflows.md` now define the required workflow and prompt file paths for future AI-assisted tasks. Trivial one-line changes can skip Hermes planning only when low-risk and called out in the final summary.
