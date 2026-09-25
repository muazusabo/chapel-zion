import { ApiProperty } from '@nestjs/swagger';
import { ContentStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateNewsDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty({ required: false, description: 'Auto-generated from title if omitted' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  featuredImage?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  excerpt?: string;

  @ApiProperty()
  @IsString()
  @MinLength(20)
  content: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ enum: ContentStatus, required: false })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  scheduledFor?: string;
}

export class UpdateNewsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  featuredImage?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  excerpt?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(20)
  content?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ enum: ContentStatus, required: false })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  scheduledFor?: string;
}
