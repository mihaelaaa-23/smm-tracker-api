# SMM Tracker API

REST API for SMM Tracker built with Fastify + SQLite, deployed on Render.

## Live URLs

- **Frontend:** https://mihaelaaa-23.github.io/smm-tracker-api/
- **API:** https://smm-tracker-api.onrender.com
- **Swagger UI:** https://smm-tracker-api.onrender.com/docs

## Tech Stack

- Node.js + Fastify
- SQLite (better-sqlite3)
- JWT Authentication (@fastify/jwt)
- Swagger UI (@fastify/swagger-ui)
- React 18 + TypeScript + Vite
- Tailwind CSS v4
- Dexie.js (IndexedDB)

## Endpoints

### Auth
- `POST /token` — generate JWT with role (ADMIN/WRITER/VISITOR)

### Clients
- `GET /clients` — list with pagination (?limit=10&offset=0)
- `GET /clients/:id` — get by ID
- `POST /clients` — create (requires WRITE)
- `PUT /clients/:id` — update (requires WRITE)
- `DELETE /clients/:id` — delete (requires DELETE)

### Tasks
- `GET /tasks` — list with pagination, filter by clientId/status/priority
- `GET /tasks/:id` — get by ID
- `POST /tasks` — create (requires WRITE)
- `PUT /tasks/:id` — update (requires WRITE)
- `DELETE /tasks/:id` — delete (requires DELETE)

### Payments
- `GET /payments` — list with pagination, filter by clientId/status/currency/month/year
- `GET /payments/:id` — get by ID
- `POST /payments` — create (requires WRITE)
- `PUT /payments/:id` — update (requires WRITE)
- `DELETE /payments/:id` — delete (requires DELETE)

### Health
- `GET /health` — health check

## JWT Roles

| Role | Permissions |
|------|-------------|
| ADMIN | READ, WRITE, DELETE |
| WRITER | READ, WRITE |
| VISITOR | READ only |

Token expires in 1 minute.

## Local Development

```bash
npm install
npm run dev
```

Frontend runs on http://localhost:5173  
API runs on http://localhost:3000  
Swagger UI at http://localhost:3000/docs

Create `.env` in the project root:
VITE_API_URL=https://smm-tracker-api.onrender.com
JWT_SECRET=your_secret

## Deploy

Frontend deployed via GitHub Pages:
```bash
npm run deploy
```

API deployed on Render.com — auto-deploys on push to `main`.