# TyagiJI Learning Platform — upgrade verification

## Checks run for this ZIP

- **PASS:** All 9 backend Node.js tests passed (`npm --workspace server test`) with the supplied dependency tree available in the working environment.
- **PASS:** Production static-hosting smoke test returned the React `index.html` at `/` and preserved JSON 404 behavior for an unknown `/api/v1/...` route.
- **PASS:** `node --check server/src/app.js`.
- **BLOCKED:** Frontend Vitest suite and Vite production build. The supplied dependency tree is missing `@rollup/rollup-linux-x64-gnu`; this environment could not complete a clean registry-backed `npm ci`. Do not treat the frontend build as passing.
- **NOT RUN:** MongoDB Atlas integration, real login/logout against a live database, browser-based end-to-end tests, payment/email provider tests, penetration testing, and deployment to the user's Render account.

## New deployment support

- `render.yaml` describes a single Render web service. It installs from the lockfile, builds the frontend, starts Express, and checks `/api/v1/health`.
- In production, Express serves `client/dist` from the same origin as the API. This avoids requiring a second frontend host for the default deployment.
- Same-origin browser requests bypass unnecessary CORS checks; configured cross-origin requests still use the explicit `CLIENT_URL` allow-list.
- `docs/DEVELOPMENT-QUICKSTART.md` describes local development; `docs/RENDER-DEPLOYMENT.md` describes deployment and database preservation.

## Required before calling this production-ready

1. On a machine with npm registry access, run `npm ci`, `npm test`, and `npm run build` from the repository root.
2. Test with a disposable development database, then verify authentication, logout, course loading, progress, quiz submission, and admin authorization.
3. In Render, set `MONGODB_URI` to the intended Atlas database and verify the exact service URL, health endpoint, cookie behavior, and production logs.
4. Confirm backups and rollback before routing real users to the new deployment.

No claim is made that this ZIP has been deployed to the user's live Render service or that production Atlas data has been tested.
