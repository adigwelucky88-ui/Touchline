# Touchline

A career video platform for athletes: a channel per player, organised by season, club and skill.
Football first; the data model and apps are built so other sports are configuration.

- [Architecture](docs/ARCHITECTURE.md): stack, MVVM, data model, video pipeline, age policy
- [Roadmap](docs/ROADMAP.md): MVP phases and what is done
- [Decisions](docs/adr/): why each major choice was made

## Repository

| Path | What |
|---|---|
| `apps/app` | Expo (React Native) app: iOS, iPadOS, Android phones and tablets, web |
| `apps/admin` | Next.js moderation console |
| `packages/core` | Shared domain types, zod schemas, sport catalogue, age policy |
| `packages/ui` | Design tokens and React Native components |
| `packages/i18n` | 25 languages (English fallback) |
| `packages/api-client` | Typed API client generated from `backend/openapi.json` |
| `backend` | NestJS API, Prisma schema and migrations |
| `infra` | AWS CDK stacks (network, Aurora, Cognito, media, ECS API) |
| `prototype` | Original static prototype, kept as visual reference |

## Getting started

Requirements: Node 24, pnpm 12 (`corepack enable`), Docker.

```bash
pnpm install
```

**Run the app on sample data** (no backend needed):

```bash
pnpm --filter @touchline/app web
```

Use `ios` or `android` instead of `web` for the simulators (a development build is needed for native modules outside Expo Go).

**Run the API** against a local Postgres:

```bash
pnpm db:up
```

```bash
cp backend/.env.example backend/.env
```

```bash
pnpm --filter @touchline/backend db:migrate
```

```bash
pnpm --filter @touchline/backend db:seed
```

```bash
pnpm --filter @touchline/backend dev
```

The API listens on http://localhost:3000 (`/v1/...`), with Swagger docs at http://localhost:3000/docs.
To point the app at it, set `EXPO_PUBLIC_API_URL=http://localhost:3000` in `apps/app/.env` and restart Expo.

**Admin console:**

```bash
pnpm --filter @touchline/admin dev
```

Opens on http://localhost:3001 and reads from the API at `TOUCHLINE_API_URL` (default http://localhost:3000).

**Original prototype:**

```bash
pnpm prototype
```

## Everyday commands

```bash
pnpm typecheck
```

```bash
pnpm test
```

After changing API endpoints or DTOs, regenerate the OpenAPI spec and the client (CI fails if they are stale):

```bash
pnpm --filter @touchline/backend openapi && pnpm --filter @touchline/api-client generate
```

Synthesise the AWS stacks for an environment (`dev`, `staging`, `prod`):

```bash
pnpm --filter @touchline/infra cdk synth -c env=dev
```

## Status

Phase 0–1 scaffold. Working today: shared domain package with age policy and multi-sport catalogue, Prisma schema
and first migration, read-only API (sports, athletes, videos), app shell with phone/tablet/desktop layouts and
Discover, athlete channel and Watch later screens, admin shell, CDK stacks that synthesise. Next up: Cognito
sign-in, uploads and the video pipeline. See the [roadmap](docs/ROADMAP.md).

Existing prototype: https://touchline-football.orangefawn1.chatgpt.site
