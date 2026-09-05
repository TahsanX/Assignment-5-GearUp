# API Integration

How this frontend consumes the GearUp backend. Base URL comes from
`NEXT_PUBLIC_API_URL` (e.g. `http://localhost:5000/api`).

Every request goes through `apiFetch` in [`src/lib/api.ts`](src/lib/api.ts), which
unwraps the backend envelope `{ success, message, data, errorDetails }`, attaches
the `Authorization: Bearer <jwt>` header when a session exists, and throws a typed
`ApiError` carrying the HTTP status plus any Zod field issues.

Server state is owned by TanStack Query; the hooks in [`src/hooks/`](src/hooks/)
are the only place endpoints are named.

---

## Endpoint → frontend map

### Auth

| Method | Endpoint | Hook | Consumed by |
|---|---|---|---|
| `POST` | `/auth/register` | `useRegisterMutation` | `app/auth/register/register-form.tsx` |
| `POST` | `/auth/login` | `useLoginMutation` | `app/auth/login/login-form.tsx` |
| `GET` | `/auth/me` | direct `apiFetch` | `providers/auth-provider.tsx` — revalidates the stored token on load and clears stale sessions |

### Public catalogue

| Method | Endpoint | Hook | Consumed by |
|---|---|---|---|
| `GET` | `/gear` | `useGearList` / server `apiFetch` | `app/page.tsx` (featured, ISR 60s), `app/gear/browse-gear.tsx` (filters) |
| `GET` | `/gear/:id` | `useGearItem` / server `apiFetch` | `app/gear/[id]/page.tsx` (ISR 30s), `app/dashboard/provider/gear/[id]/edit` |
| `GET` | `/categories` | `useCategories` | `components/gear/gear-filters.tsx`, `components/dashboard/gear-form.tsx`, admin `category-manager.tsx` |

Supported `/gear` query params: `searchTerm`, `category`, `brand`, `minPrice`,
`maxPrice`. Empty values are stripped before the request; text inputs are
debounced 350 ms.

### Customer

| Method | Endpoint | Hook | Consumed by |
|---|---|---|---|
| `POST` | `/rentals` | `useCreateRental` | `app/gear/[id]/rent-now-panel.tsx` |
| `GET` | `/rentals` | `useMyRentals` | customer overview, `/dashboard/customer/orders` |
| `GET` | `/rentals/:id` | `useRental` | `/orders/[id]`, `/orders/[id]/pay` |
| `GET` | `/payments` | `useMyPayments` | `/dashboard/customer/payments`, overview total |
| `POST` | `/reviews` | `useCreateReview` | `app/dashboard/customer/orders/[id]/review-section.tsx` (only when status is `RETURNED`) |

### Payments

| Method | Endpoint | Hook | Consumed by |
|---|---|---|---|
| `POST` | `/payments/create` | `useCreatePayment` | `/orders/[id]/pay` — returns `paymentUrl`, the browser is then redirected to the SSLCommerz gateway |
| `GET` | `/payments/confirm` | — | Called by SSLCommerz, not by this app. The backend redirects the customer to `FRONTEND_URL/payment-status?transactionId=…&status=…` |

`app/payment-status/` reads those params, invalidates the `rentals` and
`payments` caches, and renders the outcome. `/payment/success` and
`/payment/cancel` forward into the same view.

### Provider

| Method | Endpoint | Hook | Consumed by |
|---|---|---|---|
| `POST` | `/provider/gear` | `useCreateGear` | `/dashboard/provider/gear/new` |
| `PUT` | `/provider/gear/:id` | `useUpdateGear` | `/dashboard/provider/gear/[id]/edit` |
| `DELETE` | `/provider/gear/:id` | `useDeleteGear` | `/dashboard/provider/gear` (confirm dialog) |
| `GET` | `/provider/orders` | `useProviderOrders` | provider overview, `/dashboard/provider/orders` |
| `PATCH` | `/provider/orders/:id` | `useUpdateOrderStatus` | `/dashboard/provider/orders` — optimistic, rolls back on failure |

> The backend has no "list my gear" route, so `useProviderGear` reads `GET /gear`
> and narrows it to the signed-in provider's `providerId`.

### Admin

| Method | Endpoint | Hook | Consumed by |
|---|---|---|---|
| `GET` | `/admin/users` | `useAdminUsers` | `/dashboard/admin/users`, overview |
| `PATCH` | `/admin/users/:id` | `useUpdateUserStatus` | `/dashboard/admin/users` — suspend/activate, optimistic |
| `GET` | `/admin/gear` | `useAdminGear` | `/dashboard/admin/gear`, overview |
| `GET` | `/admin/rentals` | `useAdminRentals` | `/dashboard/admin/rentals`, overview |
| `POST` | `/admin/categories` | `useCreateCategory` | admin overview `category-manager.tsx` |

---

## Auth and route protection

The JWT is stored in a `gearup_token` cookie alongside a `gearup_role` cookie so
[`src/middleware.ts`](src/middleware.ts) can gate routes on the server before any
client JavaScript runs:

- `/dashboard/*` without a token → `/auth/login?redirect=<path>`
- `/dashboard/admin|provider|customer` with the wrong role → `/forbidden`
- `/dashboard` → the signed-in role's home
- `/auth/*` while signed in → the role's dashboard

## Error handling

| Failure | UI |
|---|---|
| Field validation (Zod, 400) | `ApiError.fieldErrors` mapped onto the matching inputs |
| Auth/permission (401/403) | Toast + inline alert; expired tokens clear the session |
| Not found (404) | `not-found.tsx`, or an inline alert inside a dashboard view |
| Network unreachable | `ApiError` with status `0` and a plain-language message |
| Unexpected render error | `error.tsx` with a retry, `global-error.tsx` as the root fallback |

4xx responses are never retried; 5xx retries twice.

## Rental status flow

`PLACED` → provider confirms → `CONFIRMED` → customer pays → `PAID` → provider
marks pickup → `PICKED_UP` → provider marks return → `RETURNED` (review unlocks).
`CANCELLED` is available to the provider while `PLACED` or `CONFIRMED`.
