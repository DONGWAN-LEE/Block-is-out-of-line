import { ApiProperty } from '@nestjs/swagger';

export class CouponResultDto {
  @ApiProperty({
    description: 'Type of reward granted (diamond, gold)',
    example: 'diamond',
  })
  rewardType: string;

  @ApiProperty({
    description: 'Amount of reward granted',
    example: 100,
  })
  rewardAmount: number;

  @ApiProperty({
    description: 'Human-readable result message',
    example: 'Coupon LAUNCH100 redeemed: 100 diamonds',
  })
  message: string;
}
