# AGENTS.md

## Project
AI Creator Studio

## Purpose
This document defines implementation rules for contributors and coding agents working in this repository.

## Stack
- Frontend: Next.js + TypeScript + Tailwind CSS
- Backend: NestJS + TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Auth: JWT + bcrypt
- AI: Mock provider first, real provider later
- Local development: Docker Compose

## Core Rules
1. Use clean, readable, and maintainable TypeScript.
2. Do not hardcode secrets, API keys, tokens, or credentials.
3. Keep environment configuration in `.env` and maintain `.env.example`.
4. Protect private backend APIs with JWT authentication.
5. Enforce ownership: users can only access their own data.
6. Use DTO validation in NestJS with `class-validator` (and `class-transformer` as needed).
7. Use Prisma migrations for all schema changes.
8. After each completed phase, update `README.md` with:
   - Setup steps
   - Run steps
   - Test instructions
   - Any new environment variables (and mirror them in `.env.example`)
9. Run formatting, linting, and build checks where possible before considering work complete.
10. Do not implement future phases unless explicitly requested.

## Backend Requirements (NestJS)
- Use DTOs for request validation on create/update/query endpoints.
- Reject unauthorized access to protected resources.
- Scope all data queries and mutations to the authenticated user.
- Return safe error messages without leaking sensitive internals.

## Database Requirements (Prisma + PostgreSQL)
- Model user ownership explicitly (e.g., `userId` on owned resources).
- Generate and apply migrations for schema changes.
- Avoid destructive DB changes unless explicitly requested.

## AI Provider Strategy
- Phase 1: Implement against a mock AI provider interface.
- Later phase (only when requested): Add real provider integration behind the same interface.
- Keep provider keys/config in environment variables.

## Dev Workflow
1. Confirm requested phase scope.
2. Implement only the requested phase.
3. Run relevant checks:
   - Format
   - Lint
   - Build
   - Tests (if available)
4. Update `README.md` and `.env.example` for any setup/config changes.
5. Summarize completed scope and explicitly note what was not implemented.

## Definition of Done (Per Phase)
- Requested phase requirements are complete.
- No out-of-scope future phase work was added.
- Formatting/lint/build pass (or issues are clearly documented).
- `README.md` reflects current setup and test/run instructions.
- `.env.example` is accurate and up to date.

