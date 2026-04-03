import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RedeemCouponDto {
  @ApiProperty({
    description: 'Coupon code to redeem',
    example: 'LAUNCH100',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;
}
