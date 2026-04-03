import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Coupon } from './entities/coupon.entity.js';
import { CouponRedemption } from './entities/coupon-redemption.entity.js';
import { CurrencyService } from '../currency/currency.service.js';
import { ErrorCodes } from '../common/constants/error-codes.js';
import { RedeemCouponDto } from './dto/redeem-coupon.dto.js';
import { CouponResultDto } from './dto/coupon-result.dto.js';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,

    @InjectRepository(CouponRedemption)
    private readonly couponRedemptionRepository: Repository<CouponRedemption>,

    private readonly currencyService: CurrencyService,
    private readonly dataSource: DataSource,
  ) {}

  async redeemCoupon(playerId: string, dto: RedeemCouponDto): Promise<CouponResultDto> {
    const coupon = await this.couponRepository.findOne({ where: { code: dto.code } });
    if (!coupon || !coupon.isActive) {
      throw new HttpException(
        { code: ErrorCodes.COUPON_001.code, message: ErrorCodes.COUPON_001.message },
        HttpStatus.NOT_FOUND,
      );
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      throw new HttpException(
        { code: ErrorCodes.COUPON_002.code, message: ErrorCodes.COUPON_002.message },
        HttpStatus.GONE,
      );
    }

    if (coupon.couponType === 'personal' && coupon.targetPlayerId !== playerId) {
      throw new HttpException(
        { code: ErrorCodes.COUPON_004.code, message: ErrorCodes.COUPON_004.message },
        HttpStatus.FORBIDDEN,
      );
    }

    const userRedemptionCount = await this.couponRedemptionRepository.count({
      where: { couponId: coupon.id, playerId },
    });
    if (userRedemptionCount >= coupon.perUserLimit) {
      throw new HttpException(
        { code: ErrorCodes.COUPON_003.code, message: ErrorCodes.COUPON_003.message },
        HttpStatus.CONFLICT,
      );
    }

    if (coupon.maxRedemptions > 0) {
      const totalRedemptionCount = await this.couponRedemptionRepository.count({
        where: { couponId: coupon.id },
      });
      if (totalRedemptionCount >= coupon.maxRedemptions) {
        throw new HttpException(
          { code: ErrorCodes.COUPON_005.code, message: ErrorCodes.COUPON_005.message },
          HttpStatus.CONFLICT,
        );
      }
    }

    await this.dataSource.manager.transaction(async (manager) => {
      const redemption = manager.getRepository(CouponRedemption).create({
        couponId: coupon.id,
        playerId,
      });
      await manager.getRepository(CouponRedemption).save(redemption);

      await this.currencyService.credit(
        playerId,
        coupon.rewardType,
        BigInt(coupon.rewardAmount),
        'coupon_redemption',
        redemption.id,
        manager,
      );
    });

    return {
      rewardType: coupon.rewardType,
      rewardAmount: coupon.rewardAmount,
      message: `Coupon redeemed successfully`,
    };
  }
}
