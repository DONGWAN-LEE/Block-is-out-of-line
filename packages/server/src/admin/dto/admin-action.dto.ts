import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class BanPlayerDto {
  @ApiProperty({
    description: 'Reason for banning the player',
    example: 'Cheating detected via anti-cheat system',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({
    description: 'Ban expiry date (ISO 8601). Omit for permanent ban.',
    example: '2026-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class AdjustCurrencyDto {
  @ApiProperty({
    description: 'Currency type to adjust',
    example: 'diamond',
    enum: ['diamond', 'gold'],
  })
  @IsEnum(['diamond', 'gold'])
  currencyType: string;

  @ApiProperty({
    description: 'Amount to adjust (positive to add, negative to deduct)',
    example: 100,
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'Reason for the currency adjustment',
    example: 'Compensation for server downtime',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class CreateRewardDto {
  @ApiProperty({
    description: 'Reward category (e.g. attendance, login_bonus)',
    example: 'attendance',
  })
  @IsString()
  @IsNotEmpty()
  rewardCategory: string;

  @ApiPropertyOptional({
    description: 'Day number within the reward cycle (for attendance rewards)',
    example: 7,
  })
  @IsOptional()
  @IsInt()
  dayNumber?: number;

  @ApiProperty({
    description: 'Type of reward to grant (diamond, gold)',
    example: 'diamond',
  })
  @IsString()
  @IsNotEmpty()
  rewardType: string;

  @ApiProperty({
    description: 'Amount of reward to grant',
    example: 50,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  rewardAmount: number;

  @ApiPropertyOptional({
    description: 'Whether this reward config is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateRewardDto {
  @ApiPropertyOptional({
    description: 'Reward category (e.g. attendance, login_bonus)',
    example: 'attendance',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  rewardCategory?: string;

  @ApiPropertyOptional({
    description: 'Day number within the reward cycle',
    example: 7,
  })
  @IsOptional()
  @IsInt()
  dayNumber?: number;

  @ApiPropertyOptional({
    description: 'Type of reward to grant (diamond, gold)',
    example: 'diamond',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  rewardType?: string;

  @ApiPropertyOptional({
    description: 'Amount of reward to grant',
    example: 50,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  rewardAmount?: number;

  @ApiPropertyOptional({
    description: 'Whether this reward config is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateCouponDto {
  @ApiProperty({
    description: 'Unique coupon code',
    example: 'LAUNCH100',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description: 'Coupon type (public, targeted)',
    example: 'public',
  })
  @IsString()
  @IsNotEmpty()
  couponType: string;

  @ApiPropertyOptional({
    description: 'Target player UUID for targeted coupons',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsOptional()
  @IsString()
  targetPlayerId?: string;

  @ApiProperty({
    description: 'Type of reward granted on redemption (diamond, gold)',
    example: 'diamond',
  })
  @IsString()
  @IsNotEmpty()
  rewardType: string;

  @ApiProperty({
    description: 'Amount of reward granted on redemption',
    example: 100,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  rewardAmount: number;

  @ApiPropertyOptional({
    description: 'Maximum total redemptions allowed (0 = unlimited)',
    example: 1000,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxRedemptions?: number;

  @ApiPropertyOptional({
    description: 'Maximum redemptions per user',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  perUserLimit?: number;

  @ApiPropertyOptional({
    description: 'Coupon expiry date (ISO 8601)',
    example: '2026-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class UpdateCouponDto {
  @ApiPropertyOptional({
    description: 'Coupon type (public, targeted)',
    example: 'public',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  couponType?: string;

  @ApiPropertyOptional({
    description: 'Type of reward granted on redemption (diamond, gold)',
    example: 'diamond',
  })
  @IsOptional()
  @IsString()
  rewardType?: string;

  @ApiPropertyOptional({
    description: 'Amount of reward granted on redemption',
    example: 100,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  rewardAmount?: number;

  @ApiPropertyOptional({
    description: 'Maximum total redemptions allowed (0 = unlimited)',
    example: 1000,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxRedemptions?: number;

  @ApiPropertyOptional({
    description: 'Maximum redemptions per user',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  perUserLimit?: number;

  @ApiPropertyOptional({
    description: 'Coupon expiry date (ISO 8601)',
    example: '2026-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({
    description: 'Whether this coupon is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateProductDto {
  @ApiProperty({
    description: 'Store product ID matching the app store listing',
    example: 'com.dongwanlee.blockoutline.diamond100',
  })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'Human-readable product name',
    example: 'Diamond 100',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Type of reward granted on purchase (diamond, gold)',
    example: 'diamond',
  })
  @IsString()
  @IsNotEmpty()
  rewardType: string;

  @ApiProperty({
    description: 'Amount of reward granted on purchase',
    example: 100,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  rewardAmount: number;

  @ApiPropertyOptional({
    description: 'Price in Korean Won (KRW)',
    example: 1100,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  priceKrw?: number;

  @ApiPropertyOptional({
    description: 'Whether this product is available for purchase',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateProductDto {
  @ApiPropertyOptional({
    description: 'Human-readable product name',
    example: 'Diamond 100',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({
    description: 'Type of reward granted on purchase (diamond, gold)',
    example: 'diamond',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  rewardType?: string;

  @ApiPropertyOptional({
    description: 'Amount of reward granted on purchase',
    example: 100,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  rewardAmount?: number;

  @ApiPropertyOptional({
    description: 'Price in Korean Won (KRW)',
    example: 1100,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  priceKrw?: number;

  @ApiPropertyOptional({
    description: 'Whether this product is available for purchase',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
