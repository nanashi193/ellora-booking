# Security checklist before public release

This checklist records what the application code enforces and what still needs an AWS/deployment setting. Complete the **Before public release** items before opening the site to the public.

| # | Check | Current status |
|---|---|---|
| 1 | Password storage | The app does not store passwords; Cognito owns authentication. Do not add a second password database. Verify the User Pool password policy and keep the app client on Cognito's recommended SRP flow. Cognito does not expose a configurable Argon2/bcrypt choice for this app to set. |
| 2 | Login rate limit | Cognito's built-in failed-password lockout applies after five failed attempts and increases the lockout duration. The user has accepted this built-in behavior in place of the earlier 3-per-minute requirement. |
| 3 | Session expiry/logout | Backend validates JWT issuer, signature, access-token type, client and expiry. Logout now records a SHA-256 token hash server-side and calls Cognito global sign-out; the old access token is rejected by this API. **Verify User Pool access/refresh token lifetimes and app-client token revocation in AWS.** |
| 4 | Debug logging | Application package logging is INFO; identity and request-specific values were removed from service logs. Avoid enabling DEBUG/SQL bind logging in production. |
| 5 | Frontend secrets | No secret credentials are embedded in frontend source. Cognito pool/client identifiers and API URLs are public configuration, not secrets. Keep AWS credentials, database credentials, mail passwords and Cloudinary secrets in backend/deployment secret storage. |
| 6 | Error responses | Server exceptions return a generic 5xx message; status exceptions no longer expose their reason. Validation responses may include field-level validation messages, not SQL or stack traces. |
| 7 | Upload file types | Backend validates decoded image content and accepts JPG/JPEG and PNG; extension/MIME supplied by the browser is not trusted. |
| 8 | Upload file size | Backend and frontend limit each image to 5 MB; backend also limits decoded image dimensions and gallery batch/count. |
| 9 | Server validation | Request DTO validation, service-level checks and bounded booking pagination are enforced server-side. Public salon search bounds page size. |
| 10 | Cross-account data | Protected routes require roles; owner resources resolve the salon from the authenticated owner, and customer booking/review operations check ownership. Keep the ownership tests passing for every newly added endpoint. |

## Before public release

1. In Cognito, verify token revocation is enabled and set access/refresh token durations appropriate for the product; test that logging out in one browser makes that token unusable against the API.
2. Apply `src/main/resources/db/revoked-access-tokens.sql` to Supabase before deploying this backend version; the Supabase profile disables Hibernate schema updates.
3. Set `CORS_ALLOWED_ORIGINS` to the exact production frontend origin(s), with no wildcard.
4. Verify production has real database/cloud secrets in the hosting provider's secret settings and that schema auto-update/migration behavior is intentional.
5. Run backend tests and the production frontend build against the final deployment configuration.
