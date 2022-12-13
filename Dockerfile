# ---------------------------------------------------------------------------- #
#                         Builder image (frontend only)                        #
# ---------------------------------------------------------------------------- #
FROM node:18-alpine AS frontend-builder

RUN npm install --global pnpm@7

WORKDIR /app

COPY ./pnpm-*.yaml /app/
COPY ./frontend/package.json /app/frontend/package.json

RUN pnpm --filter frontend install --frozen-lockfile

# Build frontend
COPY ./frontend/ /app/frontend
RUN pnpm --filter frontend run build

# ---------------------------------------------------------------------------- #
#                               Production image                               #
# ---------------------------------------------------------------------------- #
FROM node:18-alpine

RUN npm install --global pnpm@7

WORKDIR /app

COPY ./pnpm-*.yaml /app/
COPY ./backend/package.json /app/backend/package.json
RUN pnpm --filter backend install --prod --frozen-lockfile

COPY ./backend/ /app/backend
COPY --from=frontend-builder /app/frontend/dist /app/backend/src/public

WORKDIR /app/backend

CMD ["src/index.js"]
