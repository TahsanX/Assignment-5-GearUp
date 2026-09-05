# GearUp — Frontend

**"Rent Sports & Outdoor Gear Instantly"**

A Next.js (App Router) frontend for the GearUp rental platform. Customers browse
and book gear, providers manage inventory and fulfil orders, and admins moderate
the platform — each with a role-specific dashboard.

> Assignment 5 (Frontend). The backend lives in a separate repository and is
> consumed over REST.

---

## Tech stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Server + Client Components) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4, custom design tokens, dark/light mode |
| Server state | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Auth | Custom JWT, stored in a cookie and gated by Next.js Middleware |
| Notifications | Sonner (toasts) |
| Icons | lucide-react |
| Payments | SSLCommerz (hosted gateway redirect) |

---

## Getting started

```bash
npm install
cp .env.example .env.local   # then point it at your backend
npm run dev
```

The app runs on <http://localhost:3000>.

### Environment variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the GearUp backend API, e.g. `http://localhost:5000/api` |

The backend must have `FRONTEND_URL` set to this app's origin so the SSLCommerz
gateway redirects customers back to `/payment-status` after checkout.

---

## Test credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@gearup.com` | `Admin@12345` |
| Provider | `provider@gearup.com` | `Provider@12345` |
| Customer | `customer@example.com` | `Customer@12345` |

---

## Routes

### Public
| Route | Purpose |
|---|---|
| `/` | Landing page with featured gear |
| `/gear` | Browse with search, category, brand and price filters |
| `/gear/[id]` | Gear details, gallery, reviews and the "Rent Now" date picker |
| `/auth/login` | Sign in |
| `/auth/register` | Register as a Customer or Provider |

### Customer
| Route | Purpose |
|---|---|
| `/dashboard/customer` | Overview and recent rentals |
| `/dashboard/customer/orders` | Rental history with status filter |
| `/dashboard/customer/orders/[id]` | Order detail and post-return review form |
| `/dashboard/customer/orders/[id]/pay` | Checkout, redirects to SSLCommerz |
| `/dashboard/customer/payments` | Payment history |

### Provider
| Route | Purpose |
|---|---|
| `/dashboard/provider` | Inventory and order overview |

### Payment
| Route | Purpose |
|---|---|
| `/payment-status` | Gateway return page (the backend redirects here) |
| `/payment/success`, `/payment/cancel` | Aliases forwarding to `/payment-status` |

---

## Architecture notes

- **Auth** — the JWT is written to a `gearup_token` cookie (alongside a
  `gearup_role` cookie) so `src/middleware.ts` can gate `/dashboard/*` on the
  server before any client JavaScript runs. `AuthProvider` revalidates the token
  against `/auth/me` on load and clears stale sessions.
- **Errors** — `apiFetch` unwraps the backend's `{ success, message, errorDetails }`
  envelope and throws a typed `ApiError`. Zod field issues are mapped back onto
  the matching form inputs; everything else surfaces as a toast plus an inline
  alert.
- **Loading** — every data view has a matching skeleton rather than a spinner.
- **Optimistic updates** — provider order-status changes and admin
  suspend/activate apply immediately and roll back if the request fails.

---

## Scripts

```bash
npm run dev     # start the dev server
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint
```
