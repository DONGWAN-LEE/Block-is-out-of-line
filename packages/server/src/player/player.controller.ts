import {
  Body,
  Controller,
  Get,
  Patch,
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
import { PlayerService } from './player.service.js';
import { UpdateProfileDto } from './dto/player-profile.dto.js';

@ApiTags('Player')
@ApiBearerAuth('player-jwt')
@Controller('player')
@UseGuards(JwtAuthGuard)
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current player profile with currency balances' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@CurrentPlayer() player: PlayerAccount) {
    return this.playerService.getProfile(player.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update player profile (nickname)' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updateProfile(
    @CurrentPlayer() player: PlayerAccount,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.playerService.updateProfile(player.id, dto);
  }
}
