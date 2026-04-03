import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Coupon } from './coupon.entity.js';
import { PlayerAccount } from '../../auth/entities/player-account.entity.js';

@Entity('coupon_redemptions')
@Unique(['couponId', 'playerId'])
export class CouponRedemption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'coupon_id' })
  couponId: string;

  @ManyToOne(() => Coupon)
  coupon: Coupon;

  @Column({ type: 'uuid', name: 'player_id' })
  playerId: string;

  @ManyToOne(() => PlayerAccount)
  player: PlayerAccount;

  @CreateDateColumn({ name: 'redeemed_at', type: 'timestamptz' })
  redeemedAt: Date;
}
