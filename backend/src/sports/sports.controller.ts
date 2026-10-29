import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { enabledSports, getSport } from '@touchline/core';

import { SportDto } from './sports.dto.js';

/**
 * Serves the sport catalogue from packages/core, the single source of truth.
 * The database copy (seeded from the same list) exists for foreign keys.
 */
@ApiTags('sports')
@Controller('sports')
export class SportsController {
  @Get()
  @ApiOkResponse({ type: [SportDto] })
  list(): SportDto[] {
    return enabledSports().map((sport) => structuredClone(sport) as SportDto);
  }

  @Get(':key')
  @ApiOkResponse({ type: SportDto })
  get(@Param('key') key: string): SportDto {
    const sport = getSport(key);
    if (!sport?.enabled) throw new NotFoundException(`Unknown sport: ${key}`);
    return structuredClone(sport) as SportDto;
  }
}
