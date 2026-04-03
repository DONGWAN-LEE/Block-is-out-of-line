import { ApiProperty } from '@nestjs/swagger';

export class RewardResultDto {
  @ApiProperty({
    description: 'Type of reward granted (diamond, gold)',
    example: 'diamond',
  })
  rewardType: string;

  @ApiProperty({
    description: 'Amount of reward granted',
    example: 50,
  })
  rewardAmount: number;

  @ApiProperty({
    description: 'Human-readable result message',
    example: 'Day 7 attendance reward claimed: 50 diamonds',
  })
  message: string;
}
