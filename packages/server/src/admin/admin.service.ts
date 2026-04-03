import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerAccount } from '../auth/entities/player-account.entity.js';
import { AttendanceLog } from '../reward/entities/attendance-log.entity.js';
import { RewardConfig } from '../reward/entities/reward-config.entity.js';
import { Coupon } from '../coupon/entities/coupon.entity.js';
import { CouponRedemption } from '../coupon/entities/coupon-redemption.entity.js';
import { ProductCatalog } from '../payment/entities/product-catalog.entity.js';
import { PurchaseLog } from '../payment/entities/purchase-log.entity.js';
import { CurrencyBalance } from '../currency/entities/currency-balance.entity.js';
import { CurrencyService } from '../currency/currency.service.js';
import { ErrorCodes } from '../common/constants/error-codes.js';
import { ErrorDto } from '../common/dto/error.dto.js';
import {
  AdjustCurrencyDto,
  BanPlayerDto,
  CreateCouponDto,
  CreateProductDto,
  CreateRewardDto,
  UpdateCouponDto,
  UpdateProductDto,
  UpdateRewardDto,
} from './dto/admin-action.dto.js';
import { PaginationQueryDto, PaymentQueryDto } from './dto/admin-query.dto.js';
import { HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(PlayerAccount)
    private readonly playerRepository: Repository<PlayerAccount>,

    @InjectRepository(AttendanceLog)
    private readonly attendanceLogRepository: Repository<AttendanceLog>,

    @InjectRepository(RewardConfig)
    private readonly rewardConfigRepository: Repository<RewardConfig>,

    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,

    @InjectRepository(CouponRedemption)
    private readonly couponRedemptionRepository: Repository<CouponRedemption>,

    @InjectRepository(ProductCatalog)
    private readonly productCatalogRepository: Repository<ProductCatalog>,

    @InjectRepository(PurchaseLog)
    private readonly purchaseLogRepository: Repository<PurchaseLog>,

    @InjectRepository(CurrencyBalance)
    private readonly currencyBalanceRepository: Repository<CurrencyBalance>,

    private readonly currencyService: CurrencyService,
  ) {}

  // ─── Dashboard ───────────────────────────────────────────────────────────────

  async getDashboardStats(): Promise<{
    dau: number;
    revenueToday: number;
    newSignupsToday: number;
    attendanceRate: number;
  }> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [dau, revenueResult, newSignups, attendanceToday] = await Promise.all([
      this.playerRepository
        .createQueryBuilder('p')
        .where('p.lastLoginAt >= :start AND p.lastLoginAt <= :end', {
          start: todayStart,
          end: todayEnd,
        })
        .getCount(),

      this.purchaseLogRepository
        .createQueryBuilder('pl')
        .select('COUNT(pl.id)', 'count')
        .where('pl.status = :status', { status: 'verified' })
        .andWhere('pl.createdAt >= :start AND pl.createdAt <= :end', {
          start: todayStart,
          end: todayEnd,
        })
        .getRawOne<{ count: string }>(),

      this.playerRepository
        .createQueryBuilder('p')
        .where('p.createdAt >= :start AND p.createdAt <= :end', {
          start: todayStart,
          end: todayEnd,
        })
        .getCount(),

      this.attendanceLogRepository
        .createQueryBuilder('al')
        .where('al.createdAt >= :start AND al.createdAt <= :end', {
          start: todayStart,
          end: todayEnd,
        })
        .getCount(),
    ]);

    const revenueToday = parseInt(revenueResult?.count ?? '0', 10);
    const attendanceRate = dau > 0 ? Math.round((attendanceToday / dau) * 100) : 0;

    return { dau, revenueToday, newSignupsToday: newSignups, attendanceRate };
  }

  // ─── Players ─────────────────────────────────────────────────────────────────

  async getPlayers(
    query: PaginationQueryDto,
  ): Promise<{ items: PlayerAccount[]; total: number; page: number; limit: number }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.playerRepository.createQueryBuilder('p');

    if (query.search) {
      qb.where('p.nickname ILIKE :search', { search: `%${query.search}%` });
    }

    qb.orderBy('p.createdAt', 'DESC').skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return { items, total, page, limit };
  }

  async getPlayerDetail(id: string): Promise<{
    player: PlayerAccount;
    balances: CurrencyBalance[];
    recentAttendance: AttendanceLog[];
    recentPurchases: PurchaseLog[];
  }> {
    const player = await this.playerRepository.findOne({ where: { id } });
    if (!player) {
      throw new HttpException(
        new ErrorDto(ErrorCodes.PLAYER_001.code, ErrorCodes.PLAYER_001.message),
        HttpStatus.NOT_FOUND,
      );
    }

    const [balances, recentAttendance, recentPurchases] = await Promise.all([
      this.currencyService.getBalances(id),
      this.attendanceLogRepository
        .createQueryBuilder('al')
        .where('al.playerId = :id', { id })
        .orderBy('al.createdAt', 'DESC')
        .take(10)
        .getMany(),
      this.purchaseLogRepository
        .createQueryBuilder('pl')
        .where('pl.playerId = :id', { id })
        .orderBy('pl.createdAt', 'DESC')
        .take(10)
        .getMany(),
    ]);

    return { player, balances, recentAttendance, recentPurchases };
  }

  async banPlayer(id: string, dto: BanPlayerDto): Promise<PlayerAccount> {
    const player = await this.playerRepository.findOne({ where: { id } });
    if (!player) {
      throw new HttpException(
        new ErrorDto(ErrorCodes.PLAYER_001.code, ErrorCodes.PLAYER_001.message),
        HttpStatus.NOT_FOUND,
      );
    }

    await this.playerRepository.update(id, {
      isBanned: true,
      banReason: dto.reason,
      banExpiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
    });

    return this.playerRepository.findOne({ where: { id } }) as Promise<PlayerAccount>;
  }

  async unbanPlayer(id: string): Promise<PlayerAccount> {
    const player = await this.playerRepository.findOne({ where: { id } });
    if (!player) {
      throw new HttpException(
        new ErrorDto(ErrorCodes.PLAYER_001.code, ErrorCodes.PLAYER_001.message),
        HttpStatus.NOT_FOUND,
      );
    }

    await this.playerRepository.update(id, {
      isBanned: false,
      banReason: null,
      banExpiresAt: null,
    });

    return this.playerRepository.findOne({ where: { id } }) as Promise<PlayerAccount>;
  }

  async adjustCurrency(
    id: string,
    dto: AdjustCurrencyDto,
  ): Promise<CurrencyBalance> {
    const player = await this.playerRepository.findOne({ where: { id } });
    if (!player) {
      throw new HttpException(
        new ErrorDto(ErrorCodes.PLAYER_001.code, ErrorCodes.PLAYER_001.message),
        HttpStatus.NOT_FOUND,
      );
    }

    const amount = BigInt(Math.abs(dto.amount));

    if (dto.amount >= 0) {
      return this.currencyService.credit(id, dto.currencyType, amount, 'admin_adjustment');
    } else {
      return this.currencyService.debit(id, dto.currencyType, amount, 'admin_adjustment');
    }
  }

  // ─── Rewards ─────────────────────────────────────────────────────────────────

  async getRewardConfigs(): Promise<RewardConfig[]> {
    return this.rewardConfigRepository.find({
      order: { rewardCategory: 'ASC', dayNumber: 'ASC' },
    });
  }

  async createRewardConfig(dto: CreateRewardDto): Promise<RewardConfig> {
    const config = this.rewardConfigRepository.create({
      rewardCategory: dto.rewardCategory,
      dayNumber: dto.dayNumber ?? null,
      rewardType: dto.rewardType,
      rewardAmount: dto.rewardAmount,
      isActive: dto.isActive ?? true,
    });
    return this.rewardConfigRepository.save(config);
  }

  async updateRewardConfig(id: string, dto: UpdateRewardDto): Promise<RewardConfig> {
    const config = await this.rewardConfigRepository.findOne({ where: { id } });
    if (!config) {
      throw new NotFoundException(
        ErrorCodes.REWARD_003.code + ': ' + ErrorCodes.REWARD_003.message,
      );
    }
    Object.assign(config, dto);
    return this.rewardConfigRepository.save(config);
  }

  async deleteRewardConfig(id: string): Promise<void> {
    const config = await this.rewardConfigRepository.findOne({ where: { id } });
    if (!config) {
      throw new NotFoundException(
        ErrorCodes.REWARD_003.code + ': ' + ErrorCodes.REWARD_003.message,
      );
    }
    await this.rewardConfigRepository.update(id, { isActive: false });
  }

  // ─── Coupons ─────────────────────────────────────────────────────────────────

  async getCoupons(
    query: PaginationQueryDto,
  ): Promise<{ items: (Coupon & { redemptionCount: number })[]; total: number; page: number; limit: number }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const rawQb = this.couponRepository
      .createQueryBuilder('c')
      .leftJoin(
        (subQuery) =>
          subQuery
            .select('cr.coupon_id', 'couponId')
            .addSelect('COUNT(*)', 'redemptionCount')
            .from(CouponRedemption, 'cr')
            .groupBy('cr.coupon_id'),
        'redemptions',
        'redemptions."couponId" = c.id',
      )
      .addSelect('COALESCE(redemptions."redemptionCount", 0)', 'redemptionCount');

    if (query.search) {
      rawQb.where('c.code ILIKE :search', { search: `%${query.search}%` });
    }

    rawQb.orderBy('c.createdAt', 'DESC').skip(skip).take(limit);

    const [rawItems, total] = await rawQb.getManyAndCount();

    const redemptionCounts = await this.couponRepository
      .createQueryBuilder('c')
      .select('c.id', 'id')
      .addSelect('COUNT(cr.id)', 'redemptionCount')
      .leftJoin('coupon_redemptions', 'cr', 'cr.coupon_id = c.id')
      .groupBy('c.id')
      .getRawMany<{ id: string; redemptionCount: string }>();

    const countMap = new Map(
      redemptionCounts.map((r) => [r.id, parseInt(r.redemptionCount, 10)]),
    );

    const items = rawItems.map((c) => ({
      ...c,
      redemptionCount: countMap.get(c.id) ?? 0,
    })) as (Coupon & { redemptionCount: number })[];

    return { items, total, page, limit };
  }

  async createCoupon(dto: CreateCouponDto): Promise<Coupon> {
    const coupon = this.couponRepository.create({
      code: dto.code,
      couponType: dto.couponType,
      targetPlayerId: dto.targetPlayerId ?? null,
      rewardType: dto.rewardType,
      rewardAmount: dto.rewardAmount,
      maxRedemptions: dto.maxRedemptions ?? 0,
      perUserLimit: dto.perUserLimit ?? 1,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
    });
    return this.couponRepository.save(coupon);
  }

  async updateCoupon(id: string, dto: UpdateCouponDto): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({ where: { id } });
    if (!coupon) {
      throw new NotFoundException(
        ErrorCodes.COUPON_001.code + ': ' + ErrorCodes.COUPON_001.message,
      );
    }
    const updates: Partial<Coupon> = {};
    if (dto.couponType !== undefined) updates.couponType = dto.couponType;
    if (dto.rewardType !== undefined) updates.rewardType = dto.rewardType;
    if (dto.rewardAmount !== undefined) updates.rewardAmount = dto.rewardAmount;
    if (dto.maxRedemptions !== undefined) updates.maxRedemptions = dto.maxRedemptions;
    if (dto.perUserLimit !== undefined) updates.perUserLimit = dto.perUserLimit;
    if (dto.expiresAt !== undefined) updates.expiresAt = new Date(dto.expiresAt);
    if (dto.isActive !== undefined) updates.isActive = dto.isActive;
    Object.assign(coupon, updates);
    return this.couponRepository.save(coupon);
  }

  async deleteCoupon(id: string): Promise<void> {
    const coupon = await this.couponRepository.findOne({ where: { id } });
    if (!coupon) {
      throw new NotFoundException(
        ErrorCodes.COUPON_001.code + ': ' + ErrorCodes.COUPON_001.message,
      );
    }
    await this.couponRepository.update(id, { isActive: false });
  }

  async getCouponRedemptions(
    couponId: string,
    query: PaginationQueryDto,
  ): Promise<{ items: CouponRedemption[]; total: number; page: number; limit: number }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [items, total] = await this.couponRedemptionRepository
      .createQueryBuilder('cr')
      .leftJoinAndSelect('cr.player', 'p')
      .where('cr.couponId = :couponId', { couponId })
      .orderBy('cr.redeemedAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { items, total, page, limit };
  }

  // ─── Products ─────────────────────────────────────────────────────────────────

  async getProducts(): Promise<ProductCatalog[]> {
    return this.productCatalogRepository.find({ order: { createdAt: 'DESC' } });
  }

  async createProduct(dto: CreateProductDto): Promise<ProductCatalog> {
    const product = this.productCatalogRepository.create({
      productId: dto.productId,
      name: dto.name,
      rewardType: dto.rewardType,
      rewardAmount: dto.rewardAmount,
      priceKrw: dto.priceKrw ?? null,
      isActive: dto.isActive ?? true,
    });
    return this.productCatalogRepository.save(product);
  }

  async updateProduct(id: string, dto: UpdateProductDto): Promise<ProductCatalog> {
    const product = await this.productCatalogRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(
        ErrorCodes.PAYMENT_003.code + ': ' + ErrorCodes.PAYMENT_003.message,
      );
    }
    Object.assign(product, dto);
    return this.productCatalogRepository.save(product);
  }

  // ─── Payments ────────────────────────────────────────────────────────────────

  async getPayments(
    query: PaymentQueryDto,
  ): Promise<{ items: PurchaseLog[]; total: number; page: number; limit: number }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.purchaseLogRepository
      .createQueryBuilder('pl')
      .leftJoinAndSelect('pl.player', 'p');

    if (query.store) {
      qb.andWhere('pl.store = :store', { store: query.store });
    }
    if (query.status) {
      qb.andWhere('pl.status = :status', { status: query.status });
    }
    if (query.dateFrom) {
      qb.andWhere('pl.createdAt >= :dateFrom', { dateFrom: new Date(query.dateFrom) });
    }
    if (query.dateTo) {
      qb.andWhere('pl.createdAt <= :dateTo', { dateTo: new Date(query.dateTo) });
    }

    qb.orderBy('pl.createdAt', 'DESC').skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return { items, total, page, limit };
  }

  async getPaymentDetail(id: string): Promise<PurchaseLog> {
    const log = await this.purchaseLogRepository
      .createQueryBuilder('pl')
      .leftJoinAndSelect('pl.player', 'p')
      .where('pl.id = :id', { id })
      .getOne();

    if (!log) {
      throw new NotFoundException(
        ErrorCodes.PAYMENT_001.code + ': ' + ErrorCodes.PAYMENT_001.message,
      );
    }

    return log;
  }
}
