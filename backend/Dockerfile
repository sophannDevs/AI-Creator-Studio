FROM node:22-slim AS base
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json

RUN npm ci

FROM base AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY backend ./backend
COPY frontend/package.json frontend/package.json

RUN npm run prisma:generate --workspace backend
RUN npm run build --workspace backend

FROM base AS runtime
WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/package-lock.json ./package-lock.json
COPY --from=build /app/backend ./backend

EXPOSE 4000

CMD ["npm", "run", "start:prod", "--workspace", "backend"]
