# Deployment (Phase 17)

## Honesty note before anything else

**Docker itself is not installed in the sandbox this project was built
in**, so `docker compose up` has not been run or verified end-to-end.
The `docker-compose.yml` and all four `Dockerfile`s were written
carefully and the compose file's YAML syntax was validated, but you
should run `docker compose up --build` yourself and treat this as
untested until you do. If something doesn't build, it's most likely a
small path/dependency issue, not a fundamental design problem - the
same code already runs correctly via `npm run dev` / `python app.py`
(verified extensively throughout this project).

## Environment variables (production)

| Variable | Where | Required | Notes |
|---|---|---|---|
| `MONGODB_URI` | backend | Yes | Point at a real MongoDB (Atlas or self-hosted), not `localhost` |
| `JWT_SECRET` | backend | Yes | Long random string, keep secret |
| `CORS_ORIGIN` | backend | Recommended | Comma-separated list of allowed frontend origins. Defaults to `*` (permissive) if unset - set this explicitly in production |
| `ML_SERVICE_URL` | backend | Yes | Internal URL to ml-service, e.g. `http://ml-service:8001` in Docker |
| `CV_SERVICE_URL` | backend | Yes | Same pattern for cv-service |
| `GENAI_API_KEY` | backend | Optional | Chatbot disabled without it, rest of app unaffected |
| `GENAI_MODEL` | backend | Optional | Defaults to `claude-3-5-haiku-20241022` |
| `VITE_API_BASE_URL` | frontend (build-time) | Yes | Vite bakes this in at build time, not runtime - see note below |

### Important: frontend env vars are build-time, not runtime

Unlike the backend, the frontend is a static build - `VITE_API_BASE_URL`
gets compiled into the JS bundle when you run `npm run build` (or the
Docker build). Changing it later means rebuilding, not just restarting.
In `docker-compose.yml` this is passed as a build `arg` for exactly
this reason.

## Option A: Docker Compose (all services together)

```bash
export JWT_SECRET="$(openssl rand -hex 32)"
export CORS_ORIGIN="https://your-frontend-domain.com"
export VITE_API_BASE_URL="https://your-backend-domain.com"
# export GENAI_API_KEY="sk-..."   # optional

docker compose up --build
```

This starts MongoDB, backend, frontend (nginx-served static build),
ml-service, and cv-service together, wired via the internal Docker
network (services reach each other by service name, e.g.
`http://ml-service:8001`).

**Note:** ml-service's Dockerfile copies whatever is currently in
`ml-service/models/` and `ml-service/data/` into the image. Run
`generate_demo_dataset.py` and `train.py` at least once locally before
building (see `ml-service/README.md`) so there's a model to serve -
otherwise the container starts but `/predict` will report no trained
model available (handled gracefully, per the fallback-modes principle,
but obviously not useful).

## Option B: Deploy services separately

Each service is independently deployable:

- **backend**: any Node hosting (Render, Railway, a VPS with PM2/systemd,
  etc). Needs `MONGODB_URI` pointing at a reachable MongoDB.
- **frontend**: any static host (Vercel, Netlify, S3+CloudFront, or the
  provided nginx Dockerfile). Just needs `VITE_API_BASE_URL` set at
  build time.
- **ml-service / cv-service**: any Python hosting that can run Flask
  (Render, Railway, a VPS). Both are stateless aside from the trained
  model file on disk for ml-service.
- **MongoDB**: MongoDB Atlas free tier is the easiest path if you don't
  want to self-host.

Point the backend's `ML_SERVICE_URL` / `CV_SERVICE_URL` at wherever
those land, and the frontend's `VITE_API_BASE_URL` at wherever the
backend lands.

## HTTPS

Not configured directly in this project - terminate TLS at whatever
reverse proxy or hosting platform you use in front of these services
(nginx with certbot, Caddy, or your hosting platform's built-in HTTPS).
None of the Dockerfiles here listen on 443 directly.

## Logging

The backend logs every request (method, path, status, duration) to
stdout - see `backend/src/app.js`. In production, pipe this to whatever
your host expects (most platforms capture stdout automatically; for a
bare VPS, redirect to a file or use a process manager like PM2 which
handles this).

## Production checklist

- [ ] Real `MONGODB_URI` set (not localhost)
- [ ] Strong random `JWT_SECRET` set
- [ ] `CORS_ORIGIN` set to your actual frontend domain(s), not left as `*`
- [ ] `VITE_API_BASE_URL` set to your actual backend domain at build time
- [ ] ml-service has a trained model in `models/` before deploying
- [ ] HTTPS terminated somewhere in front of all public-facing services
- [ ] `.env` files are NOT committed (already gitignored) and NOT baked
      into any Docker image (only `.env.example` should ever be)
- [ ] First user registration happens in a controlled way, since that
      account becomes admin automatically - don't leave registration
      open to the public before you've claimed the admin account
      yourself
