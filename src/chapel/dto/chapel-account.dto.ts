import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class UpdateChapelAccountDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  bankName: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  accountName: string;

  @ApiProperty()
  @IsString()
  @MinLength(5)
  accountNumber: string;
}
