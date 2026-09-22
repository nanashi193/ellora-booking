# Final Verification Prompt Template

**Purpose:** This template is used by the Verify Agent to conduct a final, strict check after all implementation and review comments have been addressed, right before merging or closing the task.

---

## 1. Acceptance Criteria Check
- Have ALL acceptance criteria defined in the initial Codex prompt been fully met?
- [ ] Yes / [ ] No
- *Notes:* 

## 2. Review Resolution Check
- Have ALL comments and "CHANGES REQUESTED" from the previous `review.md` been successfully addressed?
- [ ] Yes / [ ] No
- *Notes:* 

## 3. Regression Check
- Have verification commands (build, test, lint) run successfully WITHOUT errors?
- Does the application compile and run as expected?
- [ ] Yes / [ ] No
- *Notes:* 

## 4. Documentation Consistency Check
- Do the changes conflict with existing guidelines in `docs/`?
- If the architecture or API changed, is there a flag raised to update the docs?
- [ ] Yes / [ ] No
- *Notes:* 

## 5. Coding Conventions Check
- Are there any leftover debug statements (e.g., `console.log`, `System.out.println`), mock data, or commented-out code?
- [ ] Yes / [ ] No
- *Notes:* 

---
## Final Status
If ALL checks are "Yes", output strictly:
**APPROVED**

If ANY check is "No", output:
**REJECTED** 
Followed by the specific list of remaining issues to fix.