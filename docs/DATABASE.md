# Database guide

TyagiJI Learning Platform uses MongoDB through Mongoose. The current schema definitions live in `server/src/models/index.js`; inspect that file before changing references or adding migrations.

## Main entities

- `User`: account identity, role, account status, preferences and password/reset metadata.
- `Course`, `Module`, `Lesson`: curriculum hierarchy and publication metadata.
- `Enrollment`: learner-to-course enrollment.
- `Progress`: course progress and completed lesson references.
- `Quiz`, `QuizAttempt`: assessment configuration and learner submissions/results.
- `Project`: practical briefs and starter resources.
- `Bookmark`, `Note`: learner-owned saved records.
- `Resource`: reference library entries.

## Safe operations

1. Set `MONGODB_URI` to a development or disposable test database before running `npm run seed`.
2. Seed operations are designed to upsert authored curriculum; inspect the seed scripts before adapting them for production content.
3. Never use a production database for tests or exploratory schema changes.
4. Back up before migrations or bulk deletion.
5. Keep database credentials least-privileged and restrict network access.
6. Review indexes and query plans as data volume grows.

There is no automatic destructive database reset in normal server startup. Course deletion has cascading cleanup in the API; review the behavior and retention policy before deleting real course records.
