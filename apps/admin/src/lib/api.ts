import { configureApiClient } from "@touchline/api-client";

// TODO(phase 5): authenticate as a moderator (Cognito) and call the admin endpoints.
configureApiClient({ baseUrl: process.env.TOUCHLINE_API_URL ?? "http://localhost:3000" });

export * from "@touchline/api-client";
