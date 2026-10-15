# SR7 Hub — Backend API

The backend REST API for **SR7 Hub**, a personal cybersecurity portfolio and content platform by Shihan Chowdhury.

Built with Node.js, Express, and MongoDB, the API powers the public content pages and administrative interface for managing web security lab writeups, machine walkthroughs, WordPress audit reports, and freelance service information.

**Live API:** https://sr7-hub-backend.onrender.com/api  
**Health Check:** https://sr7-hub-backend.onrender.com/api/health  
**Frontend:** https://sr7-hub.vercel.app  
**Frontend Repository:** https://github.com/SR-Chowdhury/sr7-hub

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [API Endpoints](#api-endpoints)
- [Query Parameters](#query-parameters)
- [Authentication and Authorization](#authentication-and-authorization)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Database Seeding](#database-seeding)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Security and Responsible Use](#security-and-responsible-use)
- [Related Project](#related-project)
- [Author](#author)
- [License](#license)

## Features

- **REST API:** endpoints for labs, machines, walkthroughs, audits, gigs, and Fiverr profile information.
- **JWT Authentication:** token-based authentication for administrative access.
- **Role-Based Authorization:** administrative operations protected by backend authorization middleware.
- **Generic CRUD Factory:** shared controller logic for common content-management operations.
- **Login Rate Limiting:** limits repeated login attempts.
- **Search and Pagination:** list endpoints support text search, pagination, sorting, and filtering.
- **Case-Insensitive Filtering:** supports case-insensitive exact-match filters where configured.
- **Bulk Upsert:** supports administrative bulk content imports and updates.
- **MongoDB Integration:** Mongoose models define the application's data structures.
- **Security Middleware:** Helmet, CORS configuration, and other middleware support application security and operational behavior.

## Technology Stack

| Technology | Layer | Purpose |
|---|---|---|
| Node.js | Runtime | JavaScript runtime environment |
| Express | HTTP | HTTP server and REST API framework |
| MongoDB | Database | Document database |
| Mongoose | ODM | Object modeling and database access |
| JSON Web Tokens (JWT) | Auth | Stateless authentication tokens |
| bcryptjs | Auth | Password hashing |
| Helmet | Security | HTTP security headers |
| CORS | Security | Cross-origin request configuration |
| compression | Performance | Response compression |
| express-rate-limit | Security | Request rate limiting |

## Architecture

The backend is maintained in a separate repository from the React frontend.

```text
┌─────────────┐      HTTPS      ┌─────────────┐      TCP      ┌─────────────┐
│   Vercel    │ ─────────────── │   Render    │ ────────────  │  MongoDB    │
│ (Frontend)  │                 │  (Backend)  │               │   (Atlas)   │
└─────────────┘                 └─────────────┘               └─────────────┘
```

Request flow inside the backend:

```text
HTTP Request
     |
     v
Express Application
     |
     +---- CORS + Helmet + compression middleware
     |
     +---- Rate limiter (login route)
     |
     +---- JWT authentication middleware
     |
     +---- Route handler
     |
     +---- CRUD controller
     |
     v
Mongoose Model
     |
     v
MongoDB (Atlas)
```

The frontend sends HTTP requests to this API. The backend processes requests, applies the relevant authentication and authorization checks, validates or handles input, and interacts with MongoDB through Mongoose.

The API is deployed on Render, while the frontend is deployed separately on Vercel.

## API Endpoints

All routes below are relative to the API base URL:

```text
https://sr7-hub-backend.onrender.com/api
```

### System and Authentication

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/health` | Public | Health check |
| POST | `/auth/login` | Public, rate-limited | Authenticate and obtain a JWT |
| GET | `/auth/me` | Authenticated | Retrieve the current user's information |

### Content Management

The following table describes the documented endpoint pattern for the labs collection. Equivalent CRUD patterns are used for other content collections where configured.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/labs` | Public | List labs with supported query parameters |
| GET | `/labs/:id` | Public, subject to publication rules | Retrieve a lab by ID or slug |
| POST | `/labs` | Admin | Create a lab |
| PATCH | `/labs/:id` | Admin | Update a lab |
| DELETE | `/labs/:id` | Admin | Delete a lab |
| POST | `/labs/bulk` | Admin | Bulk upsert labs |

The API also provides content endpoints for:

- `/machines` — Hack The Box machine records
- `/walkthroughs` — VulnHub walkthroughs
- `/audits` — WordPress audit reports
- `/gigs` — freelance service listings

### Profile

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/profile` | Public | Retrieve profile information |
| PUT | `/profile` | Admin | Update profile information |

Consult the corresponding route definitions for the exact behavior and access requirements of each resource.

## Query Parameters

List endpoints support the following documented query parameters, where applicable:

| Parameter | Example | Purpose |
|---|---|---|
| `q` | `?q=authentication` | Text search across configured fields |
| `page` | `?page=2` | Select a page |
| `limit` | `?limit=20` | Set the requested page size |
| `sort` | `?sort=title` | Select a sort field |
| *resource filters* | `?difficulty=Apprentice` | Apply a resource-specific filter |

Example request:

```http
GET /api/labs?q=authentication&page=1&limit=20
```

Supported filters, sort fields, default values, and maximum page sizes depend on the endpoint implementation. See each route file in `src/routes/` for the exact configuration of each resource.

## Authentication and Authorization

The admin interface uses JWT-based authentication.

The general authentication flow is:

1. The client submits login credentials to `POST /auth/login`.
2. The backend validates the credentials.
3. On successful authentication, the client receives a JWT.
4. Authenticated requests include the token using the configured authentication mechanism.
5. The backend verifies the token and checks authorization before permitting protected operations.

Administrative access is enforced by backend middleware, not merely by frontend route protection.

**Security considerations:**

- Use a strong, randomly generated JWT secret.
- Never commit production credentials or secrets.
- Keep administrative accounts restricted to authorized users.
- Validate and constrain client-supplied data before database writes.
- Review public access to unpublished content.
- Apply appropriate request limits and error handling.
- Rotate any secret that has been exposed.

## Project Structure

```text
src/
├── config/           # Environment and database configuration
│   ├── env.js
│   └── db.js
├── controllers/      # CRUD factory and controller logic
│   └── crudFactory.js
├── middleware/       # Authentication and error handling
│   ├── auth.js
│   └── error.js
├── models/           # Mongoose schemas and models
├── routes/           # Express route definitions
├── utils/            # Shared helpers and utilities
├── app.js            # Express application setup
└── server.js         # Server entry point

scripts/              # Database seeding and admin creation scripts
```

## Getting Started

### Prerequisites

- **Node.js 20+** (tested on Node.js 22.x)
- npm
- MongoDB running locally **or** an accessible MongoDB Atlas database

### 1. Clone the repository

```bash
git clone https://github.com/SR-Chowdhury/sr7-hub-backend.git
cd sr7-hub-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

Configure the values in `.env`:

```dotenv
NODE_ENV=development
PORT=5000

# Local MongoDB:  mongodb://localhost:27017/sr7hub
# MongoDB Atlas:  mongodb+srv://<user>:<password>@cluster.xxxxx.mongodb.net/sr7hub?retryWrites=true&w=majority
MONGO_URI=mongodb://localhost:27017/sr7hub

# Use a long random string (32+ characters) in production
JWT_SECRET=change-me-to-a-long-random-string-at-least-32-chars
JWT_EXPIRES_IN=7d

# Comma-separated list of allowed frontend origins (no spaces)
CORS_ORIGINS=http://localhost:5173
```

Set `MONGO_URI` to your database connection string and `JWT_SECRET` to a strong, randomly generated secret.

For production, configure the equivalent variables in Render's environment settings. Use the production frontend origin in `CORS_ORIGINS`.

> **Security warning:** never commit `.env` or real credentials to Git. The values above are configuration placeholders, not working secrets.

### 4. Create an administrator

Use the repository's configured script to create an authorized admin account:

```bash
npm run create:admin -- admin@example.com "replace-with-a-strong-password" "Your Name"
```

Arguments:

- `email` — the admin's email address (used as the login username)
- `password` — a strong password (min 8 characters; longer is better)
- `name` — a display name (optional; defaults to `"Admin"`)

Replace the example values with your own. Do not use a real password in documentation, screenshots, or committed scripts.

There is no public signup flow documented for administrative users.

### 5. Start the development server

```bash
npm run dev
```

The local API is expected to run at:

```text
http://localhost:5000
```

Check the health endpoint:

```text
http://localhost:5000/api/health
```

Expected response:

```json
{ "status": "ok", "uptime": 12.5, "ts": "2026-10-14T12:00:00.000Z" }
```

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with nodemon (auto-restart on changes) |
| `npm start` | Start production server |
| `npm run create:admin` | Create or update an admin user |
| `npm run seed:labs` | Seed PortSwigger labs from frontend data |
| `npm run seed:machines` | Seed HTB machines |
| `npm run seed:walkthroughs` | Seed VulnHub walkthroughs |
| `npm run seed:audits` | Seed WordPress audits |
| `npm run seed:fiverr` | Seed Fiverr gigs and profile |

## Database Seeding

The repository provides scripts for importing initial content from the frontend's static data files.

Run the relevant script when you intentionally want to seed or update the corresponding data:

```bash
npm run seed:labs
npm run seed:machines
npm run seed:walkthroughs
npm run seed:audits
npm run seed:fiverr
```

> **Note:** Seed scripts use `updateOne` with `upsert: true` — they create records if missing and update if they exist. Running them multiple times is safe; they won't create duplicates. Each record is matched by its `slug` field.

**When pointing at a production database**, review the script implementation and the target `MONGO_URI` before running. Bulk upserts can update existing records.

## Environment Variables

| Variable | Purpose |
|---|---|
| `NODE_ENV` | Runtime environment (`development` or `production`) |
| `PORT` | HTTP server port (default `5000`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used for JWT signing and verification |
| `JWT_EXPIRES_IN` | JWT expiration setting (e.g. `7d`) |
| `CORS_ORIGINS` | Comma-separated list of allowed frontend origins |

Use development-specific values locally and production-specific values in Render. Do not expose private backend variables through the frontend's `VITE_` configuration — `VITE_*` variables are embedded in the browser bundle and are public.

## Deployment

The API is deployed on **Render** as a Node.js web service.

**Build command:**

```bash
npm install
```

**Start command:**

```bash
npm start
```

Configure the required environment variables in the Render dashboard:

- `MONGO_URI` — production MongoDB Atlas connection string
- `JWT_SECRET` — strong random string (32+ characters)
- `JWT_EXPIRES_IN` — e.g. `7d`
- `CORS_ORIGINS` — comma-separated list including the production frontend URL
- `NODE_ENV` — `production`

**Deployment checklist:**

1. MongoDB Atlas cluster is running and reachable (`0.0.0.0/0` allowed on the network access list).
2. Database has been seeded with the production data.
3. Admin user has been created against the production database.
4. `CORS_ORIGINS` includes the deployed frontend origin (with `https://` prefix, no trailing slash).
5. Render health check `/api/health` returns `{"status":"ok"}`.

> **Note on Render's free tier:** The service spins down after 15 minutes of inactivity. The first request after a spin-down takes 20–30 seconds to wake the service. Subsequent requests are fast until the next idle period.

## Security and Responsible Use

This API supports a cybersecurity learning and portfolio platform. Security testing should only be performed against systems you own or have explicit authorization to assess.

Do not publish credentials, confidential client data, private audit findings, or other sensitive information in public records or repository documentation.

Security controls should be validated through code review and testing. The presence of authentication middleware, security headers, or rate limiting alone does not establish that the application is secure.

## Related Project

**SR7 Hub Frontend:** https://github.com/SR-Chowdhury/sr7-hub  
**Live Portfolio:** https://sr7-hub.vercel.app

## Author

**Shihan Chowdhury (SR7)**

- Portfolio: https://sr7-hub.vercel.app
- GitHub: https://github.com/SR-Chowdhury

## License

**Source code:** MIT License — free to use, modify, and distribute with attribution.

**Content** (writeups, walkthroughs, audit reports, and other documentation published through this API): © Shihan Chowdhury. All rights reserved. Not for redistribution.