import { ApiProperty } from '@nestjs/swagger';
import { GivingType } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class InitializePaymentDto {
  @ApiProperty({ description: 'Amount in Naira (not kobo)' })
  @IsNumber()
  @Min(100, { message: 'Minimum amount is ₦100' })
  amount: number;

  @ApiProperty({ enum: GivingType })
  @IsEnum(GivingType)
  givingType: GivingType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ required: false, description: 'Date the offline transfer was made' })
  @IsOptional()
  @IsString()
  transferDate?: string;
}
