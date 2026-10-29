import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';

import { parseLimit } from '../common/pagination.js';
import { VideoPageDto } from './videos.dto.js';
import { VideosService } from './videos.service.js';

@ApiTags('videos')
@Controller('videos')
export class VideosController {
  constructor(private readonly videos: VideosService) {}

  /** Discover feed. Upload endpoints (presigned multipart) arrive in phase 3. */
  @Get()
  @ApiQuery({ name: 'sport', required: false })
  @ApiQuery({ name: 'skill', required: false, description: 'Skill category key' })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ type: VideoPageDto })
  list(
    @Query('sport') sport?: string,
    @Query('skill') skill?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ): Promise<VideoPageDto> {
    return this.videos.list({ sport, skill, cursor, limit: parseLimit(limit) });
  }
}
