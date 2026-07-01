# Task Tracker — Deployment Guide

Backend: Express + MongoDB, deployed on **Render**.
Frontend: React + Vite, deployed on **Vercel**.
Database: **MongoDB Atlas**.

---

## 1. Backend (Express)

### 1.1 CORS

`server/src/app.js` builds its allowlist from:

- Local dev origins (`http://localhost:5173`, `http://127.0.0.1:5173`) — always allowed.
- `CLIENT_URL` env var — comma-separated list of deployed frontend origins
  (e.g. your Vercel URL, plus any preview URLs).

Requests with no `Origin` header (curl, health checks, server-to-server) are
allowed through; anything else not on the list gets a `403`.

### 1.2 Environment variables

| Variable     | Required | Example                                            | Purpose                              |
|--------------|----------|-----------------------------------------------------|---------------------------------------|
| `PORT`       | yes      | `5000`                                              | Port Express listens on (Render sets its own `PORT`, so this is mainly for local dev) |
| `MONGO_URI`  | yes      | `mongodb+srv://user:pass@cluster.mongodb.net/task-tracker` | MongoDB connection string             |
| `CLIENT_URL` | yes      | `https://your-app.vercel.app`                       | Allowed CORS origin(s), comma-separated |
| `NODE_ENV`   | no       | `production`                                        | Toggles `morgan` request logging (dev-only) |

See `server/.env.example` for the template.

### 1.3 `package.json` scripts

Already in place:

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

- `npm run dev` — local development with auto-restart (nodemon).
- `npm start` — what Render (or any host) runs in production.

### 1.4 Production middleware (`server/src/app.js`)

- **helmet** — sets standard security headers.
- **compression** — gzips responses.
- **morgan("dev")** — only mounted when `NODE_ENV !== "production"`.
- **404 handler** — catches unmatched routes, returns `{ success: false, message: "Route not found" }`.
- **Global error handler** — catches thrown/forwarded errors (including CORS
  rejections) and returns a consistent JSON error shape instead of leaking
  stack traces.

Verified locally: `npm start` boots, connects to MongoDB, serves `/api/health`
with a `200`, rejects disallowed origins with `403`, and returns `404` JSON
for unknown routes.

---

## 2. MongoDB Atlas Setup

1. **Create a free cluster**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign up / log in.
   - Click **Build a Database** → choose the **M0 Free** tier.
   - Pick a cloud provider/region close to your Render region → **Create**.

2. **Create a database user**
   - In **Database Access** (left sidebar) → **Add New Database User**.
   - Choose **Password** auth, set a username/password (save these — you'll
     need them in the connection string).
   - Grant **Read and write to any database** (or scope to `task-tracker`).

3. **Allow network access**
   - In **Network Access** → **Add IP Address**.
   - For Render (which uses dynamic egress IPs on free/standard plans),
     choose **Allow Access from Anywhere** (`0.0.0.0/0`), or add Render's
     static IPs if you're on a plan that provides them.

4. **Get the connection string**
   - Go to **Database** → **Connect** → **Drivers**.
   - Copy the URI, e.g.
     `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   - Add your database name before the `?`: `.../task-tracker?retryWrites=...`

5. **Configure `MONGO_URI`**
   - Set this full string as `MONGO_URI` in Render's environment variables
     (and in your local `server/.env` for testing against Atlas).

---

## 3. Render Deployment (Backend)

1. Go to [dashboard.render.com](https://dashboard.render.com) → **New** → **Web Service**.
2. **Connect your GitHub repository** (authorize Render if prompted, select the `task-tracker` repo).
3. Configure the service:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. **Environment variables** (Render dashboard → Environment):
   - `MONGO_URI` = your Atlas connection string
   - `CLIENT_URL` = your Vercel URL (e.g. `https://your-app.vercel.app`)
   - `NODE_ENV` = `production`
   - `PORT` — you can omit this; Render injects its own `PORT` and Express
     already reads `process.env.PORT`.
5. Click **Create Web Service** and wait for the build/deploy to finish.
6. **Verify deployment**
   - Visit `https://<your-service>.onrender.com/api/health` → expect
     `{"status":"ok","message":"Task Tracker API is running"}`.
   - Check the Render logs for `MongoDB connected: ...` and
     `Server running on http://localhost:<port>`.

---

## 4. Frontend (React / Vite)

### 4.1 `VITE_API_BASE_URL`

`client/src/services/taskService.js` reads `import.meta.env.VITE_API_BASE_URL`
and uses it as the Axios `baseURL`. Vite inlines this value at **build time**,
so it must be set before running `npm run build` (or configured as a Vercel
environment variable, which Vercel applies during its build step).

