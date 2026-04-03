import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('currency_ledgers')
export class CurrencyLedger {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'player_id' })
  playerId: string;

  @Column({ type: 'varchar', length: 20, name: 'currency_type' })
  currencyType: string;

  @Column({ type: 'bigint' })
  amount: string;

  @Column({ type: 'bigint', name: 'balance_after' })
  balanceAfter: string;

  @Column({ type: 'varchar', length: 50 })
  reason: string;

  @Column({ type: 'uuid', name: 'reference_id', nullable: true })
  referenceId: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
