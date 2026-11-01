# API reference

Base URL: `/api/v1`. Authentication uses an HTTP-only `cp_session` cookie.

- Auth: `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `POST /auth/forgot-password`, `POST /auth/reset-password`.
- Learning: `GET /courses`, `GET /courses/:slug`, `GET /courses/:slug/lessons`, `GET /lessons/:slug`, `POST /lessons/:id/complete`.
- Projects/resources: `GET /projects`, `GET /projects/:slug`, `GET /resources`, `GET /glossary`, `GET /cheatsheets`.
- Quizzes: `GET /quizzes`, `GET /quizzes/:id`, `POST /quizzes/:id/submit`, `GET /quizzes/:id/attempts`. Public quiz reads omit answer keys; scoring occurs server-side.
- Student: `GET /users/me/dashboard`, `GET /users/me/progress`, `GET /users/me/bookmarks`, `POST|DELETE /users/me/bookmarks/:lessonId`, `PATCH /users/me/preferences`.
- Admin-only CRUD: `/admin/courses`, `/admin/modules`, `/admin/lessons`, `/admin/quizzes`, `/admin/projects`, `/admin/resources`, `/admin/users`; use GET (supports `page`, `limit`, `q`), POST, PATCH `/:id`, and DELETE `/:id`. Student account creation hashes the supplied password and cannot assign the admin role. Admin promotion is excluded from generic CRUD. Course deletion cascades to dependent modules, lessons, quizzes, bookmarks, progress, and quiz attempts. Lesson deletion updates stored course completion percentages.

Collection endpoints support pagination and basic `q` search. Errors return JSON `{ "message": "..." }`.


## Expanded premium curriculum

`GET /api/v1/courses` lists published courses and lesson counts. `GET /api/v1/courses/:slug` returns course metadata, curriculum modules, and published lesson summaries. `GET /api/v1/lessons/:slug` returns the detailed lesson blocks. The seed includes React, Node.js, MongoDB, Python, TypeScript, SQL, Git, and Data Structures & Algorithms alongside the HTML, CSS, and JavaScript foundation tracks.

Premium course assessment slugs use `:course-slug-assessment`; foundation course quizzes use `html-foundations-quiz`, `css-foundations-quiz`, and `javascript-foundations-quiz`. Quiz submission requires an authenticated learner session.

## Additional backend endpoints

- `GET /api/v1/admin/analytics` — administrator-only live MongoDB totals and recent courses.
- `GET /api/v1/enrollments/me` — current learner's active/completed enrollments.
- `POST /api/v1/courses/:courseId/enroll` — enroll in a published course; premium enrollment is rejected unless an entitlement integration is configured.
- `DELETE /api/v1/enrollments/:id` — cancel the authenticated learner's own enrollment.
- `GET /api/v1/users/me/notes` — list the current learner's lesson notes.
- `PUT /api/v1/users/me/notes/:lessonId` — create or update the current learner's note for a published lesson.
- `DELETE /api/v1/users/me/notes/:lessonId` — delete the current learner's note for a lesson.

Course and lesson schemas now support richer structured educational content. Admin CRUD routes remain under `/api/v1/admin/:resource` and require administrator authentication.
