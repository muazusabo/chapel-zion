import { ApiProperty } from '@nestjs/swagger';
import { GalleryCategory } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateGalleryImageDto {
  @ApiProperty()
  @IsString()
  imageUrl: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  caption?: string;

  @ApiProperty({ enum: GalleryCategory })
  @IsEnum(GalleryCategory)
  category: GalleryCategory;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}

export class UpdateGalleryImageDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  caption?: string;

  @ApiProperty({ enum: GalleryCategory, required: false })
  @IsOptional()
  @IsEnum(GalleryCategory)
  category?: GalleryCategory;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}
