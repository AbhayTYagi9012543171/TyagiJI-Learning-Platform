# Troubleshooting

## Frontend cannot reach the API

- Confirm the API is running and `GET /api/v1/health` returns JSON.
- Confirm `VITE_API_URL` points to the correct `/api/v1` base path.
- Set `CLIENT_URL` to the exact frontend origin; credentialed CORS does not support wildcard origins.
- Use consistent hostnames (`localhost` vs `127.0.0.1`) for frontend and backend when testing cookie sessions.

## Login works but protected requests return 401

- Confirm the browser request includes credentials and that the `cp_session` cookie exists.
- Confirm `SESSION_SECRET` is stable between API restarts and the cookie is not expired.
- On HTTPS production, use `COOKIE_SECURE=true`; for local HTTP development, keep it false.
- Check browser cookie policies and ensure the frontend origin is trusted.

## MongoDB connection errors

- Verify `MONGODB_URI`, database availability, network allowlists, and credentials.
- Avoid printing full connection strings in logs or support tickets.
- Run seed operations only after confirming the target database.

## Vite build or test runner fails after copying a ZIP

Do not copy `node_modules` between Windows, WSL, Linux or macOS. Install dependencies on the target platform from the committed lockfile with `npm ci`. If npm reports missing platform-specific optional packages, remove the installed `node_modules` directory and reinstall rather than adding OS-specific binaries to the ZIP.

## Password recovery

The backend supports expiring, single-use reset tokens, but no email provider is configured in this version. For local development only, `ENABLE_DEV_RESET=true` can log a reset URL when not in production. Never enable that option on a public production server.

## Local Vite port 5174 blocked by CORS

The API allows the Vite development origins `http://localhost:5173` and
`http://localhost:5174` (plus their `127.0.0.1` equivalents) when
`NODE_ENV` is not `production`. CORS middleware is registered before API
rate limiting and routes so browser `OPTIONS` preflight requests are handled.

For a different local port, add its exact origin to `CLIENT_URL` in
`server/.env`, comma-separated, for example:

```env
CLIENT_URL=http://localhost:5174,http://localhost:5173
```

Restart the backend after changing `.env`. Do not use `origin: '*'` with
`credentials: true`. In production, configure only the exact deployed frontend
origin(s) in `CLIENT_URL`.
