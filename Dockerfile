FROM node:20-bookworm-slim AS build

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    openssl \
    python3 \
    make \
    g++ \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@8.15.9 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY client/package.json client/package.json
COPY server/package.json server/package.json

RUN pnpm install --frozen-lockfile

COPY client client
COPY server server

RUN DATABASE_URL="file:./dev.db" pnpm --filter server prisma:generate

RUN pnpm build

RUN pnpm --filter server deploy --prod /app/deploy
RUN cp -r /app/server/dist /app/deploy/dist \
  && cp -r /app/server/prisma /app/deploy/prisma \
  && cp /app/server/prisma.config.ts /app/deploy/prisma.config.ts
RUN cd /app/deploy \
  && DATABASE_URL="file:./dev.db" pnpm exec prisma generate

FROM node:20-bookworm-slim AS runtime

WORKDIR /app/server

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL=file:./dev.db

COPY --from=build /app/deploy ./
COPY --from=build /app/client/dist /app/client/dist
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3000

CMD ["./docker-entrypoint.sh"]
