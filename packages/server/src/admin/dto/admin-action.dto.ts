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
  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class AdjustCurrencyDto {
  @IsEnum(['diamond', 'gold'])
  currencyType: string;

  @IsNumber()
  amount: number;

  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class CreateRewardDto {
  @IsString()
  @IsNotEmpty()
  rewardCategory: string;

  @IsOptional()
  @IsInt()
  dayNumber?: number;

  @IsString()
  @IsNotEmpty()
  rewardType: string;

  @IsInt()
  @Min(1)
  rewardAmount: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateRewardDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  rewardCategory?: string;

  @IsOptional()
  @IsInt()
  dayNumber?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  rewardType?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  rewardAmount?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateCouponDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  couponType: string;

  @IsOptional()
  @IsString()
  targetPlayerId?: string;

  @IsString()
  @IsNotEmpty()
  rewardType: string;

  @IsInt()
  @Min(1)
  rewardAmount: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  maxRedemptions?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  perUserLimit?: number;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class UpdateCouponDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  couponType?: string;

  @IsOptional()
  @IsString()
  rewardType?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  rewardAmount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  maxRedemptions?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  perUserLimit?: number;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  rewardType: string;

  @IsInt()
  @Min(1)
  rewardAmount: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  priceKrw?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  rewardType?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  rewardAmount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  priceKrw?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
