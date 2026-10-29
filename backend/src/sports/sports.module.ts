import { Module } from '@nestjs/common';

import { SportsController } from './sports.controller.js';

@Module({ controllers: [SportsController] })
export class SportsModule {}
