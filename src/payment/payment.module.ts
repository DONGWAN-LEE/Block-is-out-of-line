import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurrencyModule } from '../currency/currency.module.js';
import { ProductCatalog } from './entities/product-catalog.entity.js';
import { PurchaseLog } from './entities/purchase-log.entity.js';
import { PaymentController } from './payment.controller.js';
import { PaymentService } from './payment.service.js';
import { AppleStoreValidator } from './validators/apple-store.validator.js';
import { GooglePlayValidator } from './validators/google-play.validator.js';
import { TossGameValidator } from './validators/toss-game.validator.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductCatalog, PurchaseLog]),
    CurrencyModule,
  ],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    GooglePlayValidator,
    AppleStoreValidator,
    TossGameValidator,
  ],
})
export class PaymentModule {}
