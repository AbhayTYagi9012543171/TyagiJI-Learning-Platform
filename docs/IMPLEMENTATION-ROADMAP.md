# Implementation Roadmap

## Phase 0 — Audit and safe packaging (completed for this source pass)

- Inspect source tree, routes, models, dependencies, tests and deployment files.
- Record feature status and known issues.
- Exclude environment secrets from source deliverables.
- Align stale tests with the current API contract and authored curriculum.
- Add audit, feature matrix, architecture, roadmap and known-issues documents.
- Backend unit/API smoke suite passes 9/9 after updates; frontend build/test remains blocked by the incomplete platform-specific dependency tree.

## Phase 1 — Foundation and quality gates

- Make clean installs reproducible from the lockfile; verify Vite build and both test suites.
- Add stable API contract tests for authentication, validation, authorization and error responses.
- Add configuration validation and a production readiness check.
- Ensure logs do not disclose secrets, and keep `.env` files out of archives.

## Phase 2 — Authentication and data ownership

- Test registration/login/logout/password reset against a disposable MongoDB database.
- Add tests proving students cannot access other users’ notes, bookmarks, progress and attempts.
- Verify disabled accounts and role checks through direct API calls.
- Review CSRF implications for cookie-authenticated state-changing routes and configure protections appropriate to deployment topology.

## Phase 3 — Course engine

- Verify course publication, enrollment, lesson access, explicit completion and progress recalculation.
- Add integration tests for duplicate enrollment, hidden lessons, invalid IDs and failure rollback.
- Add indexes based on observed query patterns; introduce migrations before schema changes.

## Phase 4 — Frontend architecture and UX

- Extract the largest public/student pages from `Pages.jsx` into route modules incrementally.
- Preserve route URLs and use existing shared UI components.
- Verify loading, empty, error, keyboard and mobile states.

## Phase 5 — Admin and instructor capabilities

- Keep admin authorization server-side and add audit logging for sensitive actions.
- Define instructor role, course ownership, publishing permissions and student access rules before implementing instructor screens.

## Phase 6 — Assessments, submissions and credentials

- Verify server-side quiz scoring and hidden answer handling.
- Implement project submissions, instructor feedback, certificate eligibility/issuance and verification with migrations and tests.

## Phase 7 — Career, notifications and developer tools

- Add private-by-default career data, user-controlled portfolio visibility and notification persistence.
- Add sandboxed code execution only if isolated infrastructure exists; otherwise clearly label the playground as editor/submission-only.
- Add AI only with a configured server-side provider, limits, privacy controls and monitoring.

## Phase 8 — Release readiness

- Run lint/type checks where configured, tests, build, migration checks, API integration, E2E and security checks.
- Verify backup/restore on a disposable database, production health checks, monitoring and rollback.
- Publish a completion matrix with command outputs and remaining blockers.
