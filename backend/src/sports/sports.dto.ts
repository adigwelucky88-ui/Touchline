import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LabelledKeyDto {
  @ApiProperty() key!: string;
  @ApiProperty({ description: 'i18n key' }) labelKey!: string;
}

export class AttributeOptionDto {
  @ApiProperty() value!: string;
  @ApiProperty() labelKey!: string;
}

export class AttributeDefinitionDto {
  @ApiProperty() key!: string;
  @ApiProperty() labelKey!: string;
  @ApiProperty({ enum: ['enum', 'number', 'text', 'boolean'] }) type!: 'enum' | 'number' | 'text' | 'boolean';
  @ApiProperty() required!: boolean;
  @ApiPropertyOptional({ type: [AttributeOptionDto] }) options?: AttributeOptionDto[];
  @ApiPropertyOptional() min?: number;
  @ApiPropertyOptional() max?: number;
  @ApiPropertyOptional() maxLength?: number;
}

export class TerminologyDto {
  @ApiProperty() team!: string;
  @ApiProperty() match!: string;
}

export class SportDto {
  @ApiProperty({ example: 'football' }) key!: string;
  @ApiProperty() labelKey!: string;
  @ApiProperty() enabled!: boolean;
  @ApiProperty({ enum: ['split_year', 'calendar_year'] }) seasonFormat!: 'split_year' | 'calendar_year';
  @ApiProperty({ type: TerminologyDto }) terminology!: TerminologyDto;
  @ApiProperty({ type: [LabelledKeyDto] }) positions!: LabelledKeyDto[];
  @ApiProperty({ type: [LabelledKeyDto] }) skillCategories!: LabelledKeyDto[];
  @ApiProperty({ type: [AttributeDefinitionDto] }) attributes!: AttributeDefinitionDto[];
}
