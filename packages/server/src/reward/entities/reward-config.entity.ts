import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('reward_configs')
export class RewardConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 30, name: 'reward_category' })
  rewardCategory: string;

  @Column({ type: 'int', name: 'day_number', nullable: true })
  dayNumber: number | null;

  @Column({ type: 'varchar', length: 20, name: 'reward_type' })
  rewardType: string;

  @Column({ type: 'int', name: 'reward_amount' })
  rewardAmount: number;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
