import { ApiProperty } from '@nestjs/swagger';

export class NextRewardDto {
  @ApiProperty({ description: 'Attendance day number for this reward', example: 7 })
  dayNumber: number;

  @ApiProperty({ description: 'Type of reward (diamond, gold)', example: 'diamond' })
  rewardType: string;

  @ApiProperty({ description: 'Amount of reward to be granted', example: 50 })
  rewardAmount: number;
}

export class AttendanceStatusDto {
  @ApiProperty({
    description: 'Total number of attendance days accumulated',
    example: 6,
  })
  totalDays: number;

  @ApiProperty({
    description: 'Whether the player has already claimed their reward today',
    example: false,
  })
  claimedToday: boolean;

  @ApiProperty({
    description: 'Details of the next claimable reward, null if already claimed today',
    type: NextRewardDto,
    nullable: true,
  })
  nextReward: {
    dayNumber: number;
    rewardType: string;
    rewardAmount: number;
  } | null;
}
