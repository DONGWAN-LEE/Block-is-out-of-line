import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('product_catalog')
export class ProductCatalog {
  @ApiProperty({
    description: 'Product catalog UUID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Store product ID matching the app store listing',
    example: 'com.dongwanlee.blockoutline.diamond100',
  })
  @Column({ type: 'varchar', unique: true, name: 'product_id' })
  productId: string;

  @ApiProperty({
    description: 'Human-readable product name',
    example: 'Diamond 100',
  })
  @Column({ type: 'varchar' })
  name: string;

  @ApiProperty({
    description: 'Type of reward granted on purchase (diamond, gold)',
    example: 'diamond',
  })
  @Column({ type: 'varchar', length: 20, name: 'reward_type' })
  rewardType: string;

  @ApiProperty({
    description: 'Amount of reward granted on purchase',
    example: 100,
  })
  @Column({ type: 'int', name: 'reward_amount' })
  rewardAmount: number;

  @ApiPropertyOptional({
    description: 'Price in Korean Won (KRW), null if free',
    example: 1100,
    nullable: true,
  })
  @Column({ type: 'int', nullable: true, name: 'price_krw' })
  priceKrw: number | null;

  @ApiProperty({
    description: 'Whether this product is available for purchase',
    example: true,
  })
  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @ApiProperty({
    description: 'Product creation timestamp',
    example: '2026-01-01T00:00:00.000Z',
  })
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
