import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentPlayer } from '../common/decorators/current-player.decorator.js';
import { PlayerAccount } from '../auth/entities/player-account.entity.js';
import { PlayerService } from './player.service.js';
import { UpdateProfileDto } from './dto/player-profile.dto.js';

@Controller('player')
@UseGuards(JwtAuthGuard)
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Get('me')
  getProfile(@CurrentPlayer() player: PlayerAccount) {
    return this.playerService.getProfile(player.id);
  }

  @Patch('me')
  updateProfile(
    @CurrentPlayer() player: PlayerAccount,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.playerService.updateProfile(player.id, dto);
  }
}
