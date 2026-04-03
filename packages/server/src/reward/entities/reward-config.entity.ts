import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('reward_configs')
export class RewardConfig {
  @ApiProperty({
    description: 'Reward config UUID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Reward category (e.g. attendance, login_bonus)',
    example: 'attendance',
  })
  @Column({ type: 'varchar', length: 30, name: 'reward_category' })
  rewardCategory: string;

  @ApiPropertyOptional({
    description: 'Day number within the reward cycle (null for non-cycle rewards)',
    example: 7,
    nullable: true,
  })
  @Column({ type: 'int', name: 'day_number', nullable: true })
  dayNumber: number | null;

  @ApiProperty({
    description: 'Type of reward to grant (diamond, gold)',
    example: 'diamond',
  })
  @Column({ type: 'varchar', length: 20, name: 'reward_type' })
  rewardType: string;

  @ApiProperty({
    description: 'Amount of reward to grant',
    example: 50,
  })
  @Column({ type: 'int', name: 'reward_amount' })
  rewardAmount: number;

  @ApiProperty({
    description: 'Whether this reward config is active',
    example: true,
  })
  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Reward config creation timestamp',
    example: '2026-01-01T00:00:00.000Z',
  })
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
