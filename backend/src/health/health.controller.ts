import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiProperty, ApiTags } from '@nestjs/swagger';

class HealthDto {
  @ApiProperty({ example: 'ok' })
  status!: 'ok';
}

/** Liveness check for the ALB target group. Does not touch the database. */
@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOkResponse({ type: HealthDto })
  check(): HealthDto {
    return { status: 'ok' };
  }
}
