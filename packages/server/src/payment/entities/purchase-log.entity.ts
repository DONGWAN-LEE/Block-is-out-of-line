import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({
    description: 'Purchase log UUID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Player account UUID who made the purchase',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @Column({ type: 'uuid', name: 'player_id' })
  playerId: string;

  @ManyToOne(() => PlayerAccount)
  player: PlayerAccount;

  @ApiProperty({
    description: 'Store product ID that was purchased',
    example: 'com.dongwanlee.blockoutline.diamond100',
  })
  @Column({ type: 'varchar', name: 'product_id' })
  productId: string;

  @ApiProperty({
    description: 'App store where the purchase was made (google, apple, toss)',
    example: 'google',
  })
  @Column({ type: 'varchar', length: 20 })
  store: string;

  @ApiProperty({
    description: 'Unique store transaction ID',
    example: 'GPA.3382-6183-1108-56407',
  })
  @Column({ type: 'varchar', unique: true, name: 'transaction_id' })
  transactionId: string;

  @ApiPropertyOptional({
    description: 'Raw receipt data from the store, null after verification',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true, name: 'receipt_data' })
  receiptData: string | null;

  @ApiProperty({
    description: 'Purchase verification status (pending, completed, failed)',
    example: 'completed',
  })
  @Column({ type: 'varchar', length: 20 })
  status: string;

  @ApiPropertyOptional({
    description: 'Type of reward granted (diamond, gold), null if not yet verified',
    example: 'diamond',
    nullable: true,
  })
  @Column({ type: 'varchar', length: 20, nullable: true, name: 'reward_type' })
  rewardType: string | null;

  @ApiPropertyOptional({
    description: 'Amount of reward granted, null if not yet verified',
    example: 100,
    nullable: true,
  })
  @Column({ type: 'int', nullable: true, name: 'reward_amount' })
  rewardAmount: number | null;

  @ApiPropertyOptional({
    description: 'Timestamp when the purchase was verified, null if pending',
    example: '2026-04-01T12:00:00.000Z',
    nullable: true,
  })
  @Column({ type: 'timestamptz', nullable: true, name: 'verified_at' })
  verifiedAt: Date | null;

  @ApiProperty({
    description: 'Purchase log creation timestamp',
    example: '2026-04-01T12:00:00.000Z',
  })
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
