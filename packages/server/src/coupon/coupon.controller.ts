import {
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentPlayer } from '../common/decorators/current-player.decorator.js';
import { PlayerAccount } from '../auth/entities/player-account.entity.js';
import { CouponService } from './coupon.service.js';
import { RedeemCouponDto } from './dto/redeem-coupon.dto.js';

@Controller('coupon')
@UseGuards(JwtAuthGuard)
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post('redeem')
  redeemCoupon(
    @CurrentPlayer() player: PlayerAccount,
    @Body() dto: RedeemCouponDto,
  ) {
    return this.couponService.redeemCoupon(player.id, dto);
  }
}
