# AI Creator Studio

Phase 1 through Phase 14 setup for AI Creator Studio.

## Stack
- Backend: NestJS + TypeScript
- Frontend: Next.js (App Router) + TypeScript + Tailwind CSS
- Database: PostgreSQL (Docker Compose) + Prisma ORM
- Auth: JWT + bcrypt (NestJS)
- AI Foundation: provider-based AI module with mock provider

## Prerequisites
- Node.js 25+
- npm 11+
- Docker + Docker Compose

## Project Structure
- `backend/` - NestJS API
- `frontend/` - Next.js web app
- `docker-compose.yml` - Docker orchestration for frontend, backend, postgres, redis
- `.env.docker.example` - Docker environment template

## Setup
1. Install dependencies from the repo root:

```bash
npm install
```

2. Copy environment templates:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. Generate Prisma Client:

```bash
npm run prisma:generate --workspace backend
```

## Run
1. Start local infra services (PostgreSQL + Redis):

```bash
docker compose up -d postgres redis
```

2. Run backend (http://localhost:3000):

```bash
npm run dev:backend
```

3. Run frontend (http://localhost:3001):

```bash
npm run dev:frontend
```

### Dockerized Full App (Phase 13)
Use this flow to run frontend + backend + postgres + redis together.

1. Prepare Docker env:

```bash
cp .env.docker.example .env
```

2. Build and start services:

```bash
docker compose up --build -d
```

3. Check service status:

```bash
docker compose ps
```

4. Useful logs/debug commands:

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
docker compose logs -f redis
```

Docker endpoints:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:4000`
- Backend health: `http://localhost:4000/health`
- Postgres: `localhost:5432`
- Redis: `localhost:6379`

Notes:
- Backend runs Prisma migrations automatically on container startup using `prisma migrate deploy`.
- Manual fallback if needed:

```bash
docker compose exec backend npm run prisma:migrate:deploy --workspace backend
```
- If port `3000` or `4000` is already in use on your machine, change `FRONTEND_PORT` and/or `BACKEND_PORT` in `.env` before running compose.
- To use OpenAI in Docker, set `AI_PROVIDER=openai` and `OPENAI_API_KEY=...` in root `.env` before running compose.
- Redis is provisioned in Phase 13 as infrastructure and is not yet used by application logic.

### Prisma Migration (Phase 2)
Run the initial migration:

```bash
npm run prisma:migrate:dev --workspace backend -- --name init_phase2_database
```

Optional Prisma commands:

```bash
npm run prisma:migrate:deploy --workspace backend
npm run prisma:studio --workspace backend
npm run prisma:seed --workspace backend
```

### AI Provider (Phase 5 + Phase 14)
Set AI provider in backend env:

```bash
AI_PROVIDER=mock
```

Mock mode:
- `AI_PROVIDER=mock`
- no real OpenAI/Gemini/Ollama API calls are made
- AI outputs are deterministic mock responses for local development

OpenAI mode:

```bash
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-key
OPENAI_MODEL=gpt-5.4-mini
OPENAI_TIMEOUT_MS=30000
```

OpenAI notes:
- `OPENAI_API_KEY` is backend-only; never add it to `frontend/.env` or any `NEXT_PUBLIC_*` variable.
- Real AI generation uses OpenAI structured JSON output and validates the response before saving.
- If `AI_PROVIDER=openai` is selected without `OPENAI_API_KEY`, generation endpoints return a safe service-unavailable error.
- If OpenAI times out or returns invalid structured data, the app returns a safe fallback error message instead of exposing provider details.
- Switch back to local mock generation with `AI_PROVIDER=mock`.

### Frontend Auth Flow (Phase 10)
Set backend CORS origin in `backend/.env`:

```bash
CORS_ORIGIN=http://localhost:3001
```

Set frontend API URL in `frontend/.env`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Frontend routes:
- `/` public landing page
- `/login` sign in form
- `/register` sign up form
- `/dashboard` protected route

Behavior:
- successful login stores JWT in `localStorage`
- app hydrates auth state on load by calling `GET /auth/me`
- invalid/expired token is cleared and user is redirected to `/login`
- logout clears token and returns user to login page

Manual flow test:
1. Open `http://localhost:3001/register` and create an account.
2. Login at `http://localhost:3001/login`.
3. Confirm redirect to `http://localhost:3001/dashboard`.
4. Refresh dashboard and confirm session remains active.
5. Click Logout and confirm redirect to login.

### Frontend Projects Flow (Phase 11)
Protected frontend routes:
- `/projects` list owned projects
- `/projects/new` create project
- `/projects/<PROJECT_ID>` view, edit, delete project

Behavior:
- routes are protected and redirect to `/login` when logged out
- create uses backend `POST /projects` and redirects to detail page
- detail page supports inline edit (Save/Cancel) and delete with confirmation
- backend `404` for unknown/non-owned project is shown as safe not-found message

Manual flow test:
1. Open `http://localhost:3001/projects` while logged in.
2. Click `New Project`, create a project, and confirm redirect to detail page.
3. Edit fields on detail page and save.
4. Delete project from detail page and confirm redirect back to list.
5. Logout and open `/projects` again to verify redirect to `/login`.

### Frontend AI Workflow (Phase 12)
Protected frontend routes:
- `/projects/<PROJECT_ID>/ideas` generate and list ideas
- `/ideas/<IDEA_ID>` idea detail + workflow entry
- `/ideas/<IDEA_ID>/script` generate and view script
- `/ideas/<IDEA_ID>/seo` generate and view SEO metadata
- `/ideas/<IDEA_ID>/thumbnail` generate and view thumbnail prompt

Behavior:
- forms stay simple and generation happens with existing backend APIs
- pages show loading while fetching and clear empty states before first generation
- generation shows in-progress state and renders saved result on the same page
- ownership/not-found cases show safe error messaging

Manual flow test:
1. Login and create a project in `/projects/new`.
2. Open `/projects/<PROJECT_ID>/ideas` and generate ideas.
3. Open one idea at `/ideas/<IDEA_ID>`.
4. Generate script from `/ideas/<IDEA_ID>/script`.
5. Generate SEO from `/ideas/<IDEA_ID>/seo`.
6. Generate thumbnail prompt from `/ideas/<IDEA_ID>/thumbnail`.

### Video Ideas API (Phase 6)
Generate and save video ideas:

```bash
curl -X POST http://localhost:3000/ai/video-ideas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "projectId": "<PROJECT_ID>",
    "tone": "Beginner friendly",
    "count": 5
  }'
```

Notes:
- `count` defaults to `5` when omitted.
- `count` is clamped to `1..10`.
- Ideas are generated with mock AI and saved to database.

List ideas for a project:

```bash
curl http://localhost:3000/projects/<PROJECT_ID>/video-ideas \
  -H "Authorization: Bearer $TOKEN"
```

Update a video idea:

```bash
curl -X PATCH http://localhost:3000/video-ideas/<VIDEO_IDEA_ID> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Backend Roadmap for Beginners",
    "hook": "Start with the wrong stack and you lose months.",
    "status": "DRAFT"
  }'
```

Delete a video idea:

```bash
curl -i -X DELETE http://localhost:3000/video-ideas/<VIDEO_IDEA_ID> \
  -H "Authorization: Bearer $TOKEN"
```

Cross-user project or idea access is hidden (expected `404`).

### Script API (Phase 7)
Generate or regenerate script for a video idea (upsert behavior):

```bash
curl -X POST http://localhost:3000/ai/script \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "videoIdeaId": "<VIDEO_IDEA_ID>",
    "duration": "5 minutes",
    "tone": "Beginner friendly",
    "language": "English"
  }'
```

Upsert policy:
- If no script exists for the video idea, it creates one.
- If a script already exists, it regenerates and updates it (no `409` conflict).

Get script by video idea:

```bash
curl http://localhost:3000/video-ideas/<VIDEO_IDEA_ID>/script \
  -H "Authorization: Bearer $TOKEN"
```

Update script manually:

```bash
curl -X PATCH http://localhost:3000/scripts/<SCRIPT_ID> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "hook": "Stop guessing your first architecture decisions.",
    "intro": "Today we map a clean backend plan from zero.",
    "mainContent": "Step 1 ... Step 2 ... Step 3 ...",
    "conclusion": "Consistency and iteration beat perfection.",
    "cta": "Subscribe for weekly backend workflows.",
    "duration": "6 minutes",
    "tone": "Practical"
  }'
```

Delete script:

```bash
curl -i -X DELETE http://localhost:3000/scripts/<SCRIPT_ID> \
  -H "Authorization: Bearer $TOKEN"
```

Cross-user script access is hidden (expected `404`).

### SEO API (Phase 8)
Generate or regenerate SEO metadata for a video idea (upsert behavior):

```bash
curl -X POST http://localhost:3000/ai/seo \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "videoIdeaId": "<VIDEO_IDEA_ID>",
    "targetKeyword": "Docker for Java developers"
  }'
```

Upsert policy:
- If no SEO metadata exists for the video idea, it creates one.
- If SEO metadata already exists, it regenerates and updates it (no `409` conflict).

Get SEO metadata by video idea:

```bash
curl http://localhost:3000/video-ideas/<VIDEO_IDEA_ID>/seo \
  -H "Authorization: Bearer $TOKEN"
```

Update SEO metadata manually:

```bash
curl -X PATCH http://localhost:3000/seo/<SEO_ID> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Docker for Java Developers: Complete Beginner Guide",
    "description": "Practical Docker workflow for Java developers from local setup to deployment.",
    "tags": ["docker for java developers", "java docker tutorial", "backend devops"],
    "hashtags": ["#DockerForJavaDevelopers", "#JavaBackend", "#DevOps"],
    "seoScore": 90
  }'
```

Delete SEO metadata:

```bash
curl -i -X DELETE http://localhost:3000/seo/<SEO_ID> \
  -H "Authorization: Bearer $TOKEN"
```

Cross-user SEO metadata access is hidden (expected `404`).

### Thumbnail API (Phase 9)
Generate or regenerate thumbnail prompt details for a video idea (upsert behavior):

```bash
curl -X POST http://localhost:3000/ai/thumbnail \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "videoIdeaId": "<VIDEO_IDEA_ID>",
    "style": "modern tech YouTube thumbnail"
  }'
```

Upsert policy:
- If no thumbnail prompt exists for the video idea, it creates one.
- If a thumbnail prompt already exists, it regenerates and updates it (no `409` conflict).

Get thumbnail prompt by video idea:

```bash
curl http://localhost:3000/video-ideas/<VIDEO_IDEA_ID>/thumbnail \
  -H "Authorization: Bearer $TOKEN"
```

Update thumbnail prompt manually:

```bash
curl -X PATCH http://localhost:3000/thumbnails/<THUMBNAIL_ID> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "text": "DOCKER FOR JAVA DEVS",
    "backgroundIdea": "Dark terminal scene with neon accent lighting",
    "mainObject": "Presenter pointing at a Docker container flow",
    "style": "modern tech YouTube thumbnail + clean modern infographic",
    "prompt": "YouTube thumbnail, modern tech style, high contrast, clear focal point."
  }'
```

Delete thumbnail prompt:

```bash
curl -i -X DELETE http://localhost:3000/thumbnails/<THUMBNAIL_ID> \
  -H "Authorization: Bearer $TOKEN"
```

Cross-user thumbnail prompt access is hidden (expected `404`).

### Auth API (Phase 3)
Register:

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

Login:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Use token with `/auth/me`:

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' | jq -r '.accessToken')

curl http://localhost:3000/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

Unauthorized `/auth/me` (expected `401`):

```bash
curl -i http://localhost:3000/auth/me
```

### Projects API (Phase 4)
Create a project:

```bash
curl -X POST http://localhost:3000/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Backend Developer Channel",
    "niche": "Programming",
    "language": "English",
    "targetAudience": "Junior developers",
    "description": "Teaching backend development"
  }'
```

List your projects:

```bash
curl http://localhost:3000/projects \
  -H "Authorization: Bearer $TOKEN"
```

Get one project by id:

```bash
curl http://localhost:3000/projects/<PROJECT_ID> \
  -H "Authorization: Bearer $TOKEN"
```

Update a project (clear description with `null`):

```bash
curl -X PATCH http://localhost:3000/projects/<PROJECT_ID> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Backend Engineering Channel",
    "description": null
  }'
```

Delete a project (expected `204`):

```bash
curl -i -X DELETE http://localhost:3000/projects/<PROJECT_ID> \
  -H "Authorization: Bearer $TOKEN"
```

Cross-user access is hidden (expected `404`):

```bash
curl -i http://localhost:3000/projects/<OTHER_USERS_PROJECT_ID> \
  -H "Authorization: Bearer $TOKEN"
```

## Health Check
Verify backend health route:

```bash
curl http://localhost:3000/health
```

For Dockerized backend:

```bash
curl http://localhost:4000/health
```

Expected response:

```json
{"status":"ok"}
```

## Checks
From repo root:

```bash
npm run lint
npm run build
npm run test
```

## Phase 1 Scope Completed
- Base npm-workspace monorepo structure
- NestJS backend with `GET /health`
- Next.js frontend with home page title: `AI Creator Studio`
- PostgreSQL Docker Compose service
- `.env.example` files for backend and frontend

## Phase 2 Scope Completed
- Prisma installed in backend (`prisma` + `@prisma/client`)
- Prisma schema with models: `User`, `Project`, `VideoIdea`, `Script`, `SeoMetadata`, `Thumbnail`
- NestJS `PrismaService` + `PrismaModule` integration
- Initial migration files added under `backend/prisma/migrations`
- Seed plumbing added (no sample data)

## Phase 3 Scope Completed
- Added `auth` and `users` backend modules
- Added `POST /auth/register`, `POST /auth/login`, and protected `GET /auth/me`
- Added JWT strategy/guard and DTO validation
- Added password hashing with bcrypt
- Added JWT env configuration in backend `.env.example`

## Phase 4 Scope Completed
- Added `projects` module with authenticated CRUD endpoints
- Added ownership-scoped Prisma queries so users access only their own projects
- Added DTO validation for create/update payloads and UUID param validation
- Added README project API examples

## Phase 5 Scope Completed
- Added `ai` module and `AiService` for internal AI orchestration
- Added provider abstraction with `MockAiProvider`
- Added prompt template helpers for video ideas, scripts, SEO, and thumbnail prompts
- Added deterministic structured mock AI outputs (no database writes)
- Added `AI_PROVIDER=mock` environment configuration

## Phase 6 Scope Completed
- Added authenticated video idea generation endpoint: `POST /ai/video-ideas`
- Added authenticated idea management endpoints:
  - `GET /projects/:projectId/video-ideas`
  - `PATCH /video-ideas/:id`
  - `DELETE /video-ideas/:id`
- Added ownership checks for project and video-idea access
- Added persistence of generated mock ideas into `VideoIdea` records
- Added README examples for generating, listing, updating, and deleting video ideas

## Phase 7 Scope Completed
- Added authenticated script generation endpoint: `POST /ai/script`
- Added authenticated script management endpoints:
  - `GET /video-ideas/:ideaId/script`
  - `PATCH /scripts/:id`
  - `DELETE /scripts/:id`
- Added one-script-per-video-idea upsert generation behavior
- Added ownership checks so users can only access scripts from their own video ideas
- Added README examples for script generation, retrieval, update, and delete

## Phase 8 Scope Completed
- Added authenticated SEO generation endpoint: `POST /ai/seo`
- Added authenticated SEO management endpoints:
  - `GET /video-ideas/:ideaId/seo`
  - `PATCH /seo/:id`
  - `DELETE /seo/:id`
- Added one-SEO-per-video-idea upsert generation behavior
- Added ownership checks so users can only access SEO metadata from their own video ideas
- Added README examples for SEO generation, retrieval, update, and delete

## Phase 9 Scope Completed
- Added authenticated thumbnail prompt generation endpoint: `POST /ai/thumbnail`
- Added authenticated thumbnail prompt management endpoints:
  - `GET /video-ideas/:ideaId/thumbnail`
  - `PATCH /thumbnails/:id`
  - `DELETE /thumbnails/:id`
- Added one-thumbnail-per-video-idea upsert generation behavior
- Added ownership checks so users can only access thumbnail prompts from their own video ideas
- Added README examples for thumbnail prompt generation, retrieval, update, and delete

## Phase 10 Scope Completed
- Added frontend API client with `NEXT_PUBLIC_API_URL` support
- Added localStorage JWT token handling for login/logout persistence
- Added reusable auth provider and protected-route handling
- Added frontend pages: `/`, `/login`, `/register`, `/dashboard`
- Added simple dashboard layout with navbar/sidebar and logout action
- Added loading and error states for auth bootstrap and form submission

## Phase 11 Scope Completed
- Added frontend project API integration for `GET/POST/PATCH/DELETE /projects` and `GET /projects/:id`
- Added protected project pages: `/projects`, `/projects/new`, `/projects/[id]`
- Added project list/create/detail UI with loading/success/error states
- Added inline edit toggle with Save/Cancel on project detail page
- Added delete with confirmation and redirect back to projects list
- Updated dashboard sidebar with Projects navigation

## Phase 12 Scope Completed
- Added frontend AI API integration for ideas, script, SEO, and thumbnail generation/view endpoints
- Added protected workflow pages:
  - `/projects/[id]/ideas`
  - `/ideas/[id]`
  - `/ideas/[id]/script`
  - `/ideas/[id]/seo`
  - `/ideas/[id]/thumbnail`
- Added reusable idea generation/list/detail components and shared generation panel UI
- Added loading, empty, success, and error states for each generation step
- Kept scope to generate + view (no manual edit/delete UI for ideas/script/SEO/thumbnail)

## Phase 13 Scope Completed
- Added `backend/Dockerfile` for production NestJS container build/run
- Added `frontend/Dockerfile` for production Next.js container build/run
- Updated `docker-compose.yml` to run `postgres`, `redis`, `backend`, and `frontend`
- Added Postgres healthcheck and backend migrate-on-start flow (`prisma migrate deploy`)
- Added `.env.docker.example` and Docker runbook commands in README

## Phase 14 Scope Completed
- Added OpenAI provider behind the existing backend `AiProvider` interface
- Kept `AI_PROVIDER=mock` as the default deterministic local provider
- Added `AI_PROVIDER=openai` selection with backend-only OpenAI env variables
- Added structured output validation for ideas, scripts, SEO metadata, and thumbnail prompts
- Added safe error handling for missing API keys, timeouts, and invalid AI responses
- Updated README and env templates with OpenAI switching instructions

## Not Implemented Yet (Out of Scope)
- Gemini/Ollama provider integration
- Real thumbnail image generation
# AI-Creator-Studio
# AI-Creator-Studio
