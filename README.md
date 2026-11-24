# GearUp 🏋️

**"Rent Sports & Outdoor Gear Instantly"**

A full-stack rental marketplace for sports and outdoor equipment. Customers browse gear, book rentals, and pay online; providers manage inventory and fulfil orders; admins moderate the platform. This repo holds both halves of the project as separate, independently deployable apps.

## Repo layout

```
.
├── GearUp-frontend/   Next.js 16 app (App Router) — the UI
└── GearUp-backend/    Node.js + Express + Prisma REST API
```

Each folder is a standalone project with its own `package.json`, `.env.example`, and README — see those for setup details specific to that app.

## Architecture

```
┌─────────────────────┐        REST / JSON over HTTPS        ┌──────────────────────┐
│   GearUp-frontend    │ ───────────────────────────────────▶ │   GearUp-backend      │
│   Next.js 16          │                                      │   Express + Prisma    │
│   - App Router        │ ◀─────────────────────────────────── │   - JWT auth           │
│   - TanStack Query     │          JSON responses              │   - Zod validation     │
│   - Middleware guards  │                                      │   - Role middleware    │
└─────────────────────┘                                      └──────────┬───────────┘
                                                                           │
                                                                           ▼
                                                                ┌──────────────────┐
                                                                │   PostgreSQL       │
                                                                │   (Supabase)       │
                                                                └──────────────────┘
                                                                           │
                                                                           ▼
                                                                ┌──────────────────┐
                                                                │   SSLCommerz       │
                                                                │   (payment gateway)│
                                                                └──────────────────┘
```

- **Frontend** talks to the backend only through `NEXT_PUBLIC_API_URL` — no direct DB access. Role-aware routes (`/dashboard/customer`, `/dashboard/provider`, `/dashboard/admin`) are gated by Next.js Middleware reading the JWT.
- **Backend** exposes a REST API (`/api/auth`, `/api/gear`, `/api/rentals`, `/api/payments`, `/api/provider/*`, `/api/admin/*`, `/api/reviews`), each route protected per role via an `auth()` middleware, with Zod validating every request body.
- **Database**: PostgreSQL on Supabase, accessed through Prisma. Connection goes through Supabase's pooler (transaction pooler for app queries, session pooler for migrations) since the direct host is IPv6-only.
- **Payments**: the backend creates an SSLCommerz sandbox session and redirects the customer there; SSLCommerz calls back `/api/payments/confirm`, which flips the rental order to `PAID`.

## Rental order lifecycle

```
PLACED → CONFIRMED → PAID → PICKED_UP → RETURNED
   │         │                              │
   └─ CANCELLED                      (review unlocked)
```

## Tech stack

| Layer | Choice |
|---|---|
| Frontend framework | Next.js 16 (App Router, Server + Client Components) |
| Frontend state | TanStack Query v5, React Hook Form + Zod |
| Frontend styling | Tailwind CSS v4, dark/light theme |
| Backend framework | Express (ESM) + TypeScript |
| ORM / DB | Prisma + PostgreSQL (Supabase) |
| Auth | JWT (issued by backend, stored in a cookie, verified by frontend middleware and backend `auth()` guards) |
| Payments | SSLCommerz (sandbox) |
| Hosting | Vercel (both apps) |

## Live deployments

| | |
|---|---|
| Frontend | <https://gearup-frontend-black.vercel.app> |
| Backend API | <https://gearup-backend-nine-psi.vercel.app/api> |

## Local development

Run both apps side by side:

```bash
# backend
cd GearUp-backend
npm install
cp .env.example .env   # fill in DATABASE_URL, DIRECT_URL, JWT_SECRET, SSLCommerz keys
npx prisma migrate deploy
npm run seed
npm run dev             # http://localhost:5000

# frontend (separate terminal)
cd GearUp-frontend
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm run dev              # http://localhost:3000
```

Roles are chosen at registration (`CUSTOMER` / `PROVIDER`); an `ADMIN` account is created by the backend's seed script.
