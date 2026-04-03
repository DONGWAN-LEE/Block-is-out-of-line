import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PlayerAccount } from '../../auth/entities/player-account.entity.js';

@Entity('coupons')
export class Coupon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 20, name: 'coupon_type' })
  couponType: string;

  @Column({ type: 'uuid', name: 'target_player_id', nullable: true })
  targetPlayerId: string | null;

  @ManyToOne(() => PlayerAccount, { nullable: true })
  targetPlayer: PlayerAccount | null;

  @Column({ type: 'varchar', length: 20, name: 'reward_type' })
  rewardType: string;

  @Column({ type: 'int', name: 'reward_amount' })
  rewardAmount: number;

  @Column({ type: 'int', name: 'max_redemptions', default: 0 })
  maxRedemptions: number;

  @Column({ type: 'int', name: 'per_user_limit', default: 1 })
  perUserLimit: number;

  @Column({ type: 'timestamptz', name: 'expires_at', nullable: true })
  expiresAt: Date | null;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
