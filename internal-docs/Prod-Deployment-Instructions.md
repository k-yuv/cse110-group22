# Production Deployment Instructions

What has to happen to take this project from "runs in Docker on our laptops" to "running in production." None of this is done yet. Most of it is one-time setup in web dashboards; after that, merging into `main` deploys automatically.

## Where things run

| Piece | Development | Production |
| --- | --- | --- |
| Frontend (React + Vite) | Docker, `http://localhost:5173` | Vercel project #1 (static build) |
| Backend (Express) | Docker, `http://localhost:3000` | Vercel project #2 (serverless functions) |
| Database (Postgres) | Docker, `app_db` | Supabase |
| Migrations | Applied when `npm run dev` starts | The `migrate` job in `.github/workflows/ci.yml`, on every push to `main` |

## What is already in the code

You don't need to change any code to deploy. These pieces are already in place:

- **`frontend/vite.config.ts`** stops a production build if `VITE_API_URL` is missing, so a deployed frontend can't silently call `localhost`.
- **`backend/src/config/database.ts`** uses TLS and a pool of 1 connection when `NODE_ENV=production` (right for serverless).
- **`backend/src/app.ts`** reads allowed CORS origins from `FRONTEND_URL`. It takes a comma-separated list, and `*` works as a wildcard so preview URLs can be allowed.
- **`.github/workflows/ci.yml`** has a `migrate` job that runs on `main` after the tests pass. It skips itself until the `PRODUCTION_DATABASE_URL` secret exists.

## Who needs what access

- **GitHub repo admin** (`k-yuv`, or someone they make admin) for secrets and branch protection.
- **Supabase account**, ideally owned by a shared or team email, not one person's.
- **Vercel account** that can see the GitHub repo. The repo owner may need to grant the Vercel GitHub app access to it.

---

## Step 1: Create the production database (Supabase)

1. In Supabase, click **New project** and pick a region close to the Vercel region (default: US East).
2. Save the database password somewhere the team can get to it (a shared password manager, not the repo).
3. Click **Connect** in the top bar. You need two connection strings from there:
   - **Session pooler** (port `5432`) is for migrations.
   - **Transaction pooler** (port `6543`) is for the deployed backend; it's built for serverless.

   Replace `[YOUR-PASSWORD]` in each with the real password.

Never commit these URLs. They go only into GitHub secrets and Vercel environment variables.

## Step 2: Let CI run migrations against production

1. In GitHub, go to **Settings → Secrets and variables → Actions → New repository secret**:
   - Name: `PRODUCTION_DATABASE_URL`
   - Value: the **session pooler** URL from Step 1
2. Create the tables for the first time: go to **Actions → CI → Run workflow**, pick `main`, and run it.
3. Open the `migrate` job's log. It should list each migration it applied (e.g. `001_create_notes`). If it says "PRODUCTION_DATABASE_URL secret is not set", the secret's name is wrong.
4. In Supabase's **Table Editor**, confirm the `notes` table (and the `pgmigrations` bookkeeping table) now exist.

## Step 3: Deploy the backend (Vercel project #2)

1. In Vercel, go to **Add New → Project** and import the repo.
2. Set **Root Directory** to `backend`. Vercel should detect Express from `src/app.ts` / `src/server.ts`. If it doesn't, ask in the team channel before adding config files.
3. Under **Environment Variables**, add these for **Production** and **Preview**:

   | Name | Value |
   | --- | --- |
   | `DATABASE_URL` | the **transaction pooler** URL from Step 1 |
   | `NODE_ENV` | `production` |
   | `FRONTEND_URL` | leave blank for now; it's set in Step 5 |

4. Deploy, then open `https://<backend-url>/api/health`. It should return `{"status":"ok"}`.
5. Open `https://<backend-url>/api/notes`. It should return `[]` (or rows). A 500 here means the database connection or migrations are wrong; check the function logs under **Logs** in Vercel.

## Step 4: Deploy the frontend (Vercel project #1)

