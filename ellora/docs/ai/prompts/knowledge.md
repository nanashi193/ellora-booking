# Knowledge Update Proposal Prompt Template

**Purpose:** This template is used to evaluate if a newly merged feature requires updates to the project's core documentation. The agent will propose changes, not apply them directly.

---

## 1. Feature Summary
- **Feature Name/Commit:** [Name or ID]
- **Core Change:** [Brief description of what was added/changed]

## 2. Documentation Impact Assessment

Review the following core documents and determine if they require updates based on this feature:

### A. `docs/ai/context.md`
- **Does the "Current Development Focus" or "Known Project Priorities" need to change?**
- *Proposal:* [None / Describe specific changes needed]

### B. `docs/ai/conventions.md`
- **Did this feature introduce a new working pattern, UI convention, or strict rule that future AI agents must follow?**
- *Proposal:* [None / Describe specific changes needed]

### C. `docs/decisions/` (ADR - Architecture Decision Records)
- **Did this feature involve a major architectural, technical, or design decision?** (e.g., Switching from mock data to real API, introducing a caching layer)
- *Proposal:* [None / Create new decision log with Title: XXX]

### D. `README.md`
- **Did the local setup process, environment variables, or run commands change?**
- *Proposal:* [None / Describe specific changes needed]

### E. Architecture Docs (`docs/architecture-and-stack.md`, API/DB guidelines)
- **Were there changes to the tech stack, database schema, or core API routing conventions?**
- *Proposal:* [None / Describe specific changes needed]

---
## 3. Recommended Action
- [ ] No documentation updates required.
- [ ] Create tasks/prompts to update the identified documents based on the proposals above.