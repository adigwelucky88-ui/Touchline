import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AthletesModule } from './athletes/athletes.module.js';
import { HealthController } from './health/health.controller.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { SportsModule } from './sports/sports.module.js';
import { VideosModule } from './videos/videos.module.js';

/**
 * Modular monolith: each domain module (identity, profiles, media, moderation, …) owns its
 * controllers and services and talks to others through exported services only.
 */
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, SportsModule, AthletesModule, VideosModule],
  controllers: [HealthController],
})
export class AppModule {}
