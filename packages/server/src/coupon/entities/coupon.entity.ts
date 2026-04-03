import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({
    description: 'Coupon UUID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Unique coupon code',
    example: 'LAUNCH100',
  })
  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @ApiProperty({
    description: 'Coupon type (public, targeted)',
    example: 'public',
  })
  @Column({ type: 'varchar', length: 20, name: 'coupon_type' })
  couponType: string;

  @ApiPropertyOptional({
    description: 'Target player UUID for targeted coupons, null for public coupons',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    nullable: true,
  })
  @Column({ type: 'uuid', name: 'target_player_id', nullable: true })
  targetPlayerId: string | null;

  @ManyToOne(() => PlayerAccount, { nullable: true })
  targetPlayer: PlayerAccount | null;

  @ApiProperty({
    description: 'Type of reward granted on redemption (diamond, gold)',
    example: 'diamond',
  })
  @Column({ type: 'varchar', length: 20, name: 'reward_type' })
  rewardType: string;

  @ApiProperty({
    description: 'Amount of reward granted on redemption',
    example: 100,
  })
  @Column({ type: 'int', name: 'reward_amount' })
  rewardAmount: number;

  @ApiProperty({
    description: 'Maximum total redemptions allowed (0 = unlimited)',
    example: 1000,
  })
  @Column({ type: 'int', name: 'max_redemptions', default: 0 })
  maxRedemptions: number;

  @ApiProperty({
    description: 'Maximum redemptions per user',
    example: 1,
  })
  @Column({ type: 'int', name: 'per_user_limit', default: 1 })
  perUserLimit: number;

  @ApiPropertyOptional({
    description: 'Coupon expiry timestamp, null for no expiry',
    example: '2026-12-31T23:59:59.000Z',
    nullable: true,
  })
  @Column({ type: 'timestamptz', name: 'expires_at', nullable: true })
  expiresAt: Date | null;

  @ApiProperty({
    description: 'Whether this coupon is active',
    example: true,
  })
  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Coupon creation timestamp',
    example: '2026-01-01T00:00:00.000Z',
  })
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
