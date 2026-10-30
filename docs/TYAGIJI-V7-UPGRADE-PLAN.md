# TyagiJI Learning Platform — V7 Upgrade Plan and Implementation Notes

## Product identity

- Product name: **TyagiJI Learning Platform**
- Tagline: **Learn. Practice. Build.**
- Theme: premium dark-first UI with blue/violet/teal accents and a light-theme option.
- Brand assets: `client/public/logo-mark.svg`, `client/public/logo-full.svg`, `client/public/favicon.svg`.

## Existing application foundation

The project is a React 18 + Vite frontend and Express + MongoDB/Mongoose backend. It already contains authentication, student/admin guards, a course catalog, modules, lessons, quizzes, projects, progress, bookmarks, notes, resources, admin analytics, and protected admin CRUD for courses, modules, lessons, quizzes, projects, resources, and student users. Preserve these API contracts while evolving the application.

## Page scope

### Public

- Home / landing page
- Course catalog, course details, module and lesson curriculum
- Project catalog and project details
- Resources, glossary, cheatsheets, and coding playground
- About, contact, privacy, terms, and not-found pages
- Login, registration, forgot password, and reset password

### Student

- Dashboard and my learning
- Lesson player and lesson completion
- Progress analytics
- Quiz attempt and results
- Bookmarks and lesson notes
- Profile and preferences/settings

### Administrator

- Overview and analytics
- Course, module, lesson, quiz, project, and resource CRUD
- Student account creation, update, disable/enable, and delete
- Search, pagination, publishing controls, and advanced JSON fields

## Backend architecture

- `models/`: Mongoose schemas, validation, indexes, and relationships.
- `routes/`: versioned Express route declarations.
- `controllers/`: HTTP request/response handling.
- `services/`: reusable application and data-access logic.
- `middleware/`: authentication, admin authorization, validation, and errors.
- `seed/`: idempotent course, lesson, assessment, and project content.
- `tests/`: API smoke tests and curriculum integrity tests.

The public course catalog has been separated into `routes/course.routes.js`, `controllers/course.controller.js`, and `services/course.service.js`. Existing protected admin CRUD endpoints remain in the central API router to preserve their established contract.

## Current CRUD coverage

| Resource | Admin API | Student API |
|---|---|---|
| Users | Create/list/update status/name/delete | Register, profile and preferences |
| Courses | Create/list/update/publish/delete | Browse and enroll |
| Modules | Create/list/update/delete | Read published curriculum |
| Lessons | Create/list/update/publish/delete | Read, complete, bookmark and note |
| Quizzes | Create/list/update/publish/delete | Read, submit and view attempts |
| Projects | Create/list/update/publish/delete | Browse project briefs |
| Resources | Create/list/update/delete | Browse resources |
| Progress | Analytics/read | Complete lessons and view progress |
| Bookmarks | — | Create/list/delete own bookmarks |
| Notes | — | Create/read/update/delete own notes |
| Enrollments | Admin analytics | Enroll and view own learning |

All administrator CRUD routes require authentication plus administrator authorization. Student-owned operations scope queries to the authenticated user. Quiz answer keys are excluded from public quiz responses and evaluated by the API.

## MERN Stack flagship course

- Slug: `mern-stack-professional`
- Ten modules and 30 generated lesson entries (core concepts, worked example, practice lab per module).
- Topics: web architecture, modern JavaScript, React components, hooks/routing/forms, Node.js, Express REST APIs, controllers/services/validation, MongoDB/Mongoose, authentication/authorization, secure CRUD, testing, real-time integration, deployment, observability, and capstone delivery.
- Seeded practical assessment and capstone project.
- Seed is idempotent; run `npm run seed` after configuring MongoDB.

## Run and verify

1. Install Node.js 20+ and MongoDB.
2. Copy `.env.example` to `.env` and set a MongoDB URI plus a random `SESSION_SECRET` of at least 32 characters.
3. Run `npm ci`.
4. Run `npm run seed`.
5. Configure `ADMIN_EMAIL` and `ADMIN_PASSWORD` (minimum 12 characters), then run `npm run admin:create`.
6. Run `npm test` and `npm run build`.
7. Run `npm run dev`.

## Production requirements and known limitations

- Do not commit or distribute `.env` files or production credentials.
- If an existing deployment uses a different MongoDB database name, retain its current `MONGODB_URI` or migrate data using a verified backup/restore procedure. Changing an example URI does not migrate data.
- Email delivery, live AI provider integration, payment processing, and automated arbitrary-code grading require provider configuration and additional production verification; do not represent them as active until integrated and tested.
- The MERN course is authored starter curriculum with practical examples and exercises; review technical versions, expand assessment depth, and have an instructor review content before selling it as a credential.
- Build and full integration tests must be run in an environment with dependencies and MongoDB available.