1. Go to **Add New → Project** and import the **same repo** again.
2. Set **Root Directory** to `frontend`. The framework preset should say **Vite**.
3. Add an environment variable for **Production** and **Preview**:

   | Name | Value |
   | --- | --- |
   | `VITE_API_URL` | the backend URL from Step 3, with no trailing slash |

4. Deploy and copy the frontend's production URL.

`VITE_API_URL` is baked in at build time. If you change it later, you have to **redeploy** the frontend for the change to take effect.

## Step 5: Connect the two (CORS)

The backend rejects browser requests from origins it doesn't know, so give it the frontend's URLs.

1. Open any preview deployment of the frontend to see what preview URLs look like, e.g. `https://cse110-group22-frontend-a1b2c3-team.vercel.app`. Replace the random part with `*`.
2. In the backend project, go to **Settings → Environment Variables** and set `FRONTEND_URL` to the production URL and the preview pattern, comma-separated:
   ```
   https://<frontend-prod-url>,https://cse110-group22-frontend-*-team.vercel.app
   ```
3. Redeploy the backend (**Deployments → ⋯ → Redeploy**). Environment variable changes only apply to new deployments.
4. Open the frontend's production URL and create a note. If the browser console shows a CORS error, the origin it names doesn't match `FRONTEND_URL` exactly. Check for `https`, typos, or a trailing slash.

**Note:** previews use the **production** backend and database, so testing on a preview link writes real data. If that becomes a problem, create a second Supabase project and point the backend's **Preview** `DATABASE_URL` at it.

## Step 6: Protect `main` (repo admin)

This is what makes "merge = deploy" safe.

1. Make sure CI has run at least once, so GitHub knows the check names.
2. Go to **Settings → Branches → Add branch ruleset**, targeting the default branch:
   - **Require a pull request before merging**, with 1 approval
   - **Require status checks to pass**: add `frontend` and `backend`
   - **Block force pushes**
3. Save. Direct pushes to `main` are now rejected.

## Step 7: Smoke test the whole pipeline

1. Open a small PR (e.g. a text change). Confirm that CI runs and Vercel comments with preview links.
2. Get it approved and merge it.
3. On the `main` CI run, confirm that `frontend`, `backend` and `migrate` all pass.
4. Confirm that Vercel shows new production deployments for both projects and the live site shows the change.

---

## After setup: how a change reaches production

```
PR opened -> CI (frontend + backend) + Vercel preview -> approval -> merge
  -> CI on main -> migrate job (production DB)
  -> Vercel deploys frontend + backend (at the same time as the migrate job)
```

Because Vercel deploys **at the same time as** the migrate job, not after it, the new code can go live a minute before its migration runs. To keep that safe:

- **Migrations must be additive:** new tables, or new columns that are nullable or have a default.
- **Don't rename or drop** a column in the same PR as the code that stops using it. Ship the code change first, then drop the column in a later PR.
- **Never edit a migration that's already merged.** Write a new one.

## If production breaks

- **Bad code:** on GitHub, open the merged PR, click **Revert**, and merge the revert PR. That redeploys the previous code. For an instant fix while you do that, Vercel's **Deployments → ⋯ → Promote to Production** on the last good deployment works too.
- **Bad migration:** reverting code does **not** undo a migration. Write a new migration that fixes it, and merge it like any other PR.
- **Migrate job failed:** fix the cause, then re-run it from **Actions → CI → Run workflow** on `main`.

## Checklist

- [ ] Supabase project created; password stored in the team password manager
- [ ] `PRODUCTION_DATABASE_URL` GitHub secret set (session pooler URL)
- [ ] Migrations applied once via **Run workflow**; tables visible in Supabase
- [ ] Backend Vercel project: `DATABASE_URL` (transaction pooler), `NODE_ENV`; `/api/health` returns ok
- [ ] Frontend Vercel project: `VITE_API_URL`
- [ ] Backend `FRONTEND_URL` set to the production URL and preview pattern; backend redeployed
- [ ] Creating a note works on the live site
- [ ] Branch ruleset on `main` (1 approval, `frontend` and `backend` checks)
- [ ] Smoke-test PR merged and deployed end to end
