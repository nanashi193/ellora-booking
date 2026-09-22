# Architect Prompt Template

**Purpose:** This template is used by the Architect AI Agent to analyze a feature request, assess risks, and generate a concrete implementation plan and prompt for the Implementation Agent (Codex/Claude).

---

## 1. Feature Analysis
- **Requirement:** [Copy/paste or summarize the user requirement here]
- **Core Objective:** [What is the main goal of this feature?]
- **Target Audience:** [Customers / Salon Owners / Admin]

## 2. Context & Documentation Review
- [ ] Read `docs/ai/context.md`
- [ ] Read `docs/architecture-and-stack.md`
- [ ] Read relevant frontend/backend guidelines.

## 3. Impact Assessment
- **Impacted Areas:** [e.g., Database Schema, Frontend Routing, Authentication Flow]
- **Files Likely to be Modified:**
  - `file/path/1`
  - `file/path/2`
- **New Files to be Created:**
  - `file/path/3`

## 4. Risk Analysis & Constraints
- **Technical Risks:** [e.g., Race condition in booking, SSR crash]
- **Business Risks:** [e.g., User confusion if UX changes drastically]
- **Constraints:** [e.g., Must use Angular Signals, Must not add new dependencies, Mobile-first]

## 5. Implementation Plan (Step-by-Step)
1. **[Phase 1 - Database/Backend]:** [Actions] -> *Verify by:* [Verification step]
2. **[Phase 2 - API/Service]:** [Actions] -> *Verify by:* [Verification step]
3. **[Phase 3 - Frontend/UI]:** [Actions] -> *Verify by:* [Verification step]

## 6. Generated Prompt for Implementation Agent
*(Copy the content below and pass it to the Codex/Claude Implementation Agent)*

--- 
**[Codex Prompt Begins Here - Reference `codex.md` template]**