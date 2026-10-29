import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';

import { parseLimit } from '../common/pagination.js';
import { VideoPageDto } from '../videos/videos.dto.js';
import { VideosService } from '../videos/videos.service.js';
import { AthleteDto, AthletePageDto } from './athletes.dto.js';
import { AthletesService } from './athletes.service.js';

@ApiTags('athletes')
@Controller('athletes')
export class AthletesController {
  constructor(
    private readonly athletes: AthletesService,
    private readonly videos: VideosService,
  ) {}

  @Get()
  @ApiQuery({ name: 'sport', required: false })
  @ApiQuery({ name: 'q', required: false, description: 'Search by name' })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ type: AthletePageDto })
  list(
    @Query('sport') sport?: string,
    @Query('q') q?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ): Promise<AthletePageDto> {
    return this.athletes.list({ sport, q, cursor, limit: parseLimit(limit) });
  }

  @Get(':handle')
  @ApiOkResponse({ type: AthleteDto })
  get(@Param('handle') handle: string): Promise<AthleteDto> {
    return this.athletes.getByHandle(handle);
  }

  @Get(':handle/videos')
  @ApiQuery({ name: 'season', required: false, example: '2025/26' })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ type: VideoPageDto })
  videosFor(
    @Param('handle') handle: string,
    @Query('season') season?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ): Promise<VideoPageDto> {
    return this.videos.list({ athleteHandle: handle, season, cursor, limit: parseLimit(limit) });
  }
}
