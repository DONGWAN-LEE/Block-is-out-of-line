import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PlayerAccount } from './player-account.entity.js';

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  playerId: string;

  @ManyToOne(() => PlayerAccount, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'playerId' })
  player: PlayerAccount;

  @Column({ type: 'varchar' })
  tokenHash: string;

  @Column({ type: 'varchar', nullable: true })
  deviceInfo: string | null;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
