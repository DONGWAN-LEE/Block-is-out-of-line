import { ApiProperty } from '@nestjs/swagger';

export class PurchaseResultDto {
  @ApiProperty({
    description: 'Store transaction ID',
    example: 'GPA.3382-6183-1108-56407',
  })
  transactionId: string;

  @ApiProperty({
    description: 'Store product ID that was purchased',
    example: 'com.dongwanlee.blockoutline.diamond100',
  })
  productId: string;

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
    description: 'Purchase verification status',
    example: 'completed',
  })
  status: string;
}
