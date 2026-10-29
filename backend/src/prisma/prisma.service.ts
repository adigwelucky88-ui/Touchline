import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../generated/prisma/client.js';

/**
 * Locally DATABASE_URL is set directly. On ECS the credentials arrive as separate variables
 * (DB_USER and DB_PASSWORD injected from Secrets Manager), so the URL is assembled here.
 */
export function databaseUrl(config: ConfigService): string {
  const url = config.get<string>('DATABASE_URL');
  if (url) return url;
  const user = encodeURIComponent(config.getOrThrow<string>('DB_USER'));
  const password = encodeURIComponent(config.getOrThrow<string>('DB_PASSWORD'));
  const host = config.getOrThrow<string>('DB_HOST');
  const port = config.get<string>('DB_PORT') ?? '5432';
  const name = config.get<string>('DB_NAME') ?? 'touchline';
  return `postgresql://${user}:${password}@${host}:${port}/${name}?sslmode=require`;
}

/**
 * Prisma connects lazily on the first query, so the app (and the OpenAPI export script)
 * can start without a database.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor(config: ConfigService) {
    super({ adapter: new PrismaPg({ connectionString: databaseUrl(config) }) });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
