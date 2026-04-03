import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerAccount } from '../auth/entities/player-account.entity.js';
import { AttendanceLog } from '../reward/entities/attendance-log.entity.js';
import { FirstLoginBonus } from '../reward/entities/first-login-bonus.entity.js';
import { RewardConfig } from '../reward/entities/reward-config.entity.js';
import { Coupon } from '../coupon/entities/coupon.entity.js';
import { CouponRedemption } from '../coupon/entities/coupon-redemption.entity.js';
import { ProductCatalog } from '../payment/entities/product-catalog.entity.js';
import { PurchaseLog } from '../payment/entities/purchase-log.entity.js';
import { CurrencyBalance } from '../currency/entities/currency-balance.entity.js';
import { CurrencyLedger } from '../currency/entities/currency-ledger.entity.js';
import { CurrencyModule } from '../currency/currency.module.js';
import { AdminAccount } from './entities/admin-account.entity.js';
import { AdminAuthController } from './admin-auth.controller.js';
import { AdminController } from './admin.controller.js';
import { AdminAuthService } from './admin-auth.service.js';
import { AdminService } from './admin.service.js';
import { AdminAuthGuard } from './guards/admin-auth.guard.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AdminAccount,
      PlayerAccount,
      RewardConfig,
      AttendanceLog,
      FirstLoginBonus,
      Coupon,
      CouponRedemption,
      ProductCatalog,
      PurchaseLog,
      CurrencyBalance,
      CurrencyLedger,
    ]),
    CurrencyModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => ({
        secret: configService.getOrThrow<string>('ADMIN_JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('ADMIN_JWT_EXPIRY', '8h') as any,
        },
      }),
    }),
  ],
  controllers: [AdminAuthController, AdminController],
  providers: [AdminAuthService, AdminService, AdminAuthGuard],
  exports: [AdminAuthService],
})
export class AdminModule {}
