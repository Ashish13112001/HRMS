# Multi-Tenant SaaS Employee Management System (HRMS)

Cloud HRMS for employee, leave, and project operations with logical tenant isolation and backend RBAC.

## Layout

```
HRMS/
├── .cursor/rules/     Cursor agent conventions
├── docs/              Requirements, plan, implementation log
├── client/            React + TypeScript frontend
├── server/            Express + TypeScript API
├── .env.example       Environment variable template
└── README.md
```

## Docs

| File | Purpose |
|------|---------|
| [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md) | Product scope |
| [docs/PLAN.md](docs/PLAN.md) | Build sequence |
| [docs/IMPLEMENTATION.md](docs/IMPLEMENTATION.md) | What has been built |

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL (required from later phases; not connected in Phase 1)

## Setup

1. Copy `.env.example` to `.env` and set values.
2. Install dependencies from the repository root:

```bash
npm install
```

## Development

```bash
npm run dev:server
npm run dev:client
```

- API: `http://localhost:3000`
- Health: `GET http://localhost:3000/api/v1/health`
- Frontend: `http://localhost:5173`

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev:client` | Start the Vite dev server |
| `npm run dev:server` | Start the Express API with reload |
| `npm run build` | Production build for client and server |
| `npm run typecheck` | TypeScript checks |
| `npm run lint` | ESLint |
| `npm test` | Workspace tests |
| `npm run format` | Prettier |

## Branch strategy

- `main` — stable, releasable code
- `develop` — integration branch for completed phases
- `feature/*` — individual features (for example `feature/authentication`)

Do not commit `.env` or real secrets.
