import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('product_catalog')
export class ProductCatalog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true, name: 'product_id' })
  productId: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', length: 20, name: 'reward_type' })
  rewardType: string;

  @Column({ type: 'int', name: 'reward_amount' })
  rewardAmount: number;

  @Column({ type: 'int', nullable: true, name: 'price_krw' })
  priceKrw: number | null;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
