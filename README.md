# TyagiJI Learning Platform

Full-stack web-development learning platform starter: React/Vite, Express, MongoDB/Mongoose, student/admin roles, courses, lessons, projects, quizzes, bookmarks, progress, resources, and sandboxed coding playground.

## Premium V3 refinement

This package includes the Premium V3 UI pass documented in [`docs/PREMIUM-V3-RELEASE-NOTES.md`](docs/PREMIUM-V3-RELEASE-NOTES.md): refined responsive navigation, accessibility skip navigation, stronger hover/focus feedback, polished card interactions, dark-theme refinements, and reduced-motion support. Existing backend architecture and API contracts are retained. Run the build and test commands below in an environment with dependencies installed before deployment.

## Setup
1. Install Node.js 20+ and MongoDB 6+ or use MongoDB Atlas.
2. Copy `.env.example` to the project root `.env` **or** copy `server/.env.example` to `server/.env`; the backend loads either location. Set `MONGODB_URI` and a random `SESSION_SECRET` of at least 32 characters. Set `CLIENT_URL=http://localhost:5173`. In production behind a trusted reverse proxy, configure `TRUST_PROXY_HOPS` to match the actual deployment topology and set `COOKIE_SECURE=true` when serving over HTTPS. For the Vite client, copy `client/.env.example` to `client/.env` if using a non-default API URL.
3. Run `npm install`.
4. Run `npm run seed` to upsert the full sample curriculum, including the professional MERN Stack track.
5. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` (at least 12 characters) in `.env`, then run `npm run admin:create`.
6. Run `npm run dev`. Client: `http://localhost:5173`; API: `http://localhost:5000/api/v1`; health: `/health`.

## Commands
- `npm run dev` starts both services.
- `npm run dev:client` or `npm run dev:server` starts one service.
- `npm run build` builds the frontend.
- `npm test` runs smoke tests.
- `npm run seed` seeds 12 learning tracks, 174 lessons, course assessments, 31 project briefs, and resources.
- `npm run admin:create` creates an admin from environment values.

## Environment
`NODE_ENV`, `PORT`, `CLIENT_URL`, `MONGODB_URI`, `SESSION_SECRET`, `COOKIE_SECURE`, `TRUST_PROXY_HOPS`, `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`. Never commit `.env`.

## Current scope and limitations
The seed creates 3 web-foundation tracks plus 9 premium tracks (React, Node.js/Express, MongoDB, Python, TypeScript, SQL, Git, and Data Structures & Algorithms). Most premium tracks include 5 curriculum modules and 15 detailed lesson pages; the MERN Stack flagship includes 10 modules and 30 lesson pages (concepts, examples, practice labs, common mistakes/acceptance criteria), a practical assessment, and a capstone brief. The seeded quizzes are learning checks, not professional certification exams; review and expand question banks before high-stakes use. Password reset email delivery is not integrated; development reset links are logged only when explicitly enabled. The glossary and cheatsheet endpoints provide authored reference content. The admin UI supports paginated/searchable create, edit, publish/unpublish, enable/disable, and delete workflows for supported record types. Advanced model fields can be edited through a validated JSON editor. Course deletion removes related modules, lessons, quizzes, bookmarks, progress, and attempts. Student account creation is supported through registration and the admin panel; administrator creation and promotion remain a secure CLI operation. Automated code grading, full end-to-end browser coverage, and legal review remain future work. No fake user counts or testimonials are shown.

## Security
Cookies are HTTP-only, authentication is rate-limited, admin endpoints are server-protected, passwords use bcrypt, reset tokens are hashed, quiz keys are omitted from public responses, and playground execution is isolated in a sandboxed iframe. Review cross-site cookie/CSRF settings for the production hosting topology. Password reset requires a real email provider before production use.


## Frontend import-error troubleshooting

The application exports `Cheatsheets` from `client/src/pages/Pages.jsx` and imports it in `client/src/app/App.jsx`. If Vite reports that the named export is missing even though the export exists, stop the dev server, confirm both files are from this same project version, remove Vite's cache (`client/node_modules/.vite` if present), then run `npm run dev:client` again. Do not mix files from older ZIP versions.

A branded SVG favicon is included at `client/public/favicon.svg`. If you change API hosting, set `VITE_API_URL` in `client/.env` to the API base URL (the API client defaults to the local backend).


## Troubleshooting course 404s and login sessions
- Start MongoDB and confirm the exact `MONGODB_URI` in the environment file being used.
- From the repository root run `npm run seed`; the seed command is idempotent and publishes the `html`, `css`, and `javascript` foundation courses plus nine premium technology tracks.
- Check `http://localhost:5000/api/v1/health` and `http://localhost:5000/api/v1/courses`. The HTML course detail is `http://localhost:5000/api/v1/courses/html`.
- An unauthenticated `GET /api/v1/auth/me` returns 401 by design. Register or log in to receive the HTTP-only `cp_session` cookie. If login succeeds but the next request is unauthorized, verify `CLIENT_URL`, `credentials: include`, and that the frontend and API use consistent `localhost` hostnames.
- Run `npm test` and `npm run build` after installing dependencies. Do not treat syntax checks alone as a successful production build.


