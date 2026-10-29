/**
 * Writes backend/openapi.json without starting a server or touching the database.
 * Runs from the compiled output (`pnpm openapi`) because Nest needs decorator metadata.
 * packages/api-client generates its typed client from this file.
 */
import 'reflect-metadata';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module.js';
import { buildOpenApi, configureApp } from './setup.js';

process.env.DATABASE_URL ??= 'postgresql://unused@localhost/unused';

const app = await NestFactory.create(AppModule, { logger: false });
configureApp(app);
const out = resolve(import.meta.dirname, '../openapi.json');
writeFileSync(out, JSON.stringify(buildOpenApi(app), null, 2) + '\n');
await app.close();
console.log(`Wrote ${out}`);
