import {
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentPlayer } from '../common/decorators/current-player.decorator.js';
import { PlayerAccount } from '../auth/entities/player-account.entity.js';
import { RewardService } from './reward.service.js';

@ApiTags('Reward')
@ApiBearerAuth('player-jwt')
@Controller('reward')
@UseGuards(JwtAuthGuard)
export class RewardController {
  constructor(private readonly rewardService: RewardService) {}

  @Get('attendance')
  @ApiOperation({ summary: 'Get attendance status (total days, today claimed, next reward)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getAttendanceStatus(@CurrentPlayer() player: PlayerAccount) {
    return this.rewardService.getAttendanceStatus(player.id);
  }

  @Post('attendance/claim')
  @ApiOperation({ summary: 'Claim today attendance reward' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  claimAttendance(@CurrentPlayer() player: PlayerAccount) {
    return this.rewardService.claimAttendance(player.id);
  }

  @Get('first-login')
  @ApiOperation({ summary: 'Check first login bonus status' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getFirstLoginStatus(@CurrentPlayer() player: PlayerAccount) {
    return this.rewardService.getFirstLoginStatus(player.id);
  }

  @Post('first-login/claim')
  @ApiOperation({ summary: 'Claim first login bonus' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  claimFirstLoginBonus(@CurrentPlayer() player: PlayerAccount) {
    return this.rewardService.claimFirstLoginBonus(player.id);
  }
}
