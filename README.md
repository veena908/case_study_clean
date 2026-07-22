# Mini ERP + CRM Operations Portal

Full Stack Developer Case Study submission — a small ERP/CRM system for a
wholesale/distribution company covering customers, products/inventory, and sales
challans, used internally by sales, warehouse, and accounts teams.

## Live Deployment

- **Frontend**: <https://case-study-mini-erp.netlify.app>
- **Backend API**: <https://case-study-backend-6upt.onrender.com/api>
- **Database**: Neon (serverless Postgres)

Test credentials are listed below under "Test login credentials." Note: the
backend is on Render's free tier, which spins down after ~15 minutes of
inactivity — the first request after idle can take 30-50 seconds to wake up.

## Tech Stack

- **Backend**: Node.js, TypeScript, Express.js, Prisma ORM, PostgreSQL, JWT auth, Zod validation
- **Frontend**: React, TypeScript, Vite, React Router, Tailwind CSS, Axios
- **Bonus**: Docker + docker-compose for one-command local spin-up

## Architecture

```
case_study/
├── backend/     REST API (Express + Prisma + PostgreSQL)
├── frontend/    Admin SPA (React + Vite)
├── docker-compose.yml
├── postman_collection.json
└── README.md
```

The backend is organized by module (`auth`, `customers`, `products`, `challans`),
each with `routes.ts` → `controller.ts` → `service.ts` (+ `schema.ts` for Zod
validation). Authentication is JWT-based; `authenticate` verifies the token and
`authorize(...roles)` enforces role-based access per route. All business rules
(stock reduction on challan confirmation, negative-stock prevention, product
snapshotting) live in the service layer and run inside Prisma transactions so
partial writes can't happen.

The frontend is a single-page admin app. An `AuthContext` holds the logged-in
user and JWT (stored in `localStorage`); `ProtectedRoute` gates pages behind
login (and optionally by role); an Axios instance attaches the token to every
request and redirects to `/login` on a 401.

### Role permissions (assumption)

| Action | Admin | Sales | Warehouse | Accounts |
|---|---|---|---|---|
| Customers: view | ✓ | ✓ | ✓ | ✓ |
| Customers: create/edit/add note | ✓ | ✓ | – | – |
| Products: view | ✓ | ✓ | ✓ | ✓ |
| Products: create/edit/stock movement | ✓ | – | ✓ | – |
| Challans: view | ✓ | ✓ | ✓ | ✓ |
| Challans: create/edit/confirm/cancel | ✓ | ✓ | – | – |

