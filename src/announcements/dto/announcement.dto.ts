import { ApiProperty } from '@nestjs/swagger';
import { AnnouncementCategory, AnnouncementPriority, ContentStatus } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateAnnouncementDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ enum: AnnouncementCategory, required: false })
  @IsOptional()
  @IsEnum(AnnouncementCategory)
  category?: AnnouncementCategory;

  @ApiProperty({ enum: AnnouncementPriority, required: false })
  @IsOptional()
  @IsEnum(AnnouncementPriority)
  priority?: AnnouncementPriority;

  @ApiProperty({ enum: ContentStatus, required: false })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  scheduledFor?: string;
}

export class UpdateAnnouncementDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ enum: AnnouncementCategory, required: false })
  @IsOptional()
  @IsEnum(AnnouncementCategory)
  category?: AnnouncementCategory;

  @ApiProperty({ enum: AnnouncementPriority, required: false })
  @IsOptional()
  @IsEnum(AnnouncementPriority)
  priority?: AnnouncementPriority;

  @ApiProperty({ enum: ContentStatus, required: false })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  scheduledFor?: string;
}

export class AnnouncementQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ enum: AnnouncementCategory, required: false })
  @IsOptional()
  @IsEnum(AnnouncementCategory)
  category?: AnnouncementCategory;

  @ApiProperty({ required: false })
  @IsOptional()
  page?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  limit?: string;
}
