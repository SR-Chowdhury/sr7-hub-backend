# SR7 Hub — Backend

REST API for the SR7 Hub portfolio site. Powers the public content pages and the admin panel for managing labs, HTB machines, VulnHub walkthroughs, WordPress audits, and Fiverr services.

**Live:** https://sr7-hub-backend.onrender.com/api

## Stack

- **Node.js** + **Express** — HTTP server
- **MongoDB** + **Mongoose** — database & ODM
- **JWT** — stateless authentication
- **bcryptjs** — password hashing
- **Helmet, CORS, compression, express-rate-limit** — security & performance middleware

## Features

- REST API for 5 content collections + 1 singleton (Fiverr profile)
- JWT-based authentication for admin routes
- Generic CRUD factory — one factory powers all collections
- Rate-limited login endpoint
- Case-insensitive exact-match filtering
- Text search + pagination on list endpoints
- Bulk upsert endpoint for seeding/importing

## Structure

```
src/
├── config/           env + db connection
├── controllers/      crudFactory.js — generic CRUD operations
├── middleware/       auth (JWT) + error handling
├── models/           Mongoose schemas
├── routes/           Express routers
├── utils/            helpers (slugify, asyncHandler, etc.)
├── app.js            Express app setup
└── server.js         entry point
scripts/              one-off scripts (seed data, create admin)
```

## API Endpoints

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/api/health` | — | Health check |
| POST | `/api/auth/login` | — | Get JWT token |
| GET | `/api/auth/me` | JWT | Current user info |
| GET | `/api/labs` | — | List labs (with filters) |
| GET | `/api/labs/:id` | — | Get one lab (by ID or slug) |
| POST | `/api/labs` | Admin | Create lab |
| PATCH | `/api/labs/:id` | Admin | Update lab |
| DELETE | `/api/labs/:id` | Admin | Delete lab |
| POST | `/api/labs/bulk` | Admin | Bulk upsert |

Same pattern for `/api/machines`, `/api/walkthroughs`, `/api/audits`, `/api/gigs`.

`/api/profile` — singleton: GET (public) + PUT (admin).

**List query params:** `?q=search&page=1&limit=20&sort=field&filter=value`

## Environment Variables

```
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://...         # MongoDB Atlas URI
JWT_SECRET=<32+ char random string>
JWT_EXPIRES_IN=7d
CORS_ORIGINS=http://localhost:5173,https://sr7-hub.vercel.app
```

## Local Setup

```bash
npm install
cp .env.example .env   # fill in MONGO_URI + JWT_SECRET
npm run create:admin -- admin@example.com "strongpassword"
npm run dev            # http://localhost:5000
```

## Seed Scripts

Populate the database from the frontend's static data files:

```bash
npm run seed:labs
npm run seed:machines
npm run seed:walkthroughs
npm run seed:audits
npm run seed:fiverr
```

## Deploy

Deployed on **Render** as a Node Web Service. See deployment section in Notion.

Required env vars on Render: `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGINS`, `NODE_ENV=production`.