## Upgrade verification
See [`docs/UPGRADE-VERIFICATION.md`](docs/UPGRADE-VERIFICATION.md) for the changes in this build, checks actually run, known verification limits, and local API checks.


## Premium learning library upgrade

The seed script also calls `server/src/seed/premiumCurriculum.js`. It idempotently upserts nine additional tracks; most have five modules and three lessons per module, while the MERN Stack flagship has ten modules and 30 lessons, one practical assessment, and one capstone project per track. Each lesson includes authored teaching blocks, code or query examples where relevant, learning objectives, prerequisites, estimated time, and practice prompts. Re-run `npm run seed` after configuring `MONGODB_URI` to load the new catalog.

The course catalog now supports technology and level filters in the frontend, course outcome/prerequisite sections, richer course cards, responsive catalog controls, and course-specific assessment links. Admin course technology options include all seeded tracks.


## Screenshot-inspired premium design update
The client homepage and navigation have been refreshed to match the supplied TyagiJI Learning Platform reference: bright white and lavender backgrounds, a blue-violet gradient headline and calls to action, rounded pill navigation, a responsive CSS-built coding/live-class illustration, and a beginner-friendly learning message. The site uses TyagiJI Learning Platform branding and a matching favicon. Theme switching remains available for signed-in preferences and local browser preferences.

## Elite V6 package notes

The V6 package includes functional password-recovery request and reset forms connected to the existing API, role-aware post-login routing, and a shared API helper with consistent credentials and error metadata. See `docs/RELEASE-REPORT.md` for the checks executed and limitations, and the following guides for environment setup, database operations, deployment, backups, testing and troubleshooting:

- [`docs/ENVIRONMENT.md`](docs/ENVIRONMENT.md)
- [`docs/DATABASE.md`](docs/DATABASE.md)
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)
- [`docs/BACKUP-RESTORE.md`](docs/BACKUP-RESTORE.md)
- [`docs/TESTING.md`](docs/TESTING.md)
- [`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md)

The release archive intentionally excludes `node_modules` and local `.env` files. After extracting it, run `npm ci` from the repository root on your machine, create the appropriate environment file from `.env.example`, and run `npm test` plus `npm run build` before deploying.


## TyagiJI V7 brand and MERN Stack curriculum

This release is branded as **TyagiJI Learning Platform**. The client uses the TyagiJI logo mark (`client/public/logo-mark.svg`), full wordmark (`client/public/logo-full.svg`), and browser favicon (`client/public/favicon.svg`). The browser title, metadata, navigation, footer, authentication copy, admin technology selector, health-service label, and deployment examples use the new brand. The default first-visit theme is dark; users can still switch themes.

The premium curriculum seed now includes **Complete MERN Stack Developer: Zero to Professional** (`mern-stack-professional`), with ten modules and three lesson formats per module (core concepts, worked example, practice lab), a practical assessment, and a capstone brief. Topics span JavaScript, React, Node.js, Express, MongoDB, API architecture, secure CRUD, testing, and deployment. Run `npm run seed` to publish it. The existing admin CRUD endpoints remain protected by authentication and admin authorization.

## Branding and database migration note

New environment examples and Docker Compose defaults use the `tyagiji_learning` database name. If you already have production data in a database named `codepath_academy`, keep your existing `MONGODB_URI` or perform a planned backup-and-restore migration; changing the example URI does not migrate data. Remove any local `.env` files from archives and never share production credentials.

## V9 upgrade

This release adds a route-level `client/src/pages/` architecture, a dedicated About experience, and an authenticated Achievements overview derived from the existing student dashboard API. Existing workflows are preserved through compatibility exports while pages are migrated incrementally. See `docs/V9-FULL-UPGRADE-PLAN.md` and `docs/V9-IMPLEMENTATION-STATUS.md` for the full roadmap and exact implementation boundaries.


## Development and Render deployment

- Local setup: [`docs/DEVELOPMENT-QUICKSTART.md`](docs/DEVELOPMENT-QUICKSTART.md)
- Render single-service deployment: [`docs/RENDER-DEPLOYMENT.md`](docs/RENDER-DEPLOYMENT.md) and `render.yaml`
- Verification status and limitations: [`docs/UPGRADE-VERIFICATION.md`](docs/UPGRADE-VERIFICATION.md)

The production Express server serves the built React app from the same origin. The ZIP is source code and deployment configuration; it does not itself publish to your Render account. Connect the repository or follow the Render guide, and preserve your existing MongoDB Atlas URI if you need to retain live accounts and course data.
