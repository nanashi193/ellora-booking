# Merge Dev-Thinh features while retaining dev

Base: dev de8d2c9. Source: Dev-Thinh 786905e. The user requested that dev remain the UI/route base and only new features be integrated. The previous dev integration already includes 5e03202 and 4721ab6 features. This merge records both histories but applies the feature delta after 4721ab6 rather than replacing dev pages.

## Plan and scope

1. Keep dev home, search, salon cards, authentication guards, backend URL, settings routes, owner calendar and page styles.
2. Add source booking reviews, single owner replies/moderation, photo removal/admin controls, email queue, booking alarm, revenue and billing/QR widgets. Preserve dev customerName API field.
3. Copy missing dependency files from the original working directory into this isolated worktree. Do not modify or commit the original working directory. Place reviews in the active /setting/my-bookings page.
4. Verify Angular production build, focused frontend regression tests, Maven tests, review changes and Git ancestry.

## Integration decisions

Owner calendar mapping remains intact; new status actions follow CONFIRMED -> IN_PROGRESS -> COMPLETED. An expandable action list also exposes bookings outside the current day and short calendar cards. Notifications retain dev calendar data; polling and audio stop on leaving owner layout and reject stale responses after restarting. Source admin/content and admin/billing routes are role-guarded.

## Runtime prerequisites

Run backend resources/db/booking-emails.sql then resources/db/revenue.sql on the deployment database before enabling the new features; revenue.sql seeds billing settings id=1. No live database was changed. Mail remains disabled unless MAIL_ENABLED is configured. See backend BOOKING-NOTIFICATIONS.md and REVENUE-BILLING.md. Unit tests mock SMTP, Cloudinary and database repositories; they do not verify live PostgreSQL revenue queries or external delivery.

## Review and verification

A separate agent performed planning and review using the repository architect/review/verify criteria. No actual Hermes runtime was available. Review fixes include notification generation guards and touch/keyboard-accessible booking actions. Verification results are recorded in the merge task response.
