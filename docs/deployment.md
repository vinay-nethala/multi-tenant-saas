# Deployment Guide

This guide shows recommended deployment steps for production using Docker images and Render (or similar services).

Option A — Render (quick, container-based)
1. Create two services on Render: `frontend` (static or Docker) and `backend` (Docker Web Service).
2. Connect your GitHub repo and set the build commands.

Backend (Render Web Service)
- Build command: `docker build -t registry/render/backend . -f backend/Dockerfile`
- Start command: `docker run -e DATABASE_URL=$DATABASE_URL -e JWT_SECRET=$JWT_SECRET -p 5000:5000 registry/render/backend`
- Environment variables to set on Render:
  - `DATABASE_URL` (e.g. `postgres://user:pass@host:5432/saas_db`)
  - `JWT_SECRET`
  - `FRONTEND_URL` (frontend public URL)
  - `NODE_ENV=production`

Frontend (Render Static Site or Docker)
- If using Docker: build `frontend/Dockerfile` and serve on port 3000.
- If using Static site: build with `npm run build` and point Render static site to the `dist` folder.
- Set env var `VITE_API_URL` to the backend URL.

Option B — Docker Compose on VPS (DigitalOcean droplet)
1. Ensure Docker and docker-compose are installed.
2. Copy `.env` from `.env.example` and populate values.
3. Run:
```bash
docker-compose up -d --build
```
4. Expose ports or use a reverse proxy (Traefik/Nginx) and set SSL (Let's Encrypt).

CI / GitHub Actions (example)
- Create workflow to build and push Docker images to a registry, then trigger deployment on Render or update Compose on VPS.

Notes
- Ensure `DATABASE_URL` points to a managed Postgres instance with persistent storage.
- Replace localhost placeholders in `submission.json` with the real public URLs after deployment.

If you want, I can generate a ready-to-use `render.yaml` and a GitHub Actions workflow for automated builds next.