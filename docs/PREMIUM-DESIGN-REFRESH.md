# TyagiJI Learning Platform — Premium Design Refresh

This package is a visual redesign of the existing TyagiJI Learning Platform full-stack application. The React routes, API client, authentication context, Express/Mongoose backend, and data models are preserved.

## Design changes
- Refreshed the shared design system with a clean, premium learning-platform aesthetic.
- Added clearer typography, improved contrast, softer surfaces, consistent borders, and elevated cards.
- Redesigned navigation, hero, course cards, page introductions, forms, dashboards, admin panels, and footer styling.
- Added responsive layouts for mobile, tablet, and desktop breakpoints.
- Kept the existing light/dark theme toggle and added coordinated styling for both themes.
- Added subtle entrance/hover motion and honors `prefers-reduced-motion`.
- Kept existing selectors and page components to avoid breaking existing feature workflows.

## Run locally
1. Install Node.js 20+.
2. From the project root, run `npm install`.
3. Copy `server/.env.example` to `server/.env` and configure `MONGODB_URI`, `SESSION_SECRET`, and `CLIENT_URL`.
4. Copy `client/.env.example` to `client/.env` and set `VITE_API_URL` (normally `http://localhost:5000/api/v1`).
5. Run `npm run seed` if you want to seed the development curriculum.
6. Run `npm run dev` to start the API and Vite client.
7. Run `npm test` and `npm run build` after dependencies are installed.

## Verification notes
- `node --check` passed for all JavaScript files under `server/src` and `server/tests`.
- Dependency installation timed out in the build environment, so dependency-backed frontend builds and automated test suites could not be run here.
- No claim is made that a production build, live MongoDB integration, or the complete automated test suite passed in this environment.
- Password-reset email delivery still requires an email provider; configure one before enabling production recovery flows.
