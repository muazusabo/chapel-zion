import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  faculty?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  studentId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  profilePicture?: string;
}
