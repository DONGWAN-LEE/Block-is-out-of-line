import {
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentPlayer } from '../common/decorators/current-player.decorator.js';
import { PlayerAccount } from '../auth/entities/player-account.entity.js';
import { CouponService } from './coupon.service.js';
import { RedeemCouponDto } from './dto/redeem-coupon.dto.js';

@ApiTags('Coupon')
@ApiBearerAuth('player-jwt')
@Controller('coupon')
@UseGuards(JwtAuthGuard)
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post('redeem')
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @ApiOperation({ summary: 'Redeem a coupon code' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  redeemCoupon(
    @CurrentPlayer() player: PlayerAccount,
    @Body() dto: RedeemCouponDto,
  ) {
    return this.couponService.redeemCoupon(player.id, dto);
  }
}
