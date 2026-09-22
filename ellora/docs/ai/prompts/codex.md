# Codex Implementation Prompt Template

**Purpose:** This template provides strict, isolated instructions for the Implementation AI Agent (Codex/Claude Code) to execute a specific task based on the Architect's plan.

---

## 1. Objective
[Clearly state the specific task to be implemented in 1-2 sentences]

## 2. Context
[Provide necessary background info, e.g., "We are adding a POST endpoint for Booking based on the Ellora MVP scope."]

## 3. Constraints & Conventions
- Must adhere strictly to `docs/ai/conventions.md`.
- No new third-party dependencies unless explicitly approved.
- **Frontend:** Mobile-first, strict SSR compliance (no direct `window/document` access in init).
- **Backend:** Layered architecture, DTOs required, no exposed entities.
- Do not refactor unrelated code. Follow the "Lazy Senior Dev" mindset.

## 4. Acceptance Criteria
- [ ] Criterion 1 (e.g., API returns 201 Created with DTO)
- [ ] Criterion 2 (e.g., UI component renders correctly on mobile width)
- [ ] Criterion 3 (e.g., No linting errors or broken tests)

## 5. Scope of Work
**Files to Modify:**
- `path/to/file1.ts`
- `path/to/file2.java`

**Files to Create:**
- `path/to/new_file.ts`

**Files STRICTLY NOT to Modify:**
- `path/to/config/do-not-touch.yml`

## 6. Required Commands (Verification)
Run these commands before declaring the task complete:
- `[Command to build frontend, e.g., npm run build]`
- `[Command to build backend, e.g., ./mvnw clean compile]`
- `[Command to run specific tests]`

## 7. Output Format
- Apply changes using the `patch` or `write_file` tool.
- Provide a brief summary of the changes made.
- Report the output of the verification commands. If a command fails, fix the code, do NOT hallucinate a successful output.