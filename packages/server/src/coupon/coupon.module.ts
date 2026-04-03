import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coupon } from './entities/coupon.entity.js';
import { CouponRedemption } from './entities/coupon-redemption.entity.js';
import { CurrencyModule } from '../currency/currency.module.js';
import { CouponService } from './coupon.service.js';
import { CouponController } from './coupon.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Coupon, CouponRedemption]),
    CurrencyModule,
  ],
  providers: [CouponService],
  controllers: [CouponController],
})
export class CouponModule {}
