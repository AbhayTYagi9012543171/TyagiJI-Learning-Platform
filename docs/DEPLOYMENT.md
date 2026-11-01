# Deployment checklist

1. Use a supported Node.js LTS version and install dependencies from the committed lockfile (`npm ci`).
2. Configure a reachable MongoDB database with a least-privilege user and network restrictions.
3. Set `NODE_ENV=production`, a random `SESSION_SECRET`, exact trusted `CLIENT_URL` origins, `COOKIE_SECURE=true` for HTTPS, and the correct `TRUST_PROXY_HOPS` value.
4. Configure the client `VITE_API_URL` to the deployed API base URL and build the frontend with `npm run build`.
5. Run `npm test` in CI and verify the deployment's health endpoint at `/api/v1/health`.
6. Run the seed script only after reviewing the target database and the seed's upsert behavior.
7. Create the first administrator through the documented CLI command; do not hardcode admin credentials into source code.
8. Configure TLS, monitoring, backups, log retention, alerting and an incident-response contact.
9. Configure an email provider before enabling password reset for real users. The current implementation does not deliver reset emails.
10. Test login, logout, enrollment, progress, quiz submissions, admin authorization and error handling against the deployed environment before launch.

The Docker files are a starting point and must be reviewed against the actual deployment platform, secrets strategy, health checks and reverse-proxy topology.
