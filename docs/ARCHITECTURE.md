# Touchline architecture

Touchline is a career video platform for athletes: a channel per athlete, organised by
season, club and skill. The MVP ships football only, but no core table, API or screen is
football-specific. Each sport is configuration.

## Stack

| Layer | Choice |
|---|---|
| Apps | React Native + Expo (SDK 58), Expo Router. One codebase for iOS, iPadOS, Android phones and tablets, and web |
| App state | TanStack Query (server state), Zustand (client state) |
| App architecture | MVVM: View → ViewModel hook → Repository → Service |
| Shared code | pnpm workspaces + Turborepo, TypeScript everywhere |
| Admin console | Next.js (`apps/admin`) |
| API | NestJS modular monolith on ECS Fargate behind an ALB |
| Database | Aurora PostgreSQL Serverless v2 (Multi-AZ in prod), Prisma ORM and migrations |
| Auth | Amazon Cognito (email, Google, Sign in with Apple) |
| Video | S3 multipart upload → Step Functions → MediaConvert (HLS) → CloudFront |
| Moderation | Rekognition video moderation + human review queue |
| Messaging | EventBridge, SQS, SES, push via APNs/FCM |
| Infrastructure | AWS CDK (TypeScript), one AWS account per environment |
| CI/CD | GitHub Actions, EAS Build / Submit / Update |
| Observability | CloudWatch, OpenTelemetry, Sentry |

See `docs/adr/` for why each choice was made.

## System overview

```
 Expo app (iOS · iPadOS · Android · tablets · web)       Next.js admin
   View → ViewModel → Repository → Service                    │
                 │                                             │
         CloudFront + WAF ─────────────► processed-video bucket (HLS, signed)
                 │                                   ▲
         ALB → ECS Fargate: NestJS API               │
                 │  identity · profiles · sports · organizations ·
                 │  media · moderation · discovery · social · admin
                 ├─► Aurora PostgreSQL
                 ├─► Cognito
                 └─► raw-upload bucket → EventBridge → Step Functions
                                            ├─ validate (Lambda)
                                            ├─ MediaConvert → HLS + thumbnails
                                            ├─ Rekognition moderation
                                            └─ publish / review → API
```

## Repository layout

```
apps/app/            Expo app
apps/admin/          Next.js moderation console
packages/core/       domain types, zod schemas, sport catalogue, age policy (shared with backend)
packages/ui/         design tokens and React Native primitives
packages/i18n/       25 locales, i18next setup
packages/api-client/ typed API client (generated from backend OpenAPI via orval)
backend/             NestJS API + Prisma schema
infra/               AWS CDK stacks
prototype/           original static prototype, kept as visual reference
docs/                this file, roadmap, ADRs
```

## App: MVVM

```
View (screen)  →  ViewModel (useXxxViewModel)  →  Repository        →  Service
renders only      state + actions per screen      domain data, cache    HTTP, uploads, storage, push
```

- **Views** live under `apps/app/src/app/` (Expo Router routes) and `src/features/*/views`. They
  never call `fetch` or touch storage.
- **ViewModels** are hooks in `src/features/*/view-models`. They compose TanStack Query and
  Zustand and return plain state plus action functions. They are testable without rendering.
- **Repositories** (`src/data/repositories`) are the single source of truth per domain
  (`VideoRepository`, `AthleteRepository`, `SportRepository`). Only they know where data comes
  from: API, cache or local fixtures.
- **Services** (`src/data/services`) wrap low-level I/O: the API client, the upload service,
  secure storage.
- **Dependency injection** goes through `RepositoryProvider`, so tests and the offline demo can
  swap in fixture repositories.

### Adaptive layout

| Width | Shell |
|---|---|
| < 768 (phones) | bottom tab bar |
| 768–1199 (tablets, iPad portrait) | side rail with icons |
| ≥ 1200 (tablet landscape, desktop web) | full sidebar |

