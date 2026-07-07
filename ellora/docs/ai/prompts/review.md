# Code Review Prompt Template

**Purpose:** This template is used by the Review Agent to critically analyze code changes made by an Implementation Agent before they are finalized.

---

Please review the recent diffs/commits against the following criteria. Provide a pass/fail status and actionable feedback for each category.

## 1. Correctness
- Does the code do what the Acceptance Criteria explicitly asked for?
- Are there any edge cases missed (e.g., null pointers, empty arrays)?
- **Status:** [Pass / Fail / N/A]
- **Feedback:** 

## 2. Maintainability
- Does the code follow the "Lazy Senior Dev" rule (shortest working diff, no over-engineering)?
- Are files kept focused and single-responsibility?
- **Status:** [Pass / Fail / N/A]
- **Feedback:** 

## 3. Readability & Coding Conventions
- Are naming conventions consistent with the rest of the codebase?
- Are complex logic blocks well-documented (e.g., `ponytail:` comments)?
- **Status:** [Pass / Fail / N/A]
- **Feedback:** 

## 4. Scalability & Performance
- (Backend) Are there missing DB indexes, N+1 query problems, or concurrency risks (Race conditions)?
- (Frontend) Are heavy operations blocking the main thread or causing memory leaks (e.g., un-unsubscribed RxJS)?
- **Status:** [Pass / Fail / N/A]
- **Feedback:** 

## 5. UX Consistency & Accessibility
- (Frontend) Does the UI match the Ellora design language (`#f7bcd5` CTA, mobile-first)?
- Are semantic HTML tags used? Do images have `alt` tags?
- **Status:** [Pass / Fail / N/A]
- **Feedback:** 

## 6. SSR Compliance
- (Frontend) Are there any direct accesses to Browser APIs (`window`, `document`, `localStorage`) that will break SSR?
- **Status:** [Pass / Fail / N/A]
- **Feedback:** 

## 7. Technical Debt & Regression Risk
- Did this change introduce any commented-out code, "TODOs", or hardcoded mock data?
- Does this change break existing features (Regression)?
- **Status:** [Pass / Fail / N/A]
- **Feedback:** 

## 8. Final Verdict
- **[APPROVED]** / **[CHANGES REQUESTED]**
- Summary of required fixes: