import {
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentPlayer } from '../common/decorators/current-player.decorator.js';
import { PlayerAccount } from '../auth/entities/player-account.entity.js';
import { RewardService } from './reward.service.js';

@Controller('reward')
@UseGuards(JwtAuthGuard)
export class RewardController {
  constructor(private readonly rewardService: RewardService) {}

  @Get('attendance')
  getAttendanceStatus(@CurrentPlayer() player: PlayerAccount) {
    return this.rewardService.getAttendanceStatus(player.id);
  }

  @Post('attendance/claim')
  claimAttendance(@CurrentPlayer() player: PlayerAccount) {
    return this.rewardService.claimAttendance(player.id);
  }

  @Get('first-login')
  getFirstLoginStatus(@CurrentPlayer() player: PlayerAccount) {
    return this.rewardService.getFirstLoginStatus(player.id);
  }

  @Post('first-login/claim')
  claimFirstLoginBonus(@CurrentPlayer() player: PlayerAccount) {
    return this.rewardService.claimFirstLoginBonus(player.id);
  }
}
