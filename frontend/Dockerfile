FROM node:22-slim AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package.json
COPY backend/package.json backend/package.json

RUN npm ci

FROM node:22-slim AS build
WORKDIR /app

ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ARG NEXT_PUBLIC_APP_NAME="AI Creator Studio"
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME

COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY frontend ./frontend

RUN npm run build --workspace frontend

FROM node:22-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/package-lock.json ./package-lock.json
COPY --from=build /app/frontend ./frontend

EXPOSE 3000

CMD ["npm", "run", "start", "--workspace", "frontend", "--", "-p", "3000"]
