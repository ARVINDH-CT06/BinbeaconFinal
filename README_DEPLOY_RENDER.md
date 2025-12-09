# Deploying to Render (step-by-step)

This document shows a recommended, minimal workflow to deploy the Binbeacon project to Render with two services: API (Web Service) and Web (Static Site).

Prerequisites
- A Render account
- Repository pushed to GitHub/GitLab
- `package-lock.json` committed (recommended)

Files added in project for Render
- `Dockerfile.api` — builds server bundle and runs `node dist/index.js`.
- `Dockerfile.web` — builds client and serves `dist/public` via `nginx`.
- `render.yaml` — optional Render IaC template for both services.
- `.env.example` — template for environment variables.
- `nginx.conf` — nginx config used by `Dockerfile.web`.

Quick steps (UI method)
1. Remove any committed secrets: delete `server/.env` from the repo and rotate credentials.
2. In Render dashboard, create a new service — type: Web Service — connect to your repository, branch `main`.
   - Set the Dockerfile path to `Dockerfile.api`.
   - In the Environment section, set `MONGODB_URI` (click New Secret) and any other vars.
   - Render will provide a `PORT` value; ensure your server reads `process.env.PORT` (it does).
3. Create a second service — type: Static Site — connect to the same repo/branch:
   - Build Command: `npm ci && npm run build`
   - Publish Directory: `dist/public`
4. (Optional) Alternatively create a second Web Service that uses `Dockerfile.web`.

Quick steps (using `render.yaml`)
1. Add `render.yaml` to repo root (already added).
2. On Render, choose "Create services from render.yaml" and follow prompts.
3. Add `MONGODB_URI` to Render's Dashboard → Environment → Environment Variables / Secrets.

Local testing with Docker Compose
```powershell
docker-compose up --build
```

Security notes
- Do NOT commit `.env` (this repo currently has `server/.env` — remove it and rotate credentials).
- Use Render Secrets for sensitive values.

If you want, I can:
- Add `render.yaml` fields for region/plan/health checks.
- Remove the committed `server/.env` and replace it with a `.env.example` and add `server/.env` to `.gitignore`.
