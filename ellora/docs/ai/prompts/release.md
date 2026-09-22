# Release Summary Prompt Template

**Purpose:** This template is used by the Release Agent to generate a clear, structured summary of a release or a major feature completion for stakeholders, developers, and the changelog.

---

## Release Version / Date
**[vX.Y.Z] / [YYYY-MM-DD]**

## 1. Features
*New capabilities introduced in this release.*
- [Feature 1 description and impact]
- [Feature 2 description and impact]

## 2. Bug Fixes
*Issues resolved.*
- Fixed: [Bug description] - [How it was resolved]
- Fixed: [Bug description] - [How it was resolved]

## 3. Technical Improvements
*Under-the-hood changes, refactoring, and optimizations.*
- [e.g., Replaced Mock data with real REST API for Dashboard]
- [e.g., Enabled SSR compatibility for chart components]

## 4. Breaking Changes
*Changes that require dependent services or downstream clients to update.*
- [None / Description of API signature changes, database schema drops, etc.]

## 5. Migration Instructions
*Steps required to deploy this release (e.g., DB migrations, new environment variables).*
- [e.g., Add `NEW_API_KEY` to `.env`]
- [e.g., Run database update script `v1.2.sql`]

## 6. Known Issues / Technical Debt
*Issues we are aware of and will address in future sprints.*
- [e.g., Lack of Unit Tests for the new Booking Service]
- [e.g., Race condition risk still exists in high-concurrency booking]