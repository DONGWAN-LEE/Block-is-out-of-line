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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse as SwaggerApiResponse,
  ApiTags,
} from '@nestjs/swagger';
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

@ApiTags('Admin')
@ApiBearerAuth('admin-jwt')
@Controller('admin')
@UseGuards(AdminAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ─── Dashboard ───────────────────────────────────────────────────────────────

  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Dashboard KPIs (DAU, revenue, signups, attendance)' })
  @SwaggerApiResponse({ status: 401, description: 'Unauthorized' })
  async getDashboardStats(): Promise<ApiResponse<any>> {
    const data = await this.adminService.getDashboardStats();
    return ApiResponse.ok(data);
  }

  // ─── Players ─────────────────────────────────────────────────────────────────

  @Get('players')
  @ApiOperation({ summary: 'List players with search/pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @SwaggerApiResponse({ status: 401, description: 'Unauthorized' })
  async getPlayers(@Query() query: PaginationQueryDto): Promise<ApiResponse<any>> {
    const data = await this.adminService.getPlayers(query);
    return ApiResponse.ok(data);
  }

  @Get('players/:id')
  @ApiOperation({ summary: 'Player detail with balances and activity' })
  @ApiParam({ name: 'id', type: String })
  @SwaggerApiResponse({ status: 401, description: 'Unauthorized' })
  async getPlayerDetail(@Param('id') id: string): Promise<ApiResponse<any>> {
    const data = await this.adminService.getPlayerDetail(id);
    return ApiResponse.ok(data);
  }

  @Post('players/:id/ban')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ban a player' })
  @ApiParam({ name: 'id', type: String })
  @SwaggerApiResponse({ status: 400, description: 'Validation error' })
  @SwaggerApiResponse({ status: 401, description: 'Unauthorized' })
  async banPlayer(
    @Param('id') id: string,
    @Body() dto: BanPlayerDto,
  ): Promise<ApiResponse<any>> {
    const data = await this.adminService.banPlayer(id, dto);
    return ApiResponse.ok(data);
  }

  @Post('players/:id/unban')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unban a player' })
  @ApiParam({ name: 'id', type: String })
  @SwaggerApiResponse({ status: 401, description: 'Unauthorized' })
  async unbanPlayer(@Param('id') id: string): Promise<ApiResponse<any>> {
    const data = await this.adminService.unbanPlayer(id);
    return ApiResponse.ok(data);
  }

  @Post('players/:id/currency')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Adjust player currency' })
  @ApiParam({ name: 'id', type: String })
  @SwaggerApiResponse({ status: 400, description: 'Validation error' })
  @SwaggerApiResponse({ status: 401, description: 'Unauthorized' })
  async adjustCurrency(
    @Param('id') id: string,
    @Body() dto: AdjustCurrencyDto,
  ): Promise<ApiResponse<any>> {
    const data = await this.adminService.adjustCurrency(id, dto);
    return ApiResponse.ok(data);
  }

  // ─── Rewards ─────────────────────────────────────────────────────────────────

  @Get('rewards')
  @ApiOperation({ summary: 'List reward configs' })
  @SwaggerApiResponse({ status: 401, description: 'Unauthorized' })
  async getRewardConfigs(): Promise<ApiResponse<any>> {
    const data = await this.adminService.getRewardConfigs();
    return ApiResponse.ok(data);
  }

  @Post('rewards')
  @ApiOperation({ summary: 'Create reward config' })
  @SwaggerApiResponse({ status: 400, description: 'Validation error' })
  @SwaggerApiResponse({ status: 401, description: 'Unauthorized' })
  async createRewardConfig(@Body() dto: CreateRewardDto): Promise<ApiResponse<any>> {
    const data = await this.adminService.createRewardConfig(dto);
    return ApiResponse.ok(data);
  }

  @Patch('rewards/:id')
  @ApiOperation({ summary: 'Update reward config' })
  @ApiParam({ name: 'id', type: String })
  @SwaggerApiResponse({ status: 400, description: 'Validation error' })
  @SwaggerApiResponse({ status: 401, description: 'Unauthorized' })
  async updateRewardConfig(
    @Param('id') id: string,
    @Body() dto: UpdateRewardDto,
  ): Promise<ApiResponse<any>> {
    const data = await this.adminService.updateRewardConfig(id, dto);
    return ApiResponse.ok(data);
  }

  @Delete('rewards/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete reward config' })
  @ApiParam({ name: 'id', type: String })
  @SwaggerApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteRewardConfig(@Param('id') id: string): Promise<ApiResponse<null>> {
    await this.adminService.deleteRewardConfig(id);
    return ApiResponse.ok(null);
  }

  // ─── Coupons ─────────────────────────────────────────────────────────────────

  @Get('coupons')
  @ApiOperation({ summary: 'List coupons with stats' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @SwaggerApiResponse({ status: 401, description: 'Unauthorized' })
  async getCoupons(@Query() query: PaginationQueryDto): Promise<ApiResponse<any>> {
    const data = await this.adminService.getCoupons(query);
    return ApiResponse.ok(data);
  }

  @Post('coupons')
  @ApiOperation({ summary: 'Create coupon' })
  @SwaggerApiResponse({ status: 400, description: 'Validation error' })
  @SwaggerApiResponse({ status: 401, description: 'Unauthorized' })
  async createCoupon(@Body() dto: CreateCouponDto): Promise<ApiResponse<any>> {
    const data = await this.adminService.createCoupon(dto);
    return ApiResponse.ok(data);
  }

  @Patch('coupons/:id')
  @ApiOperation({ summary: 'Update coupon' })
  @ApiParam({ name: 'id', type: String })
  @SwaggerApiResponse({ status: 400, description: 'Validation error' })
  @SwaggerApiResponse({ status: 401, description: 'Unauthorized' })
  async updateCoupon(
    @Param('id') id: string,
    @Body() dto: UpdateCouponDto,
  ): Promise<ApiResponse<any>> {
    const data = await this.adminService.updateCoupon(id, dto);
    return ApiResponse.ok(data);
  }

  @Delete('coupons/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate coupon' })
  @ApiParam({ name: 'id', type: String })
  @SwaggerApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteCoupon(@Param('id') id: string): Promise<ApiResponse<null>> {
    await this.adminService.deleteCoupon(id);
    return ApiResponse.ok(null);
  }

  @Get('coupons/:id/redemptions')
  @ApiOperation({ summary: 'List coupon redemptions' })
  @ApiParam({ name: 'id', type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @SwaggerApiResponse({ status: 401, description: 'Unauthorized' })
  async getCouponRedemptions(
    @Param('id') id: string,
    @Query() query: PaginationQueryDto,
  ): Promise<ApiResponse<any>> {
    const data = await this.adminService.getCouponRedemptions(id, query);
    return ApiResponse.ok(data);
  }

  // ─── Products ─────────────────────────────────────────────────────────────────

  @Get('products')
  @ApiOperation({ summary: 'List all products' })
  @SwaggerApiResponse({ status: 401, description: 'Unauthorized' })
  async getProducts(): Promise<ApiResponse<any>> {
    const data = await this.adminService.getProducts();
    return ApiResponse.ok(data);
  }

  @Post('products')
  @ApiOperation({ summary: 'Create product' })
  @SwaggerApiResponse({ status: 400, description: 'Validation error' })
  @SwaggerApiResponse({ status: 401, description: 'Unauthorized' })
  async createProduct(@Body() dto: CreateProductDto): Promise<ApiResponse<any>> {
    const data = await this.adminService.createProduct(dto);
    return ApiResponse.ok(data);
  }

  @Patch('products/:id')
  @ApiOperation({ summary: 'Update product' })
  @ApiParam({ name: 'id', type: String })
  @SwaggerApiResponse({ status: 400, description: 'Validation error' })
  @SwaggerApiResponse({ status: 401, description: 'Unauthorized' })
  async updateProduct(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<ApiResponse<any>> {
    const data = await this.adminService.updateProduct(id, dto);
    return ApiResponse.ok(data);
  }

  // ─── Payments ────────────────────────────────────────────────────────────────

  @Get('payments')
  @ApiOperation({ summary: 'List payments with filters' })
  @ApiQuery({ name: 'store', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @SwaggerApiResponse({ status: 401, description: 'Unauthorized' })
  async getPayments(@Query() query: PaymentQueryDto): Promise<ApiResponse<any>> {
    const data = await this.adminService.getPayments(query);
    return ApiResponse.ok(data);
  }

  @Get('payments/:id')
  @ApiOperation({ summary: 'Payment detail' })
  @ApiParam({ name: 'id', type: String })
  @SwaggerApiResponse({ status: 401, description: 'Unauthorized' })
  async getPaymentDetail(@Param('id') id: string): Promise<ApiResponse<any>> {
    const data = await this.adminService.getPaymentDetail(id);
    return ApiResponse.ok(data);
  }
}
