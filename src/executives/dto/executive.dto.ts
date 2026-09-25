import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsInt, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateExecutiveDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  fullName: string;

  @ApiProperty()
  @IsString()
  position: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  biography?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  order?: number;
}

export class UpdateExecutiveDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  fullName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  biography?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  order?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

class ReorderItem {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsInt()
  order: number;
}

export class ReorderExecutivesDto {
  @ApiProperty({ type: [ReorderItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItem)
  items: ReorderItem[];
}
