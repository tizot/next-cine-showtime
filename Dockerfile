#  ╭──────────────────────────────────────────────────────────╮
#  │                      Builder image                       │
#  ╰──────────────────────────────────────────────────────────╯
FROM node:18-alpine AS builder

RUN npm install --global pnpm@9

WORKDIR /app

COPY ./pnpm-*.yaml .
COPY ./package.json .

RUN pnpm install --frozen-lockfile

COPY . .

# Build frontend
RUN pnpm build
RUN pnpm prune --production

#  ╭──────────────────────────────────────────────────────────╮
#  │                     Production image                     │
#  ╰──────────────────────────────────────────────────────────╯
FROM node:18-alpine

RUN npm install --global pnpm@9

WORKDIR /app

COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY package.json .

EXPOSE 4500
ENV PORT=4500
ENV NODE_ENV=production
ENV ORIGIN=https://cine.camillemasset.fr

CMD ["node", "build"]

