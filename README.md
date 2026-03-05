# Portfolio Backend API

Production-ready Node.js + Express + TypeScript backend for Koustav Paul's portfolio.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Runtime | Node.js 20+ |
| Framework | Express.js + TypeScript |
| Database | PostgreSQL 16 + Prisma ORM |
| Auth | JWT (access 15m + refresh 7d) |
| Validation | Zod |
| Email | Nodemailer (SMTP) |
| File Uploads | Multer + Cloudinary |
| Rate Limiting | express-rate-limit |
| Containerization | Docker + docker-compose |

---

## Project Structure

```
src/
├── config/
│   ├── env.ts            # All environment variables
│   ├── database.ts       # Prisma client singleton
│   └── cloudinary.ts     # Cloudinary configuration
├── middleware/
│   ├── auth.ts           # JWT verification
│   ├── errorHandler.ts   # Centralized error handling
│   ├── rateLimiter.ts    # Global + per-route limiters
│   ├── upload.ts         # Multer + Cloudinary storage
│   └── validate.ts       # Zod request validation
├── modules/
│   ├── admin/
│   │   └── admin.routes.ts   # Login, refresh, me, password
│   ├── contact/
│   │   └── contact.ts        # Submit, list, patch, delete + email template
│   ├── projects/
│   │   ├── projects.service.ts
│   │   ├── projects.controller.ts
│   │   └── projects.routes.ts
│   └── experience/
│       └── index.ts          # Experience, Skills, Config modules
├── utils/
│   ├── response.ts       # Standardized API response helpers
│   └── email.ts          # Nodemailer send wrapper
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed data
├── app.ts                # Express app + middleware stack
└── server.ts             # HTTP server + graceful shutdown
```

---

## Quick Start

### Option A — Local (without Docker)

**1. Prerequisites**
- Node.js 20+
- PostgreSQL running locally

**2. Clone & install**
```bash
git clone https://github.com/Koustav-dev/portfolio-backend
cd portfolio-backend
npm install
```

**3. Environment**
```bash
cp .env.example .env
# Edit .env with your values
```

**4. Database setup**
```bash
# Push schema to your database
npm run db:push

# OR create a proper migration
npm run db:migrate

# Seed with sample data
npm run db:seed
```

**5. Run dev server**
```bash
npm run dev
# Server starts at http://localhost:3001
```

---

### Option B — Docker Compose (recommended)

**1. Copy env**
```bash
cp .env.example .env
# Fill in JWT_SECRET, JWT_REFRESH_SECRET, and other values
```

**2. Start everything**
```bash
docker compose up --build -d
```

**3. Run migrations inside container**
```bash
docker compose exec api npx prisma migrate deploy
docker compose exec api npm run db:seed
```

**4. Check health**
```bash
curl http://localhost:3001/health
```

---

## API Reference

### Base URL
```
http://localhost:3001/api
```

### Response Format
All responses follow this shape:
```json
{
  "success": true,
  "data": {},
  "meta": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 }
}
```
Errors:
```json
{ "success": false, "error": "Descriptive error message" }
```

---

### Public Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/projects` | List projects (`?category=WEB&page=1&limit=10`) |
| GET | `/api/projects/:slug` | Single project |
| GET | `/api/experience` | List all experiences |
| GET | `/api/skills` | Skills grouped by category |
| GET | `/api/config/:key` | Site config (`hero`, `about`, `social`, `resume`) |
| POST | `/api/contact` | Submit contact form |

**Contact form body:**
```json
{
  "name":    "John Doe",
  "email":   "john@example.com",
  "message": "Hi Koustav, I'd love to work with you!"
}
```
Rate limited: 3 requests per IP per hour.

---

### Admin Endpoints (JWT required)

**Authentication:**
```
Authorization: Bearer <accessToken>
```

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/admin/login` | Get access + refresh tokens |
| POST | `/api/admin/refresh` | Refresh access token |
| GET  | `/api/admin/me` | Current admin info |
| PATCH | `/api/admin/password` | Change password |

**Login:**
```json
POST /api/admin/login
{ "email": "hello@eraf.dev", "password": "admin123" }
```
Response:
```json
{
  "success": true,
  "data": {
    "admin": { "id": "...", "email": "...", "name": "Koustav Paul" },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

**Projects CRUD:**
| Method | Route | Body |
|--------|-------|------|
| POST | `/api/projects` | `multipart/form-data` with optional `coverImage` file |
| PATCH | `/api/projects/:id` | Partial update, optional `coverImage` |
| DELETE | `/api/projects/:id` | — |

**Messages:**
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/contact?read=false` | Unread messages |
| PATCH | `/api/contact/:id` | `{ "read": true }` or `{ "starred": true }` |
| DELETE | `/api/contact/:id` | Delete message |

**Config:**
```json
PUT /api/config/hero
{
  "value": {
    "headline": "I craft digital",
    "headlineAccent": "experiences"
  }
}
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✓ | PostgreSQL connection string |
| `JWT_SECRET` | ✓ | Access token signing secret |
| `JWT_REFRESH_SECRET` | ✓ | Refresh token signing secret |
| `ADMIN_EMAIL` | ✓ | Email to receive contact notifications |
| `FRONTEND_URL` | ✓ | CORS allowed origin |
| `PORT` | — | Server port (default: 3001) |
| `SMTP_HOST` | — | Email: SMTP hostname |
| `SMTP_PORT` | — | Email: SMTP port (587 or 465) |
| `SMTP_USER` | — | Email: SMTP username |
| `SMTP_PASS` | — | Email: SMTP password / app password |
| `CLOUDINARY_CLOUD_NAME` | — | Cloudinary: cloud name |
| `CLOUDINARY_API_KEY` | — | Cloudinary: API key |
| `CLOUDINARY_API_SECRET` | — | Cloudinary: API secret |

**Generate JWT secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Seeded Data

After running `npm run db:seed`:

- **Admin:** `hello@eraf.dev` / `admin123` ← **change immediately!**
- **5 projects:** Aura Motion Portfolio, Dev Dashboard, AI Writing Assistant, E-Commerce Platform, Motion UI Kit
- **3 experiences:** Freelance (current), Tech Startup, Digital Agency
- **13 skills** across Frontend, Backend, Design, Tools
- **4 site configs:** `hero`, `about`, `social`, `resume`

---

## Database Commands

```bash
npm run db:generate   # Regenerate Prisma client after schema changes
npm run db:migrate    # Create and apply a new migration
npm run db:push       # Push schema without migration (dev only)
npm run db:seed       # Run seed file
npm run db:studio     # Open Prisma Studio in browser
```

---

## Production Deployment

### Render / Railway / Fly.io
1. Set all env vars in the dashboard
2. Build command: `npm run build && npx prisma generate && npx prisma migrate deploy`
3. Start command: `node dist/server.js`

### VPS (with Docker)
```bash
# Pull and start
docker compose -f docker-compose.yml up -d

# View logs
docker compose logs -f api

# Update after code change
docker compose up --build -d
```

---

## Connecting Frontend

In your React app, set:
```env
VITE_API_URL=http://localhost:3001/api
```

Example fetch:
```ts
const res  = await fetch(`${import.meta.env.VITE_API_URL}/projects`);
const json = await res.json();
// json.data → array of projects
// json.meta → { page, limit, total, totalPages }
```

---

## License
MIT — built by Koustav Paul.
