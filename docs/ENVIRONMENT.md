# Environment configuration

Copy `.env.example` to `.env` at the repository root or copy `server/.env.example` to `server/.env`. Never copy a real `.env` into a release archive or source-control repository. Values set in the process environment take precedence over values loaded from files.

| Variable | Purpose | Notes |
|---|---|---|
| `NODE_ENV` | Runtime mode | Use `production` for deployment. |
| `PORT` | API port | Defaults to 5000 in the server entry point. |
| `CLIENT_URL` | Trusted browser origin(s) | Comma-separated exact origins; do not use `*` with credentials. |
| `MONGODB_URI` | MongoDB connection | Use a dedicated production database and a least-privilege database user. |
| `SESSION_SECRET` | JWT signing secret | Use a cryptographically random secret of at least 32 characters. Rotate carefully because existing sessions will stop working. |
| `COOKIE_SECURE` | Secure cookie flag | Set `true` when served over HTTPS. |
| `TRUST_PROXY_HOPS` | Express proxy trust | Match the actual trusted reverse-proxy topology; do not set this blindly. |
| `ADMIN_NAME` | CLI admin creation name | Used by `npm run admin:create`. |
| `ADMIN_EMAIL` | CLI admin creation email | Use an operator-controlled address. |
| `ADMIN_PASSWORD` | CLI admin creation password | Use a strong unique password; unset after account creation if appropriate. |
| `PREMIUM_ENROLLMENT_OPEN` | Enrollment policy flag | Keep false until entitlement/payment policy is implemented and reviewed. |
| `ENABLE_DEV_RESET` | Local password reset URL logging | Development only; must remain false in production. |
| `VITE_API_URL` | Browser API base URL | Configure in `client/.env`; defaults to `http://localhost:5000/api/v1`. |

The current reset flow creates expiring, single-use reset tokens, but an email provider is not integrated. In development only, a reset URL is logged when `ENABLE_DEV_RESET=true` and `NODE_ENV` is not `production`. Do not enable this on a public server.
