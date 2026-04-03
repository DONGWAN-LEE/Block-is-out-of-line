import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { CurrencyService } from '../currency/currency.service.js';
import { ErrorCodes } from '../common/constants/error-codes.js';
import { PurchaseResultDto } from './dto/purchase-result.dto.js';
import { VerifyReceiptDto } from './dto/verify-receipt.dto.js';
import { ProductCatalog } from './entities/product-catalog.entity.js';
import { PurchaseLog } from './entities/purchase-log.entity.js';
import { AppleStoreValidator } from './validators/apple-store.validator.js';
import { GooglePlayValidator } from './validators/google-play.validator.js';
import { TossGameValidator } from './validators/toss-game.validator.js';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectRepository(ProductCatalog)
    private readonly productCatalogRepository: Repository<ProductCatalog>,

    @InjectRepository(PurchaseLog)
    private readonly purchaseLogRepository: Repository<PurchaseLog>,

    private readonly currencyService: CurrencyService,
    private readonly googlePlayValidator: GooglePlayValidator,
    private readonly appleStoreValidator: AppleStoreValidator,
    private readonly tossGameValidator: TossGameValidator,
  ) {}

  async verifyAndFulfill(
    playerId: string,
    dto: VerifyReceiptDto,
  ): Promise<PurchaseResultDto> {
    // 1. Idempotency check — return existing result if already processed
    const existing = await this.purchaseLogRepository.findOne({
      where: { transactionId: dto.transactionId },
    });

    if (existing) {
      if (existing.status === 'verified') {
        return {
          transactionId: existing.transactionId,
          productId: existing.productId,
          rewardType: existing.rewardType ?? '',
          rewardAmount: existing.rewardAmount ?? 0,
          status: existing.status,
        };
      }
      throw new HttpException(
        {
          code: ErrorCodes.PAYMENT_002.code,
          message: ErrorCodes.PAYMENT_002.message,
        },
        HttpStatus.CONFLICT,
      );
    }

    // 2. Look up product in catalog
    const product = await this.productCatalogRepository.findOne({
      where: { productId: dto.productId, isActive: true },
    });

    if (!product) {
      throw new HttpException(
        {
          code: ErrorCodes.PAYMENT_003.code,
          message: ErrorCodes.PAYMENT_003.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // 3. Verify receipt with appropriate store validator
    let isValid = false;
    let verifiedTransactionId = dto.transactionId;

    if (dto.store === 'google') {
      const result = await this.googlePlayValidator.verify(dto.productId, dto.receipt);
      isValid = result.isValid;
      if (result.transactionId) verifiedTransactionId = result.transactionId;
    } else if (dto.store === 'apple') {
      const result = await this.appleStoreValidator.verify(dto.receipt);
      isValid = result.isValid;
      if (result.transactionId) verifiedTransactionId = result.transactionId;
    } else if (dto.store === 'toss') {
      const result = await this.tossGameValidator.verify(dto.receipt, dto.productId);
      isValid = result.isValid;
      if (result.transactionId) verifiedTransactionId = result.transactionId;
    }

    // 4. Save failed log and throw if verification failed
    if (!isValid) {
      const failedLog = this.purchaseLogRepository.create({
        playerId,
        productId: dto.productId,
        store: dto.store,
        transactionId: dto.transactionId,
        receiptData: dto.receipt,
        status: 'failed',
        rewardType: product.rewardType,
        rewardAmount: product.rewardAmount,
        verifiedAt: null,
      });
      await this.purchaseLogRepository.save(failedLog);

      throw new HttpException(
        {
          code: ErrorCodes.PAYMENT_004.code,
          message: ErrorCodes.PAYMENT_004.message,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    // 5. In a transaction: insert purchase_log and credit currency
    const purchaseLog = await this.purchaseLogRepository.manager.transaction(
      async (em: EntityManager) => {
        const logRepo = em.getRepository(PurchaseLog);

        const log = logRepo.create({
          playerId,
          productId: dto.productId,
          store: dto.store,
          transactionId: verifiedTransactionId,
          receiptData: dto.receipt,
          status: 'verified',
          rewardType: product.rewardType,
          rewardAmount: product.rewardAmount,
          verifiedAt: new Date(),
        });
        const savedLog = await logRepo.save(log);

        await this.currencyService.credit(
          playerId,
          product.rewardType,
          BigInt(product.rewardAmount),
          'purchase',
          savedLog.id,
          em,
        );

        return savedLog;
      },
    );

    this.logger.log(
      `Purchase fulfilled: playerId=${playerId} productId=${dto.productId} store=${dto.store} transactionId=${verifiedTransactionId}`,
    );

    return {
      transactionId: purchaseLog.transactionId,
      productId: purchaseLog.productId,
      rewardType: purchaseLog.rewardType ?? '',
      rewardAmount: purchaseLog.rewardAmount ?? 0,
      status: purchaseLog.status,
    };
  }

  async getProducts(): Promise<ProductCatalog[]> {
    return this.productCatalogRepository.find({ where: { isActive: true } });
  }

  async getHistory(playerId: string): Promise<PurchaseLog[]> {
    return this.purchaseLogRepository.find({
      where: { playerId },
      order: { createdAt: 'DESC' },
    });
  }
}