`useLayoutClass()` in `packages/ui` returns `compact | medium | expanded`, and the root layout
picks the shell. Screens use the same class to choose one or two panes.

### Web and SEO

Public athlete pages (`/athletes/[handle]`) are server-rendered by Expo Router, so search engines
and link previews (WhatsApp, X) can read them. Universal Links / App Links open the native app
when it is installed.

## Multi-sport model

Everything sport-specific is data in the `sports` catalogue:

- `positions`, `skill_categories` and `attribute_definitions` per sport. For example football
  has `preferred_foot`, cricket would have `batting_hand` and `bowling_style`.
- `season_format`: `split_year` ("2025/26") or `calendar_year` ("2025").
- `terminology`: i18n keys for "club" vs "team", "match" vs "game".
- `enabled` flag per sport. Only football is enabled for the MVP.

Profile attribute values are stored in `profile_attributes` and validated against their
definition (`packages/core` `validateAttributes`). The app builds profile and upload forms from the
sport's definitions, so adding a sport means adding catalogue data and translations, not code.

## Data model (PostgreSQL)

The full schema is `backend/prisma/schema.prisma`. Main groups:

| Group | Tables |
|---|---|
| Accounts and age | `users`, `guardianships`, `consents` |
| Sports catalogue | `sports`, `positions`, `skill_categories`, `attribute_definitions` |
| Athletes | `athlete_profiles` (user + sport), `profile_attributes` |
| Careers | `organizations`, `chapters` (profile + organisation + season, optionally verified) |
| Video | `videos`, `video_skill_tags` |
| Safety | `reports`, `blocks`, `moderation_results`, `audit_log` |
| Social | `follows`, `saves` |

Rules: UUID primary keys, `created_at`/`updated_at` everywhere, soft delete only where the law
requires keeping records (audit, consents), cursor pagination on every list endpoint.

## Video pipeline

1. `POST /v1/videos` creates a `videos` row (`status = uploading`) and returns presigned S3
   multipart URLs.
2. The app uploads parts directly to the raw bucket. The upload queue persists, so it resumes
   after the app restarts.
3. `POST /v1/videos/:id/complete` finishes the multipart upload. The S3 event starts the Step
   Functions workflow.
4. The workflow validates the file (duration, codec, size), runs MediaConvert (3 HLS renditions
   for the MVP, plus thumbnails) and starts Rekognition moderation.
5. The result sets `status` to `published`, `in_review` (flagged, or the athlete is a minor) or
   `rejected`.
6. Playback goes through CloudFront. Videos that are not public use signed cookies.

MVP limits: 5 minutes and 1 GB per video, MP4/MOV/WebM input.

## Age policy and safety

Age is derived from the date of birth at sign-up through a neutral age gate.
`packages/core` `ageTier()` is the single implementation, shared by the app and the API.

| Tier | Age | Rules |
|---|---|---|
| `adult` | 18+ | full features |
| `teen` | 16–17 | self sign-up, minor protections on |
| `young_teen` | 13–15 | verified guardian consent required before uploading or being discoverable |
| `child` | under 13 | guardian- or academy-managed accounts only (post-MVP) |

Minor protections: no exact location, school or contact details; no direct messages; profile
discoverable only to signed-in users; every upload goes to human review; contact requests go to
the guardian.

All uploads require a rights attestation. Reporting and blocking are available from launch. App
store requirements for user-generated content apps (reporting, blocking, moderation, terms with zero
tolerance for abuse, in-app account deletion) are MVP scope.

Relevant law to confirm with counsel: COPPA (US), GDPR Art. 8 and the UK Age Appropriate Design
Code, Nigeria NDPA 2023.

## Environments

| Env | AWS account | App channel |
|---|---|---|
| dev | touchline-dev | development builds, EAS Update `dev` |
| staging | touchline-staging | TestFlight / Play internal, EAS Update `staging` |
| prod | touchline-prod | store releases, EAS Update `production` |

Primary region `eu-west-2` (London): good latency to both the UK and West Africa through CloudFront.
