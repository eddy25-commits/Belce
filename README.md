# Belce

A full online store for **Belce** (Kumasi, Ghana) — watches, sneakers, bracelets,
and clothes, all under one storefront. The owner can upload products (name,
price, description, images, category, stock), and customers can browse, add to
bag, and pay securely in Ghana cedis (GHS) with **Paystack**. Customers can
check out as a guest or create an account for faster checkout next time.

```
belce/
├── api/         Vercel serverless function entry point (thin wrapper around backend/app.js)
├── backend/     The actual Express API — routes, models, Supabase config, etc.
├── frontend/    React (Vite) storefront + admin dashboard
└── vercel.json  Deploys frontend + backend together as ONE Vercel project
```

Frontend and backend deploy together as a **single Vercel project**: the
React app builds to static files, and the Express API runs as a serverless
function under `/api`, both served from the same domain. Locally, they still
run as two separate dev servers (Vite proxies `/api` requests through to the
Express server) so the workflow feels the same either way.

Product photos are stored in **Supabase Storage** (a public `product-images`
bucket). The database is **Supabase Postgres**, and both customer accounts and
the admin login run on **Supabase Auth** — which is also what sends the
account confirmation / password-reset emails.

---

## 1. One-time Supabase setup

You already have a Supabase project connected. Two things need to be done
once, directly in the Supabase dashboard:

### a) Run the database schema

1. Open your project at https://supabase.com/dashboard
2. Go to **SQL Editor → New query**
3. Paste the entire contents of `backend/supabase/schema.sql` and click **Run**

This creates the `products`, `orders`, `delivery_zones`, and `profiles`
tables, sets up Row Level Security policies, creates the `product-images`
storage bucket, and seeds three starter delivery zones (Kumasi, Greater
Accra, Rest of Ghana) — edit or add to these later from the admin panel.

### b) Create your admin login

The `backend/.env` file already has placeholder `ADMIN_EMAIL` /
`ADMIN_PASSWORD` values — edit them to whatever you want your real admin
login to be, then from the `backend` folder run:

```bash
npm install
npm run seed:admin
```

This creates a Supabase Auth user flagged as an admin. You can now log in at
`/admin/login` on the frontend. Re-run this script any time (with a new
password) to reset the admin password.

---

## 2. Running locally

Both `backend/.env` and `frontend/.env` are already filled in with your
Supabase project's URL and keys. You still need to add your **Paystack
secret key** to `backend/.env` (`PAYSTACK_SECRET_KEY`) before payments will
work — get it from https://dashboard.paystack.com/#/settings/developers.

```bash
# Terminal 1 — backend
cd backend
npm install
npm run dev        # http://localhost:5000

# Terminal 2 — frontend
cd frontend
npm install
npm run dev         # http://localhost:5173, proxies /api to :5000
```

Visit `http://localhost:5173` — the frontend's `/api` requests are proxied
straight through to the Express server, matching how it behaves in
production.

---

## 3. Deploying — one Vercel project

1. Push this whole `belce/` folder (repo root, containing `api/`, `backend/`,
   `frontend/`, and `vercel.json`) to a GitHub repo.
2. On [vercel.com](https://vercel.com) → **Add New → Project** → import that
   repo. Leave the **Root Directory** as the repo root (not `frontend`) —
   `vercel.json` at the root already tells Vercel how to build both halves.
3. Add these **Environment Variables** in the Vercel project settings (used
   by the `/api` serverless function):
   - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — from
     Supabase dashboard → Project Settings → API
   - `PAYSTACK_SECRET_KEY` — your **live** Paystack secret key
   - `PAYSTACK_CALLBACK_URL` — set to `https://your-project.vercel.app/payment/callback`
     (or your custom domain) once you know your Vercel URL
   - `NODE_ENV` — `production`
   - Also add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (same values as
     above) — the frontend build reads these at build time. `VITE_API_URL`
     does **not** need to be set in production; it defaults to the relative
     `/api`, which is already same-origin.
4. Deploy. Vercel builds the frontend (per `buildCommand`/`outputDirectory`
   in `vercel.json`) and the `/api` function in the same deploy.

**Important:** the `.env` files in this project currently contain your real
Supabase keys for local development — they're already gitignored, but double
check before pushing to a public GitHub repo, and use Vercel's Environment
Variables settings (not a committed `.env` file) for production values.

Once deployed, add your Vercel URL as a **Redirect URL** in Supabase:
Dashboard → Authentication → URL Configuration, so email confirmation links
work correctly.

---

## 4. Project structure notes

- `backend/app.js` — the actual configured Express app (all middleware and
  routes). `backend/server.js` just imports it and calls `.listen()` for
  local dev; `api/index.js` imports the same app for the Vercel serverless
  function, so there's exactly one copy of the routing logic either way.
- `backend/supabase/schema.sql` — the full database schema. Safe to re-run
  (uses `create table if not exists` / `on conflict do nothing`).
- `backend/config/supabase.js` — the two Supabase clients used server-side
  (`supabaseAdmin` with the service role key bypasses Row Level Security and
  is used for all product/order/delivery-zone reads and writes; never expose
  this key to the frontend).
- `backend/middleware/auth.js` — verifies the Supabase JWT sent from the
  frontend; `requireAdmin` checks the `is_admin` flag in the user's
  `app_metadata` (only settable via the service role key, so customers can
  never grant themselves admin access).
- Frontend auth (`frontend/src/context/AuthContext.jsx`) talks to Supabase
  directly for sign up / sign in / sign out — both for customer accounts and
  the admin login (which is just a Supabase user with `is_admin: true`).
- Checkout supports guests by default; a customer can optionally tick
  "Create an account" during checkout, or sign in beforehand from the navbar,
  in which case their order is linked to their account and shows up on
  `/account`.
