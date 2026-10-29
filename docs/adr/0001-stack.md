# ADR 0001: Core stack

Status: accepted (2026-10-29)

## Context

Touchline must ship on iOS, iPadOS, Android phones and tablets, and web at the same time, with
a small team. Video is user-uploaded, users include minors, and the platform must later support
sports other than football. The backend must run on AWS with a relational database.

## Decision

- **React Native with Expo** for every client platform, using Expo Router for navigation and
  web URLs. Chosen over Flutter because the whole stack becomes TypeScript, the prototype's
  translations port directly, and Expo Router can server-render public pages for SEO.
- **MVVM** in the app: View → ViewModel hook → Repository → Service.
- **NestJS modular monolith** instead of microservices. Modules have clear boundaries so they can
  be split out later if load requires it.
- **Aurora PostgreSQL + Prisma**. Relational integrity matters for careers, guardianships and
  consents. Postgres full-text search is enough for MVP search.
- **AWS-native video**: S3, MediaConvert, CloudFront, Rekognition, rather than a third-party
  video API, to keep hosting and data in one provider.
- **AWS CDK in TypeScript** for infrastructure.
- **pnpm workspaces + Turborepo** for the monorepo.

## Consequences

- One language across app, API and infrastructure; shared types in `packages/core`.
- Native modules beyond the Expo SDK need development builds (EAS), not Expo Go.
- MediaConvert and CloudFront costs scale with usage, so budget alarms are part of phase 3.

## Styling

The design system starts as typed tokens plus React Native `StyleSheet` primitives in
`packages/ui`. A utility-class library (NativeWind or Uniwind) can sit on the same tokens later,
once its support for the Expo SDK in use is confirmed.
