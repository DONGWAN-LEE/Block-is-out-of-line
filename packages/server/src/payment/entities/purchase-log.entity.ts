import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PlayerAccount } from '../../auth/entities/player-account.entity.js';

@Entity('purchase_logs')
export class PurchaseLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'player_id' })
  playerId: string;

  @ManyToOne(() => PlayerAccount)
  player: PlayerAccount;

  @Column({ type: 'varchar', name: 'product_id' })
  productId: string;

  @Column({ type: 'varchar', length: 20 })
  store: string;

  @Column({ type: 'varchar', unique: true, name: 'transaction_id' })
  transactionId: string;

  @Column({ type: 'text', nullable: true, name: 'receipt_data' })
  receiptData: string | null;

  @Column({ type: 'varchar', length: 20 })
  status: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'reward_type' })
  rewardType: string | null;

  @Column({ type: 'int', nullable: true, name: 'reward_amount' })
  rewardAmount: number | null;

  @Column({ type: 'timestamptz', nullable: true, name: 'verified_at' })
  verifiedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
