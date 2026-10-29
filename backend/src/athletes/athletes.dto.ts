import { ApiProperty } from '@nestjs/swagger';

/** Mirrors `AthleteSummary`, `Athlete` and `Chapter` in packages/core/src/schemas.ts. */

export class ChapterDto {
  @ApiProperty() id!: string;
  @ApiProperty({ example: '2025/26' }) season!: string;
  @ApiProperty() organizationName!: string;
  @ApiProperty() verified!: boolean;
}

export class AthleteSummaryDto {
  @ApiProperty() id!: string;
  @ApiProperty({ example: 'ayo-martins' }) handle!: string;
  @ApiProperty() displayName!: string;
  @ApiProperty({ example: 'football' }) sport!: string;
  @ApiProperty({ description: 'Position key from the sport catalogue', example: 'forward' }) position!: string;
  @ApiProperty({ description: 'ISO 3166-1 alpha-2', example: 'NG' }) country!: string;
  @ApiProperty({ type: String, nullable: true }) currentOrganization!: string | null;
}

export class AthleteDto extends AthleteSummaryDto {
  @ApiProperty({
    description: 'Values keyed by the sport attribute definition key',
    type: 'object',
    additionalProperties: { oneOf: [{ type: 'string' }, { type: 'number' }, { type: 'boolean' }] },
  })
  attributes!: Record<string, string | number | boolean>;

  @ApiProperty({ type: [ChapterDto], description: 'Newest season first' }) chapters!: ChapterDto[];
}

export class AthletePageDto {
  @ApiProperty({ type: [AthleteSummaryDto] }) items!: AthleteSummaryDto[];
  @ApiProperty({ type: String, nullable: true }) nextCursor!: string | null;
}
