# Testing and verification

## Commands

Run from the repository root after installing dependencies with the committed lockfile:

```bash
npm test
npm run build
```

The root test command runs the Node test suite in `server/tests` and Vitest tests in `client/tests`. The production build is the Vite build for the client workspace.

## Core workflow checks

- Register, log in, refresh, and log out; confirm protected APIs reject anonymous sessions.
- Verify the learner cannot read or mutate another user's private notes, bookmarks, progress, or attempts.
- Verify non-admin accounts receive 403 for admin APIs even if they manually call endpoints.
- Confirm only published courses/lessons appear through public learner endpoints.
- Complete a lesson, reload, and confirm persisted progress.
- Submit a quiz and verify the server calculates the result and does not expose correct answers before permitted review.
- Verify password reset rejects invalid/expired tokens and consumes a valid token once.
- Test admin create/update/publish/unpublish/delete operations against a disposable MongoDB database.
- Check mobile navigation, keyboard focus, reduced motion, theme contrast and horizontal overflow.

Do not mark a workflow as verified unless it was executed in the relevant environment. MongoDB-dependent checks require a dedicated configured database.
