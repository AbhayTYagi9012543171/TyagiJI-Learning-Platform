# Known Issues and Verification Gaps

- The frontend page implementation is heavily centralized in `client/src/pages/Pages.jsx`; many page files are compatibility exports rather than independent implementations.
- The backend route file `server/src/routes/index.js` combines many domains and needs incremental decomposition.
- `server/src/models/User.js`, `Course.js`, and `Enrollment.js` duplicate schema definitions held in `server/src/models/index.js`; active import usage must be checked before consolidation.
- Active user schema only has `student` and `admin` roles. Instructor workspace and ownership rules are not implemented in the active schema.
- No migration framework or migration directory was found. Seed scripts are not a substitute for versioned migrations.
- No dedicated persistence workflows were found for certificates, audit logs, notifications, project submissions, or career resume/portfolio/roadmap records.
- Playground UI does not prove that safe isolated code execution exists. Do not run untrusted code in the main server.
- AI provider, payment integration, deployment and production database connectivity have not been verified.
- Backend tests pass after correcting stale expectations. Client tests/build remain blocked because the supplied dependency tree is missing `@rollup/rollup-linux-x64-gnu`; a clean install with the committed lockfile is required in an environment with package-registry access.
- No live MongoDB integration tests or browser end-to-end tests have been run in this environment.
- Uploaded archive included `server/.env`; the upgraded distributable must exclude it. Rotate any real credentials that may have been included.
