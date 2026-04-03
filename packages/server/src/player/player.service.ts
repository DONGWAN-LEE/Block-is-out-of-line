import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerAccount } from '../auth/entities/player-account.entity.js';
import { CurrencyService } from '../currency/currency.service.js';
import { ErrorCodes } from '../common/constants/error-codes.js';
import { PlayerProfileResponseDto, UpdateProfileDto } from './dto/player-profile.dto.js';

@Injectable()
export class PlayerService {
  constructor(
    @InjectRepository(PlayerAccount)
    private readonly playerAccountRepository: Repository<PlayerAccount>,
    private readonly currencyService: CurrencyService,
  ) {}

  async getProfile(playerId: string): Promise<PlayerProfileResponseDto> {
    const player = await this.playerAccountRepository.findOne({ where: { id: playerId } });
    if (!player) {
      throw new HttpException(
        { code: ErrorCodes.PLAYER_001.code, message: ErrorCodes.PLAYER_001.message },
        HttpStatus.NOT_FOUND,
      );
    }

    const balances = await this.currencyService.getBalances(playerId);
    const diamond = balances.find((b) => b.currencyType === 'diamond')?.balance ?? '0';
    const gold = balances.find((b) => b.currencyType === 'gold')?.balance ?? '0';

    return {
      id: player.id,
      nickname: player.nickname,
      level: player.level,
      createdAt: player.createdAt,
      currencies: { diamond, gold },
    };
  }

  async updateProfile(playerId: string, dto: UpdateProfileDto): Promise<PlayerProfileResponseDto> {
    const player = await this.playerAccountRepository.findOne({ where: { id: playerId } });
    if (!player) {
      throw new HttpException(
        { code: ErrorCodes.PLAYER_001.code, message: ErrorCodes.PLAYER_001.message },
        HttpStatus.NOT_FOUND,
      );
    }

    if (dto.nickname !== undefined) {
      const existing = await this.playerAccountRepository.findOne({
        where: { nickname: dto.nickname },
      });
      if (existing && existing.id !== playerId) {
        throw new HttpException(
          { code: ErrorCodes.PLAYER_002.code, message: ErrorCodes.PLAYER_002.message },
          HttpStatus.CONFLICT,
        );
      }
      player.nickname = dto.nickname;
      await this.playerAccountRepository.save(player);
    }

    return this.getProfile(playerId);
  }
}
