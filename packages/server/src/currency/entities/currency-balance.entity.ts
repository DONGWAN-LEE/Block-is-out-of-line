import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

@Entity('currency_balances')
@Unique(['playerId', 'currencyType'])
export class CurrencyBalance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'player_id' })
  playerId: string;

  @Column({ type: 'varchar', length: 20, name: 'currency_type' })
  currencyType: string;

  @Column({ type: 'bigint', default: 0 })
  balance: string;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
