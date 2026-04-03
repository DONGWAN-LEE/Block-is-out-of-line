import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class VerifyReceiptDto {
  @ApiProperty({
    description: 'App store (google, apple, toss)',
    example: 'google',
    enum: ['google', 'apple', 'toss'],
  })
  @IsEnum(['google', 'apple', 'toss'])
  store: string;

  @ApiProperty({
    description: 'Purchase token/receipt from client',
    example: 'AEuhp4K7Lm3...',
  })
  @IsString()
  @IsNotEmpty()
  receipt: string;

  @ApiProperty({
    description: 'Store product ID',
    example: 'com.dongwanlee.blockoutline.diamond100',
  })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'Store transaction ID',
    example: 'GPA.3382-6183-1108-56407',
  })
  @IsString()
  @IsNotEmpty()
  transactionId: string;
}
