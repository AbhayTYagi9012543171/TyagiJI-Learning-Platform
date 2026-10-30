# Local development quickstart

## Requirements

- Node.js 20–22 (Node 22 recommended)
- npm included with Node.js
- MongoDB local instance or MongoDB Atlas connection string

## Setup

1. Extract the ZIP and open the `codepath-academy` folder in VS Code.
2. Copy `.env.example` to `.env` or copy `server/.env.example` to `server/.env`.
3. Set `MONGODB_URI` to a development database. Do not point local experiments at production unless you explicitly intend to do so.
4. Set `SESSION_SECRET` to a random string of at least 32 characters.
5. Install from the lockfile at the repository root:

   ```bash
   npm ci
   ```

6. Start both services:

   ```bash
   npm run dev
   ```

7. Open `http://localhost:5173`. API health endpoint: `http://localhost:5000/api/v1/health`.
8. Run verification:

   ```bash
   npm test
   npm run build
   ```

## Useful commands

- `npm run dev:client` — Vite frontend
- `npm run dev:server` — Express API
- `npm run seed` — insert/update the authored curriculum; use a development database first
- `npm run admin:create` — create an administrator using `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`
- `npm run start:prod` — start the API server configured to serve `client/dist` when `NODE_ENV=production`

Never commit `.env` files. If a command fails, share the command and the last 20–30 lines of its output after removing connection strings, tokens, passwords, and other secrets.
