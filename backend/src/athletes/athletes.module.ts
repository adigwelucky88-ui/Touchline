import { Module } from '@nestjs/common';

import { VideosModule } from '../videos/videos.module.js';
import { AthletesController } from './athletes.controller.js';
import { AthletesService } from './athletes.service.js';

@Module({
  imports: [VideosModule],
  controllers: [AthletesController],
  providers: [AthletesService],
})
export class AthletesModule {}
