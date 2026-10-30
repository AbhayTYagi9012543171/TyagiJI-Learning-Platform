# Feature Matrix

Statuses are based on source inspection as of 2026-10-30. “Requires verification” means the code path exists but its end-to-end behavior was not proven in a live environment.

| Feature | Status | Evidence / gap | Tested in this audit? |
|---|---|---|---|
| React/Vite application and route table | Existing and working (static structure) | `client/src/app/App.jsx`, Vite config | Partially; build initially blocked by executable permission |
| Shared UI components | Existing | `client/src/components/ui/` | Existing component tests; rerun pending |
| Public home, about, courses, course detail | Existing but requires verification | Route pages mostly wrap `Pages.jsx`; catalog API exists | Not end-to-end tested |
| Public projects/resources/glossary/cheatsheets | Existing | UI routes and API endpoints exist | Glossary/cheatsheet API smoke tests passed in baseline |
| Authentication register/login/logout/session | Existing but requires verification | Cookie session, bcrypt hashing, JWT validation | Auth contract test updated; full workflow not run |
| Password reset | Existing but requires verification | Reset-token schema and routes present | Not integration-tested |
| Student dashboard | Existing but incomplete | Dashboard, progress, bookmarks, profile, settings, quiz pages present | Not end-to-end tested |
| Enrollment and lesson progress | Existing but requires verification | Enrollment/Progress models and routes exist | MongoDB required; not tested |
| Notes/bookmarks | Existing but requires verification | User-scoped models/routes present | MongoDB required; not tested |
| Quizzes and attempts | Existing but requires verification | Quiz and QuizAttempt schemas/routes exist; answer visibility and scoring need security tests | Not integration-tested |
| Project submission/review workflow | Missing or incomplete | Project model exists; full submission/review persistence was not found | No |
| Instructor workspace and instructor role | Missing | Active user schema supports only `student` and `admin`; no instructor profile model | No |
| Admin users/content CRUD and analytics | Existing but requires verification | Admin route families and permission middleware exist | Not tested against MongoDB |
| Admin audit logs | Missing | No audit log schema/workflow found | No |
| Certificates and verification | Missing | No certificate model/workflow found | No |
| Achievements persistence | Incomplete | UI exists; dedicated achievement persistence was not found | No |
| Career roadmap, resume, portfolio | Incomplete | Career page exists; dedicated persistence models not found | No |
| Notifications | Missing | No notification model/workflow found | No |
| AI learning assistant | Missing / optional | No configured AI provider integration verified | No |
| Sandboxed coding execution | Missing | Playground UI exists; isolated execution service not found | No |
| Database migrations | Missing | Seed scripts exist, migration framework not found | No |
| Deployment docs/config | Existing, requires verification | Docker, compose, deployment/environment/backup docs exist | Not deployed |
| Secret-free source archive | Needs correction | Original archive includes `server/.env` | Fixed in upgraded deliverable by exclusion |
