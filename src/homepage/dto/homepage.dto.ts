import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, ValidateIf } from 'class-validator';

export class UpdateHomepageDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  heroTitle?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  heroSubtitle?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  heroDescription?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  heroImageUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  welcomeMessage?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  welcomeImageUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  imageSectionUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  missionPreview?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  visionPreview?: string;
}

export class UpdateAboutDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  whoWeAre?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  mission?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  vision?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  values?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  whatWeDo?: string;
}

export class UpdateScriptureDto {
  @ApiProperty()
  @IsString()
  verseText: string;

  @ApiProperty()
  @IsString()
  reference: string;
}

export class UpdateFellowshipSettingsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fcsName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  chapelName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  contactEmail?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false })
  @ValidateIf((o) => !!o.facebookUrl)
  @IsUrl()
  facebookUrl?: string;

  @ApiProperty({ required: false })
  @ValidateIf((o) => !!o.instagramUrl)
  @IsUrl()
  instagramUrl?: string;

  @ApiProperty({ required: false })
  @ValidateIf((o) => !!o.twitterUrl)
  @IsUrl()
  twitterUrl?: string;

  @ApiProperty({ required: false })
  @ValidateIf((o) => !!o.whatsappUrl)
  @IsUrl()
  whatsappUrl?: string;

  @ApiProperty({ required: false })
  @ValidateIf((o) => !!o.youtubeUrl)
  @IsUrl()
  youtubeUrl?: string;
}
