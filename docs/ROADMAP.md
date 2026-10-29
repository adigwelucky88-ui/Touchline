# Touchline MVP roadmap

**MVP scope:** football only. Sign up with an age gate, athlete profile, career chapters,
upload with processing and moderation, streaming playback, Discover and search, follow, Watch
later, report and block, account deletion, admin moderation console.

**Not in the MVP:** club-verified chapters, scout tools, stats, comments and direct messages,
payments, other sports (the model supports them; they stay disabled).

Rough timing with 2–3 developers plus design: 4–6 months to a pilot-ready MVP. Phases 2–4 run
in parallel once the API contract (phase 1) is agreed.

## Phase 0: Foundations

- [x] Monorepo scaffold (apps, packages, backend, infra, CI)
- [ ] Apple Developer and Google Play **organisation** accounts (D-U-N-S number takes weeks: start now)
- [ ] AWS Organization with dev, staging, prod accounts; IAM Identity Center for people
- [ ] Domain and DNS (Route 53)
- [ ] Expo account and EAS project
- [ ] Lawyer: terms, privacy policy, age and guardian policy, content rights policy

## Phase 1: Design and contracts

- [x] Design tokens taken from the prototype (`packages/ui`)
- [ ] Wireframes for phone, tablet and desktop
- [x] First database schema (`backend/prisma/schema.prisma`)
- [ ] Finalise the OpenAPI contract for MVP endpoints
- [ ] ADRs for any change to the stack

## Phase 2: Backend core

- [x] NestJS skeleton with health, sports catalogue, OpenAPI export
- [ ] CDK: network, Aurora, Cognito, ECS service, buckets, CloudFront (skeleton stacks exist)
- [x] Prisma migrations and seed (football catalogue)
- [x] API Dockerfile (built and smoke-tested locally)
- [ ] Identity module: Cognito JWT guard, user record, date of birth, age tier
- [ ] Profiles, organisations and chapters modules
- [ ] Guardian consent flow (email verification of guardian)

## Phase 3: Video pipeline

- [ ] Presigned multipart upload endpoints
- [ ] Step Functions workflow: validate → MediaConvert → Rekognition → publish/review
- [ ] CloudFront signed cookies for non-public videos
- [ ] AWS Budgets alarms on MediaConvert and CloudFront spend

## Phase 4: App

- [x] Expo Router shell with adaptive layout (tabs / rail / sidebar)
- [x] MVVM slice: Discover and athlete channel on fixture repositories
- [x] 25 locales ported from the prototype, RTL support
- [ ] Cognito sign-in and age-gate onboarding
- [ ] Profile editing built from sport attribute definitions
- [ ] Persistent, resumable upload queue
- [ ] HLS playback with expo-video (native) and hls.js (web)
- [ ] Search, follow, Watch later against the real API

## Phase 5: Safety and admin

- [ ] Report and block in the app
- [ ] Admin: review queue, takedowns, audit log
- [ ] Account and data deletion (in app, as Apple requires)
- [ ] Minor protections enforced in the API, not only the UI

## Phase 6: Hardening and beta

- [ ] Unit, component and Maestro end-to-end tests on the main flows
- [ ] Load test the upload path
- [ ] Security review / penetration test
- [ ] TestFlight, Play internal testing, staging web
- [ ] Pilot with one academy

## Phase 7: Launch

- [ ] App Store and Play age-rating questionnaires, privacy labels, Data safety form
- [ ] Production web deploy
- [ ] Monitoring dashboards and incident runbook
