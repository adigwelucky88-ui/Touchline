# Build from the repository root: docker build -f backend/Dockerfile -t touchline-api .
# The backend depends on workspace packages (packages/core), so the whole workspace is the build context.

FROM node:24-slim AS build
RUN corepack enable
WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile --filter @touchline/backend...
RUN pnpm --filter @touchline/core build && pnpm --filter @touchline/backend build
# Self-contained production install of the backend and its workspace dependencies.
RUN pnpm --filter @touchline/backend deploy --prod --legacy /out \
  && cp -r backend/dist backend/prisma backend/prisma7.config.ts /out/

FROM node:24-slim
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /out .
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
