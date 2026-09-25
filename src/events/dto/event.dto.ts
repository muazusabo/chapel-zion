import { ApiProperty } from '@nestjs/swagger';
import { EventStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateEventDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty()
  @IsDateString()
  date: string;

  @ApiProperty()
  @IsString()
  startTime: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiProperty()
  @IsString()
  venue: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  organizer?: string;

  @ApiProperty({ enum: EventStatus, required: false })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;
}

export class UpdateEventDto {
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
  @IsDateString()
  date?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  venue?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  organizer?: string;

  @ApiProperty({ enum: EventStatus, required: false })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;
}