If the variable is missing, the app falls back to
`http://localhost:5000/api` for local convenience, and logs a `console.error`
so a misconfigured deployment is caught immediately (check the browser
console / Vercel build logs).

### 4.2 Production build

Verified locally:

```bash
cd client
npm run build
```

Produces `dist/` with `index.html` + hashed `assets/*.js` / `*.css`. Confirmed
the built JS contains the correct baked-in API URL from `client/.env`.

### 4.3 Axios and the deployed backend

No frontend code changes are needed to point at production — set
`VITE_API_BASE_URL` to the Render backend URL (e.g.
`https://your-service.onrender.com/api`) in Vercel's project environment
variables, and Axios will use it automatically after the next build.

---

## 5. Vercel Deployment (Frontend)

1. Go to [vercel.com/new](https://vercel.com/new) and **import your GitHub repository**.
2. **Root Directory**: set to `client` (Vercel asks this during import, or set it in Project Settings → General).
3. **Framework Preset**: Vercel auto-detects **Vite** — confirm it's selected.
4. **Build Command**: `npm run build` (default for Vite preset).
5. **Output Directory**: `dist` (default for Vite preset).
6. **Environment Variables** (Project Settings → Environment Variables):
   - `VITE_API_BASE_URL` = `https://your-service.onrender.com/api`
   - Set for **Production** (and **Preview** if you want preview deployments to hit the same or a staging API).
7. Click **Deploy**.
8. **Verify deployment**
   - Open the deployed Vercel URL, open browser dev tools → Network tab.
   - Confirm requests go to `https://your-service.onrender.com/api/tasks` and return `200`.
   - Confirm no CORS errors in the console (if you see one, double-check `CLIENT_URL` on Render matches the exact Vercel URL, including `https://`).

---

## 6. Production Checklist

Backend:
- [ ] `MONGO_URI` points to Atlas, not localhost
- [ ] `CLIENT_URL` matches the exact deployed Vercel origin
- [ ] `NODE_ENV=production` set on Render
- [ ] `/api/health` returns `200` on the deployed URL
- [ ] Unknown routes return `404` JSON, not an HTML error page

Frontend:
- [ ] `VITE_API_BASE_URL` set in Vercel and pointing at the Render backend
- [ ] `npm run build` completes with no errors
- [ ] No hardcoded `localhost` URLs left in the bundle

Functional (test against the deployed app):
- [ ] **Create** — new task appears in the list
- [ ] **Edit** — updates persist after refresh
- [ ] **Delete** — task disappears and stays gone after refresh
- [ ] **Search** — filters the list as expected
- [ ] **Filter** (status/priority) — narrows results correctly
- [ ] **Sort** — reorders the list correctly
- [ ] **Responsive layout** — check mobile/tablet/desktop breakpoints
- [ ] **No console errors** in browser dev tools
- [ ] **No failed network requests** (check Network tab for 4xx/5xx/CORS errors)

---

## 7. Common Deployment Issues and Fixes

| Symptom | Likely Cause | Fix |
|---|---|---|
| Browser console: `blocked by CORS policy` | `CLIENT_URL` on Render doesn't match the Vercel origin exactly (protocol, trailing slash, or wrong URL) | Set `CLIENT_URL` to the exact origin, e.g. `https://your-app.vercel.app` (no trailing slash); redeploy the backend after changing env vars |
| Frontend calls `localhost:5000` in production | `VITE_API_BASE_URL` wasn't set at build time | Set the env var in Vercel *before* the build runs, then trigger a redeploy (Vite bakes it in at build time, not runtime) |
| `MongoServerError: bad auth` | Wrong username/password in `MONGO_URI`, or user not granted access to the DB | Recheck Atlas Database Access user credentials and permissions; regenerate the password if unsure |
| Backend can't reach Atlas / connection times out | Atlas Network Access doesn't allow Render's IP | Add `0.0.0.0/0` in Atlas Network Access (or Render's static IPs if on a paid plan) |
| Render service crashes on boot | Missing/incorrect `Root Directory` (should be `server`) or missing env vars | Confirm Root Directory is `server`, Build Command `npm install`, Start Command `npm start`, and all required env vars are set |
| `404` on every Vercel route except `/` | SPA routing not configured (Vercel usually handles Vite SPA fallback automatically, but custom rewrites can break it) | Ensure no conflicting `vercel.json` rewrites; Vercel's Vite preset handles client-side routing out of the box |
| Works locally, `500` errors in production | Unhandled error now surfaced via the global error handler instead of crashing silently | Check Render logs (`console.error(err.stack)` output) for the actual stack trace |
| Slow first request after idle | Render free tier spins down idle services | Expected on the free tier; first request after inactivity takes a few seconds to cold-start |
