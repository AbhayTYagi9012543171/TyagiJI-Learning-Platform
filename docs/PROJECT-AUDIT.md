# TyagiJI Learning Platform — Project Audit

Audit date: 2026-10-30. Scope: uploaded ZIP source tree, static inspection, and baseline automated checks. This is not a production penetration test and no live MongoDB instance was available.

## Stack and repository shape

- Frontend: React 18, React Router 6, Vite 6, JavaScript/JSX, Vitest and Testing Library.
- Backend: Node.js CommonJS, Express 4, Mongoose 8, MongoDB, JWT session token in an HttpOnly cookie, Zod validation, Helmet, CORS, rate limiting.
- Package manager: npm workspaces; root `package-lock.json`; workspaces `client` and `server`.
- API prefix: `/api/v1`. Client default API base: `http://localhost:5000/api/v1`, overridable with `VITE_API_URL`.
- Database: MongoDB/Mongoose. No migration framework or migration directory was found in the archive. Seed scripts are present.
- Frontend page composition: route table is in `client/src/app/App.jsx`; many route modules are compatibility wrappers around the large `client/src/pages/Pages.jsx` file.
- Backend route composition: most API behavior is concentrated in `server/src/routes/index.js`; server models are defined centrally in `server/src/models/index.js`.
- Tests: Node built-in test runner under `server/tests`; Vitest under `client/tests`.

## Important findings

1. **Credential hygiene:** the uploaded archive contains `server/.env` in addition to environment examples. The distributable source package must exclude this file; rotate any real credentials that were ever stored in it. `.gitignore` already ignores `.env` files, but archive hygiene must also be enforced.
2. **Tests were stale:** the baseline server suite had five failures caused by mismatches between tests and current source behavior: health response shape, unknown API wording, `/auth/me` anonymous-session behavior, and outdated premium curriculum counts. The `/auth/me` endpoint is intentionally public and returns `authenticated: false` for a signed-out visitor. Tests are being aligned to actual documented behavior rather than changing that contract.
3. **Frontend architecture debt:** `client/src/pages/Pages.jsx` contains most primary page implementations in one large module; route-specific page files largely re-export from it. Refactor incrementally to preserve routes and behavior.
4. **Backend architecture debt:** `server/src/routes/index.js` is a large combined route/controller/validation module. Split by domain only after endpoint contracts are covered by tests.
5. **Duplicate model definitions:** `server/src/models/User.js`, `Course.js`, and `Enrollment.js` define schemas separately from `server/src/models/index.js`. The active routes import the central index; the duplicate files risk schema drift and should be consolidated after import usage is verified. Do not delete them blindly.
6. **Role coverage:** the central active user schema permits `student` and `admin`; instructor-specific role/workspace authorization is not present in that schema. Treat instructor functionality as missing or requiring redesign, not as complete.
7. **Persistence scope:** active schemas exist for users, courses, modules, lessons, quizzes/attempts, projects, enrollments, progress, bookmarks, resources, and notes. No dedicated schemas were found for certificates, achievements, instructor profiles, audit logs, career roadmaps/resumes/portfolios, or notifications.
8. **Build environment:** the ZIP includes many dependency files but archive extraction does not preserve executable links reliably in this environment; initial build attempt failed with `vite: Permission denied`. This is an environment/package-permission issue, not yet proof of a source compile error.
9. **Database integration:** no live database verification was performed; any MongoDB-dependent workflows remain unverified.

## Existing API and feature evidence

The backend includes health, authentication/session, password reset, public course/catalog and lesson reads, glossary, cheatsheets, projects/resources, learner enrollment/progress/bookmark/note/quiz workflows, and admin CRUD/analytics routes. Exact contracts are defined in `server/src/routes/index.js`. A route being present does not by itself prove the full workflow is correct or secure; see `FEATURE-MATRIX.md`.

## Verification after the initial maintenance pass

- `npm --workspace server test`: **passed, 9/9 tests** after correcting stale expectations and the route not-found wording.
- `npm test`: server suite passed; client Vitest startup then failed because `@rollup/rollup-linux-x64-gnu` is missing from the supplied dependency tree.
- `npm run build`: not verified successfully for the same missing platform-specific Rollup dependency. An earlier attempt also encountered a non-executable Vite shim from the archive; local executable permissions were repaired before retrying the test command.
- MongoDB integration and end-to-end workflows were not run because no disposable test database/configuration was provided.

## Safety decisions

- Preserve existing MongoDB data and seed behavior. No database reset or destructive migration is part of this phase.
- Keep existing API prefix and route names.
- Avoid claiming instructor, certificates, AI, payments, or secure code execution are production-ready without implementation and verification.
