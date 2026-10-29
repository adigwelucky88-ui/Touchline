import { ApiProperty } from '@nestjs/swagger';

/** Mirrors `Video` in packages/core/src/schemas.ts. */
export class VideoDto {
  @ApiProperty() id!: string;
  @ApiProperty() athleteId!: string;
  @ApiProperty() athleteHandle!: string;
  @ApiProperty() athleteName!: string;
  @ApiProperty() title!: string;
  @ApiProperty({ type: String, nullable: true }) headline!: string | null;
  @ApiProperty({ example: '2025/26' }) season!: string;
  @ApiProperty() organizationName!: string;
  @ApiProperty({ description: 'Primary skill category key', example: 'goals' }) skill!: string;
  @ApiProperty({ enum: ['uploading', 'processing', 'in_review', 'published', 'rejected', 'removed'] })
  status!: 'uploading' | 'processing' | 'in_review' | 'published' | 'rejected' | 'removed';
  @ApiProperty({ enum: ['public', 'signed_in', 'private'] }) visibility!: 'public' | 'signed_in' | 'private';
  @ApiProperty({ type: Number, nullable: true }) durationSeconds!: number | null;
  @ApiProperty({ type: String, nullable: true }) thumbnailUrl!: string | null;
  @ApiProperty({ type: String, nullable: true, description: 'HLS manifest URL' }) playbackUrl!: string | null;
  @ApiProperty() createdAt!: string;
}

export class VideoPageDto {
  @ApiProperty({ type: [VideoDto] }) items!: VideoDto[];
  @ApiProperty({ type: String, nullable: true }) nextCursor!: string | null;
}
