# TyagiJI Learning Platform — Client V12 Enhanced

This folder is the React + Vite client application. It is based on the supplied `client/` archive and retains its existing page, route, authentication and API contracts while adding a shared component library, responsive page styling, a career workspace route, FAQ page, error boundary and component tests.

## Requirements
- Node.js 20+
- npm 10+

## Setup
```bash
npm install
cp .env.example .env
npm run dev
```

On Windows PowerShell:
```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Set `VITE_API_URL` to the backend API base URL (for example `http://localhost:5000/api/v1`). The frontend uses cookie credentials for authenticated API calls. Configure the matching backend CORS and cookie settings for your deployment.

## Checks
```bash
npm test
npm run build
```

The Career workspace expects the authenticated `/career/profile` and `/career/roadmaps` API endpoints already present in the matching V11 backend. The FAQ page is static product guidance. Optional services such as AI and isolated code execution must not be presented as active unless the backend provider is configured and verified.

See `docs/CLIENT-V12-ENHANCEMENTS.md` and `src/components/README.md` for the component inventory and implementation notes.
