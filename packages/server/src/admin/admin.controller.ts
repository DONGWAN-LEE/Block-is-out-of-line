import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse } from '../common/dto/response.dto.js';
import { AdminService } from './admin.service.js';
import { AdminAuthGuard } from './guards/admin-auth.guard.js';
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

@Controller('admin')
@UseGuards(AdminAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ─── Dashboard ───────────────────────────────────────────────────────────────

  @Get('dashboard/stats')
  async getDashboardStats(): Promise<ApiResponse<any>> {
    const data = await this.adminService.getDashboardStats();
    return ApiResponse.ok(data);
  }

  // ─── Players ─────────────────────────────────────────────────────────────────

  @Get('players')
  async getPlayers(@Query() query: PaginationQueryDto): Promise<ApiResponse<any>> {
    const data = await this.adminService.getPlayers(query);
    return ApiResponse.ok(data);
  }

  @Get('players/:id')
  async getPlayerDetail(@Param('id') id: string): Promise<ApiResponse<any>> {
    const data = await this.adminService.getPlayerDetail(id);
    return ApiResponse.ok(data);
  }

  @Post('players/:id/ban')
  @HttpCode(HttpStatus.OK)
  async banPlayer(
    @Param('id') id: string,
    @Body() dto: BanPlayerDto,
  ): Promise<ApiResponse<any>> {
    const data = await this.adminService.banPlayer(id, dto);
    return ApiResponse.ok(data);
  }

  @Post('players/:id/unban')
  @HttpCode(HttpStatus.OK)
  async unbanPlayer(@Param('id') id: string): Promise<ApiResponse<any>> {
    const data = await this.adminService.unbanPlayer(id);
    return ApiResponse.ok(data);
  }

  @Post('players/:id/currency')
  @HttpCode(HttpStatus.OK)
  async adjustCurrency(
    @Param('id') id: string,
    @Body() dto: AdjustCurrencyDto,
  ): Promise<ApiResponse<any>> {
    const data = await this.adminService.adjustCurrency(id, dto);
    return ApiResponse.ok(data);
  }

  // ─── Rewards ─────────────────────────────────────────────────────────────────

  @Get('rewards')
  async getRewardConfigs(): Promise<ApiResponse<any>> {
    const data = await this.adminService.getRewardConfigs();
    return ApiResponse.ok(data);
  }

  @Post('rewards')
  async createRewardConfig(@Body() dto: CreateRewardDto): Promise<ApiResponse<any>> {
    const data = await this.adminService.createRewardConfig(dto);
    return ApiResponse.ok(data);
  }

  @Patch('rewards/:id')
  async updateRewardConfig(
    @Param('id') id: string,
    @Body() dto: UpdateRewardDto,
  ): Promise<ApiResponse<any>> {
    const data = await this.adminService.updateRewardConfig(id, dto);
    return ApiResponse.ok(data);
  }

  @Delete('rewards/:id')
  @HttpCode(HttpStatus.OK)
  async deleteRewardConfig(@Param('id') id: string): Promise<ApiResponse<null>> {
    await this.adminService.deleteRewardConfig(id);
    return ApiResponse.ok(null);
  }

  // ─── Coupons ─────────────────────────────────────────────────────────────────

  @Get('coupons')
  async getCoupons(@Query() query: PaginationQueryDto): Promise<ApiResponse<any>> {
    const data = await this.adminService.getCoupons(query);
    return ApiResponse.ok(data);
  }

  @Post('coupons')
  async createCoupon(@Body() dto: CreateCouponDto): Promise<ApiResponse<any>> {
    const data = await this.adminService.createCoupon(dto);
    return ApiResponse.ok(data);
  }

  @Patch('coupons/:id')
  async updateCoupon(
    @Param('id') id: string,
    @Body() dto: UpdateCouponDto,
  ): Promise<ApiResponse<any>> {
    const data = await this.adminService.updateCoupon(id, dto);
    return ApiResponse.ok(data);
  }

  @Delete('coupons/:id')
  @HttpCode(HttpStatus.OK)
  async deleteCoupon(@Param('id') id: string): Promise<ApiResponse<null>> {
    await this.adminService.deleteCoupon(id);
    return ApiResponse.ok(null);
  }

  @Get('coupons/:id/redemptions')
  async getCouponRedemptions(
    @Param('id') id: string,
    @Query() query: PaginationQueryDto,
  ): Promise<ApiResponse<any>> {
    const data = await this.adminService.getCouponRedemptions(id, query);
    return ApiResponse.ok(data);
  }

  // ─── Products ─────────────────────────────────────────────────────────────────

  @Get('products')
  async getProducts(): Promise<ApiResponse<any>> {
    const data = await this.adminService.getProducts();
    return ApiResponse.ok(data);
  }

  @Post('products')
  async createProduct(@Body() dto: CreateProductDto): Promise<ApiResponse<any>> {
    const data = await this.adminService.createProduct(dto);
    return ApiResponse.ok(data);
  }

  @Patch('products/:id')
  async updateProduct(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<ApiResponse<any>> {
    const data = await this.adminService.updateProduct(id, dto);
    return ApiResponse.ok(data);
  }

  // ─── Payments ────────────────────────────────────────────────────────────────

  @Get('payments')
  async getPayments(@Query() query: PaymentQueryDto): Promise<ApiResponse<any>> {
    const data = await this.adminService.getPayments(query);
    return ApiResponse.ok(data);
  }

  @Get('payments/:id')
  async getPaymentDetail(@Param('id') id: string): Promise<ApiResponse<any>> {
    const data = await this.adminService.getPaymentDetail(id);
    return ApiResponse.ok(data);
  }
}
