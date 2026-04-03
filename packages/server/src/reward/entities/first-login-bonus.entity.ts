import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PlayerAccount } from '../../auth/entities/player-account.entity.js';

@Entity('first_login_bonuses')
export class FirstLoginBonus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'player_id', unique: true })
  playerId: string;

  @OneToOne(() => PlayerAccount)
  player: PlayerAccount;

  @Column({ type: 'timestamptz', name: 'claimed_at' })
  claimedAt: Date;

  @Column({ type: 'varchar', length: 20, name: 'reward_type' })
  rewardType: string;

  @Column({ type: 'int', name: 'reward_amount' })
  rewardAmount: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
