import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiResponse } from '../common/dto/response.dto.js';
import { CurrentPlayer } from '../common/decorators/current-player.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { PlayerAccount } from '../auth/entities/player-account.entity.js';
import { PurchaseResultDto } from './dto/purchase-result.dto.js';
import { VerifyReceiptDto } from './dto/verify-receipt.dto.js';
import { ProductCatalog } from './entities/product-catalog.entity.js';
import { PurchaseLog } from './entities/purchase-log.entity.js';
import { PaymentService } from './payment.service.js';

@ApiTags('Payment')
@ApiBearerAuth('player-jwt')
@Controller('payment')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify IAP receipt and fulfill purchase' })
  @SwaggerApiResponse({ status: 400, description: 'Validation error' })
  @SwaggerApiResponse({ status: 401, description: 'Unauthorized' })
  async verifyReceipt(
    @CurrentPlayer() player: PlayerAccount,
    @Body() dto: VerifyReceiptDto,
  ): Promise<ApiResponse<PurchaseResultDto>> {
    const data = await this.paymentService.verifyAndFulfill(player.id, dto);
    return ApiResponse.ok(data);
  }

  @Get('products')
  @ApiOperation({ summary: 'List active products' })
  @SwaggerApiResponse({ status: 401, description: 'Unauthorized' })
  async getProducts(): Promise<ApiResponse<ProductCatalog[]>> {
    const data = await this.paymentService.getProducts();
    return ApiResponse.ok(data);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get purchase history' })
  @SwaggerApiResponse({ status: 401, description: 'Unauthorized' })
  async getHistory(
    @CurrentPlayer() player: PlayerAccount,
  ): Promise<ApiResponse<PurchaseLog[]>> {
    const data = await this.paymentService.getHistory(player.id);
    return ApiResponse.ok(data);
  }
}
