# V11 upgrade notes

## Compatibility and data

This upgrade is additive for the primary model registry. It introduces new collections and an `authVersion` field on User. Existing users default to version `0`; no destructive migration is required. The first logout after upgrade increments the user's version and invalidates older signed sessions for that account. Password reset increments it as well.

The old standalone `models/User.js`, `models/Course.js` and `models/Enrollment.js` files are legacy alternatives and must not be imported into the active route stack. The active application imports the canonical registry in `models/index.js`. Before removing legacy files, search the repository for imports and run the complete test suite.

## Added endpoints

All endpoints below are under `/api/v1/v11`:

- `GET /submissions?page=1&limit=20` — own submissions; administrators can list all.
- `POST /submissions` — submit a published project.
- `PATCH /submissions/:id` — update an owned draft or changes-requested submission.
- `PATCH /submissions/:id/review` — administrator review and notification.
- `GET /achievements` — active achievement definitions.
- `GET /my-achievements` — current user's earned achievements.
- `GET /notifications?page=1&limit=20` — current user's notifications and unread count.
- `PATCH /notifications/:id/read` — mark an owned notification as read.
- `GET /certificates/verify/:certificateNumber` — public certificate verification; returns only certificate number, learner name, course title and issue date.

## Security notes

- The API accepts only published projects for new submissions.
- A student can only edit their own draft or changes-requested submission.
- Only administrators can review submissions.
- Review actions write an audit record and notify the submission owner.
- URLs are validated by Zod and body fields are allow-listed.
- Session versioning revokes all active sessions for the account on logout. This is intentionally conservative; per-device revocation can be implemented later with a dedicated Session collection.

## Remaining production work

- Add a full integration test suite for V11 routes with a disposable MongoDB database.
- Add rate limits specific to submission and review routes.
- Move certificate verification to a public router and implement issuance/revocation workflows.
- Add an achievement-award service driven by trusted learning events; do not award based on client-submitted counters.
- Add admin CRUD screens for achievement definitions and audit log search.
- Add a moderation workflow for discussions and course reviews.
- Configure email provider, backups, monitoring, log redaction and deployment secrets.