Accounts is read-only across all modules (reporting/reconciliation role).
Warehouse cannot see sales-challan create/edit actions in the UI but can view
the list/detail (e.g. to know what's been dispatched).

## Data model highlights

- `Challan` → `ChallanItem` stores **snapshot** fields (`productNameSnapshot`,
  `productSkuSnapshot`, `unitPriceSnapshot`) in addition to `productId`, so a
  historical challan still reads correctly even if the product is later
  renamed/repriced.
- Confirming a challan reduces `Product.currentStock` inside a transaction; if
  any line's quantity exceeds available stock, the whole confirm is rejected
  with a `409` and no stock is touched.
- Cancelling a **confirmed** challan reverses the stock (adds it back) since
  the goods were never actually shipped/kept out — this is an assumption, not
  explicitly specified in the brief.
- `challanNumber` is auto-generated as `CH-000001`, `CH-000002`, ... at creation.

## Prerequisites

- Node.js 20+ and npm
- A PostgreSQL database — any of:
  - `docker compose up` (spins up Postgres for you), or
  - a local Postgres install, or
  - a free cloud Postgres (e.g. [Neon](https://neon.tech), [Supabase](https://supabase.com)) — just paste its connection string into `DATABASE_URL`

## How the server was set up

The backend was scaffolded manually (Express + TypeScript + Prisma), not from a
generator template. Prisma manages the schema/migrations against PostgreSQL;
`bcrypt` hashes passwords; `jsonwebtoken` issues/verifies JWTs; `zod` validates
every request body/query against a schema before it reaches a controller;
`helmet`, `cors`, and `morgan` are wired in `src/app.ts` for basic hardening,
cross-origin access from the frontend, and request logging.

## Environment variables

Both apps ship a `.env.example` — copy it to `.env` and adjust:

**`backend/.env`**
| Variable | Purpose |
|---|---|
| `PORT` | API port (default `4000`) |
| `DATABASE_URL` | Postgres connection string |
| `JWT_SECRET` | Signing secret for auth tokens — replace with a long random value |
| `JWT_EXPIRES_IN` | Token lifetime (default `8h`) |
| `CORS_ORIGIN` | Comma-separated allowed frontend origin(s) |

**`frontend/.env`**
| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Base URL of the backend API (default `http://localhost:4000/api`) |

`.env` files are git-ignored; only `.env.example` is committed.

## Run locally

### 1. Database
```bash
# Option A: Docker
docker compose up -d postgres

# Option B: point DATABASE_URL in backend/.env at any Postgres instance
# (local install or a free Neon/Supabase database)
```

### 2. Backend
```bash
cd backend
cp .env.example .env      # then edit DATABASE_URL / JWT_SECRET as needed
npm install
npx prisma migrate dev --name init   # creates tables
npm run seed                          # creates demo users + sample data
npm run dev                           # http://localhost:4000
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev     # http://localhost:5173
```

### One-command alternative (Docker)
```bash
docker compose up --build
```
This starts Postgres and the backend (migrated + seeded) together. Run the
frontend separately with `npm run dev` inside `frontend/` (or serve its
production build with any static host) pointed at `http://localhost:4000/api`.

## Test login credentials (seeded)

| Role | Email | Password |
|---|---|---|
| Admin | admin@example.com | Admin@123 |
| Sales | sales@example.com | Sales@123 |
| Warehouse | warehouse@example.com | Warehouse@123 |
| Accounts | accounts@example.com | Accounts@123 |

## API documentation

Import [`postman_collection.json`](./postman_collection.json) into Postman.
Set the collection variable `baseUrl` (default `http://localhost:4000/api`),
log in via the **Auth → Login** request, copy the returned `token` into the
`token` collection variable, then exercise the rest of the requests.

Key endpoints:
```
POST   /api/auth/login
GET    /api/auth/me

GET    /api/customers            ?page&pageSize&search&status&customerType
POST   /api/customers
GET    /api/customers/:id
PUT    /api/customers/:id
GET    /api/customers/:id/notes
POST   /api/customers/:id/notes

GET    /api/products             ?page&pageSize&search&category&lowStock=true
POST   /api/products
GET    /api/products/:id
PUT    /api/products/:id
GET    /api/products/:id/movements
POST   /api/products/:id/stock

GET    /api/challans             ?page&pageSize&status&customerId
POST   /api/challans
GET    /api/challans/:id
PUT    /api/challans/:id
POST   /api/challans/:id/confirm
POST   /api/challans/:id/cancel
```
All responses are shaped `{ success, data }` (or `{ success, data, pagination }`
for lists) on success, and `{ success: false, message, errors? }` on failure,
with standard HTTP status codes (400 validation, 401/403 auth, 404 not found,
409 business-rule conflict).

## How to deploy

Deployed for this submission on Render (backend) + Netlify (frontend) + Neon
(database) — see "Live Deployment" above. Steps taken:

1. **Database** — free Postgres on [Neon](https://neon.tech); connection
   string set as `DATABASE_URL`.
2. **Backend** — `backend/` deployed to [Render](https://render.com) as a
   Node web service:
   - Build command: `npm install && npx prisma generate && npm run build`
   - Start command: `npx prisma migrate deploy && npm run seed && npm start`
   - Env vars: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN`
     (set to the deployed frontend URL), `NODE_ENV=production`.
   - Note: with `NODE_ENV=production` set, `npm install` skips
     `devDependencies` — so build-time tooling (`typescript`, `@types/*`)
     and runtime tooling (`tsx`, used by `npm run seed`) must live in
     regular `dependencies`, not `devDependencies` (see `backend/package.json`).
3. **Frontend** — `frontend/` deployed to [Netlify](https://netlify.com):
   - Build command: `npm run build`, publish directory: `dist`
   - Env var: `VITE_API_URL` set to the deployed backend's `/api` URL.
   - `frontend/public/_redirects` contains `/* /index.html 200` — required
     so Netlify's CDN serves `index.html` (letting React Router take over)
     for any direct hit on a client-side route like `/login`, instead of
     404ing.
4. `CORS_ORIGIN` on the backend updated to the live frontend's URL once known.

## Assumptions

- No public self-registration screen — one demo user per role is created by
  the seed script instead, since the brief only requires "test login
  credentials for all roles," not user management UI.
- Role-to-action mapping (table above) is inferred from the business
  descriptions in the brief, since the brief doesn't spell out per-role CRUD
  permissions.
- Cancelling a confirmed challan restocks the reserved quantity.
- Pagination defaults to 20 items/page, capped at 100/page.

## Known limitations / incomplete parts

- **No automated tests** (unit/integration) were written given the time box.
- **No screen recording** included — the app is deployed live (see "Live
  Deployment" above), so a recording isn't needed to demo it.
- Bonus items not implemented: GitHub Actions CI/CD, export invoice as PDF,
  product image upload to AWS S3.
- Render's free tier spins down after ~15 minutes idle; the first request
  after that can take 30-50 seconds to wake up.
