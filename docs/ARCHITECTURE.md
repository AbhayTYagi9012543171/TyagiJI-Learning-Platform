# Architecture Overview

## Current request flow

Browser → React 18 / React Router (`client/src/app/App.jsx`) → API helper (`client/src/services/api.js`) → Express application (`server/src/app.js`) → `/api/v1` route module (`server/src/routes/index.js`) → Mongoose models (`server/src/models/index.js`) → MongoDB. Authentication uses an HttpOnly `cp_session` cookie containing a signed JWT; the backend resolves the user from the token and checks account status.

## Current boundaries

- Frontend application bootstrap: `client/src/main.jsx`.
- Route/layout composition: `client/src/app/App.jsx`, `client/src/layouts/Layout.jsx`.
- Session state: `client/src/context/AuthContext.jsx`.
- API transport/error normalization: `client/src/services/api.js`.
- Middleware/configuration: `server/src/app.js`, `server/src/config/env.js`, `server/src/middleware/`.
- API routes and much of request validation/business logic: `server/src/routes/index.js`.
- Data schemas: `server/src/models/index.js`.
- Authored curriculum and seed operations: `server/src/seed/`.

## Known architectural risks

The frontend page implementation and backend route logic are too centralized. The central model index is compressed and there are overlapping legacy model files. These should be decomposed in small steps with contract tests and no route/API changes unless explicitly versioned. The active schema currently lacks instructor, notification, certificate, audit-log and career-tool persistence.

## Target incremental structure

1. Keep the public API contract stable while adding route tests.
2. Extract authentication, public catalog, learner, assessment and admin route modules one at a time.
3. Consolidate schema ownership only after confirming imports and existing database compatibility.
4. Extract page modules from `Pages.jsx` while preserving current URLs and page behavior.
5. Introduce explicit schema migrations before adding new production collections or changing existing fields.
6. Add instructor role/ownership checks before exposing instructor CRUD routes.

## Security boundaries

Frontend guards are UX only. Authorization must remain enforced in server middleware/services. The backend must derive the learner identity from the validated session rather than trust user IDs from request bodies. Do not run submitted code in the main Node process.
